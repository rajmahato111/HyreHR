import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook, WebhookLog, WebhookEvent, WebhookStatus, WebhookLogStatus } from '../../database/entities';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(Webhook)
    private webhookRepository: Repository<Webhook>,
    @InjectRepository(WebhookLog)
    private webhookLogRepository: Repository<WebhookLog>,
  ) {}

  async create(
    organizationId: string,
    createDto: CreateWebhookDto,
  ): Promise<Webhook> {
    try {
      // Generate secret if not provided
      const secret = createDto.secret || this.generateSecret();

      const webhook = this.webhookRepository.create({
        organizationId,
        ...createDto,
        secret,
        status: WebhookStatus.ACTIVE,
      });

      const saved = await this.webhookRepository.save(webhook);
      this.logger.log(`Created webhook ${saved.id} for organization ${organizationId}`);

      return saved;
    } catch (error) {
      this.logger.error('Failed to create webhook', error);
      throw new BadRequestException('Failed to create webhook');
    }
  }

  async findAll(organizationId: string): Promise<Webhook[]> {
    return this.webhookRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOne({
      where: { id, organizationId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async findByEvent(
    organizationId: string,
    event: WebhookEvent,
  ): Promise<Webhook[]> {
    const webhooks = await this.webhookRepository
      .createQueryBuilder('webhook')
      .where('webhook.organizationId = :organizationId', { organizationId })
      .andWhere('webhook.status = :status', { status: WebhookStatus.ACTIVE })
      .andWhere(':event = ANY(webhook.events)', { event })
      .getMany();

    return webhooks;
  }

  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateWebhookDto,
  ): Promise<Webhook> {
    const webhook = await this.findOne(id, organizationId);

    Object.assign(webhook, updateDto);
    webhook.updatedAt = new Date();

    const updated = await this.webhookRepository.save(webhook);
    this.logger.log(`Updated webhook ${id}`);

    return updated;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const webhook = await this.findOne(id, organizationId);
    await this.webhookRepository.remove(webhook);
    this.logger.log(`Deleted webhook ${id}`);
  }

  async trigger(
    organizationId: string,
    event: WebhookEvent,
    payload: Record<string, any>,
  ): Promise<void> {
    const webhooks = await this.findByEvent(organizationId, event);

    if (webhooks.length === 0) {
      this.logger.debug(`No webhooks found for event ${event} in organization ${organizationId}`);
      return;
    }

    this.logger.log(`Triggering ${webhooks.length} webhooks for event ${event}`);

    // Trigger all webhooks in parallel
    await Promise.all(
      webhooks.map((webhook) => this.executeWebhook(webhook, event, payload)),
    );
  }

  private async executeWebhook(
    webhook: Webhook,
    event: WebhookEvent,
    payload: Record<string, any>,
  ): Promise<void> {
    const log = this.webhookLogRepository.create({
      webhookId: webhook.id,
      event,
      payload,
      status: WebhookLogStatus.PENDING,
    });

    await this.webhookLogRepository.save(log);

    // Execute webhook asynchronously
    this.sendWebhook(webhook, log, payload).catch((error) => {
      this.logger.error(`Failed to execute webhook ${webhook.id}`, error);
    });
  }

  private async sendWebhook(
    webhook: Webhook,
    log: WebhookLog,
    payload: Record<string, any>,
  ): Promise<void> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < webhook.retryAttempts) {
      attempt++;
      log.attemptCount = attempt;
      log.status = WebhookLogStatus.RETRYING;
      await this.webhookLogRepository.save(log);

      try {
        const signature = this.generateSignature(payload, webhook.secret);

        const headers = {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': log.event,
          'X-Webhook-Id': webhook.id,
          'X-Webhook-Attempt': attempt.toString(),
          ...webhook.headers,
        };

        const response = await axios.post(webhook.url, payload, {
          headers,
          timeout: webhook.timeoutMs,
        });

        // Success
        log.status = WebhookLogStatus.SUCCESS;
        log.responseStatus = response.status;
        log.responseBody = JSON.stringify(response.data).substring(0, 10000);
        log.durationMs = Date.now() - startTime;
        log.completedAt = new Date();

        webhook.lastTriggeredAt = new Date();
        webhook.lastSuccessAt = new Date();
        webhook.successCount++;

        await this.webhookRepository.save(webhook);
        await this.webhookLogRepository.save(log);

        this.logger.log(`Webhook ${webhook.id} executed successfully`);
        return;
      } catch (error) {
        const isLastAttempt = attempt >= webhook.retryAttempts;

        log.error = error.message;
        log.responseStatus = error.response?.status;
        log.responseBody = error.response?.data
          ? JSON.stringify(error.response.data).substring(0, 10000)
          : null;

        if (isLastAttempt) {
          log.status = WebhookLogStatus.FAILED;
          log.durationMs = Date.now() - startTime;
          log.completedAt = new Date();

          webhook.lastTriggeredAt = new Date();
          webhook.lastFailureAt = new Date();
          webhook.lastError = error.message;
          webhook.failureCount++;

          // Disable webhook after too many failures
          if (webhook.failureCount >= 10) {
            webhook.status = WebhookStatus.FAILED;
            this.logger.warn(`Webhook ${webhook.id} disabled after ${webhook.failureCount} failures`);
          }

          await this.webhookRepository.save(webhook);
          await this.webhookLogRepository.save(log);

          this.logger.error(`Webhook ${webhook.id} failed after ${attempt} attempts`, error);
        } else {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  async getLogs(
    webhookId: string,
    organizationId: string,
    limit: number = 100,
  ): Promise<WebhookLog[]> {
    const webhook = await this.findOne(webhookId, organizationId);

    return this.webhookLogRepository.find({
      where: { webhookId: webhook.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getLogStats(
    webhookId: string,
    organizationId: string,
  ): Promise<{
    total: number;
    success: number;
    failed: number;
    pending: number;
    successRate: number;
  }> {
    const webhook = await this.findOne(webhookId, organizationId);

    const [total, success, failed, pending] = await Promise.all([
      this.webhookLogRepository.count({ where: { webhookId: webhook.id } }),
      this.webhookLogRepository.count({
        where: { webhookId: webhook.id, status: WebhookLogStatus.SUCCESS },
      }),
      this.webhookLogRepository.count({
        where: { webhookId: webhook.id, status: WebhookLogStatus.FAILED },
      }),
      this.webhookLogRepository.count({
        where: { webhookId: webhook.id, status: WebhookLogStatus.PENDING },
      }),
    ]);

    const successRate = total > 0 ? (success / total) * 100 : 0;

    return {
      total,
      success,
      failed,
      pending,
      successRate,
    };
  }

  async testWebhook(
    id: string,
    organizationId: string,
  ): Promise<{ success: boolean; message: string; responseStatus?: number }> {
    const webhook = await this.findOne(id, organizationId);

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook',
      },
    };

    try {
      const signature = this.generateSignature(testPayload, webhook.secret);

      const response = await axios.post(webhook.url, testPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'webhook.test',
          'X-Webhook-Id': webhook.id,
          ...webhook.headers,
        },
        timeout: webhook.timeoutMs,
      });

      return {
        success: true,
        message: 'Webhook test successful',
        responseStatus: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        responseStatus: error.response?.status,
      };
    }
  }

  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  verifySignature(payload: any, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
