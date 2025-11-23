import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationStatus } from '../../database/entities';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { EncryptionService } from '../../common/services/encryption.service';

@Injectable()
export class IntegrationConfigService {
  private readonly logger = new Logger(IntegrationConfigService.name);

  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    private encryptionService: EncryptionService,
  ) {}

  async create(
    organizationId: string,
    createDto: CreateIntegrationDto,
  ): Promise<Integration> {
    try {
      // Encrypt sensitive credentials
      const encryptedCredentials = createDto.credentials
        ? await this.encryptCredentials(createDto.credentials)
        : {};

      const integration = this.integrationRepository.create({
        organizationId,
        ...createDto,
        credentials: encryptedCredentials,
        status: IntegrationStatus.PENDING,
      });

      const saved = await this.integrationRepository.save(integration);
      this.logger.log(`Created integration ${saved.id} for organization ${organizationId}`);

      return saved;
    } catch (error) {
      this.logger.error('Failed to create integration', error);
      throw new BadRequestException('Failed to create integration');
    }
  }

  async findAll(organizationId: string): Promise<Integration[]> {
    return this.integrationRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Integration> {
    const integration = await this.integrationRepository.findOne({
      where: { id, organizationId },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  async findByProvider(
    organizationId: string,
    provider: string,
  ): Promise<Integration[]> {
    return this.integrationRepository.find({
      where: { organizationId, provider: provider as any },
    });
  }

  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateIntegrationDto,
  ): Promise<Integration> {
    const integration = await this.findOne(id, organizationId);

    // Encrypt credentials if provided
    if (updateDto.credentials) {
      updateDto.credentials = await this.encryptCredentials(updateDto.credentials);
    }

    Object.assign(integration, updateDto);
    integration.updatedAt = new Date();

    const updated = await this.integrationRepository.save(integration);
    this.logger.log(`Updated integration ${id}`);

    return updated;
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: IntegrationStatus,
    error?: string,
  ): Promise<Integration> {
    const integration = await this.findOne(id, organizationId);

    integration.status = status;
    if (error) {
      integration.lastError = error;
      integration.lastErrorAt = new Date();
    }

    return this.integrationRepository.save(integration);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const integration = await this.findOne(id, organizationId);
    await this.integrationRepository.remove(integration);
    this.logger.log(`Deleted integration ${id}`);
  }

  async getCredentials(
    id: string,
    organizationId: string,
  ): Promise<Record<string, any>> {
    const integration = await this.integrationRepository
      .createQueryBuilder('integration')
      .addSelect('integration.credentials')
      .where('integration.id = :id', { id })
      .andWhere('integration.organizationId = :organizationId', { organizationId })
      .getOne();

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    // Decrypt credentials
    return this.decryptCredentials(integration.credentials);
  }

  async updateCredentials(
    id: string,
    organizationId: string,
    credentials: Record<string, any>,
  ): Promise<void> {
    const integration = await this.findOne(id, organizationId);

    const encryptedCredentials = await this.encryptCredentials(credentials);
    integration.credentials = encryptedCredentials;

    await this.integrationRepository.save(integration);
    this.logger.log(`Updated credentials for integration ${id}`);
  }

  async recordSync(id: string, organizationId: string): Promise<void> {
    const integration = await this.findOne(id, organizationId);
    integration.lastSyncAt = new Date();
    await this.integrationRepository.save(integration);
  }

  async recordHealthCheck(
    id: string,
    organizationId: string,
    status: string,
    error?: string,
  ): Promise<void> {
    const integration = await this.findOne(id, organizationId);
    integration.lastHealthCheckAt = new Date();
    integration.healthStatus = status;

    if (error) {
      integration.lastError = error;
      integration.lastErrorAt = new Date();
    }

    await this.integrationRepository.save(integration);
  }

  private async encryptCredentials(
    credentials: Record<string, any>,
  ): Promise<Record<string, any>> {
    const encrypted: Record<string, any> = {};

    for (const [key, value] of Object.entries(credentials)) {
      if (typeof value === 'string') {
        encrypted[key] = await this.encryptionService.encrypt(value);
      } else {
        encrypted[key] = value;
      }
    }

    return encrypted;
  }

  private async decryptCredentials(
    credentials: Record<string, any>,
  ): Promise<Record<string, any>> {
    const decrypted: Record<string, any> = {};

    for (const [key, value] of Object.entries(credentials)) {
      if (typeof value === 'string') {
        try {
          decrypted[key] = await this.encryptionService.decrypt(value);
        } catch {
          // If decryption fails, return as-is (might not be encrypted)
          decrypted[key] = value;
        }
      } else {
        decrypted[key] = value;
      }
    }

    return decrypted;
  }
}
