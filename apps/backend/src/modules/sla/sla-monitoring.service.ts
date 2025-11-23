import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  SlaRule,
  SlaViolation,
  SlaRuleType,
  SlaEntityType,
  SlaViolationStatus,
  Application,
  Interview,
  Offer,
} from '../../database/entities';

@Injectable()
export class SlaMonitoringService {
  private readonly logger = new Logger(SlaMonitoringService.name);

  constructor(
    @InjectRepository(SlaRule)
    private slaRuleRepository: Repository<SlaRule>,
    @InjectRepository(SlaViolation)
    private slaViolationRepository: Repository<SlaViolation>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
  ) {}

  // Run every 15 minutes
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkSlaCompliance(): Promise<void> {
    this.logger.log('Starting SLA compliance check...');

    try {
      const activeRules = await this.slaRuleRepository.find({
        where: { active: true },
      });

      for (const rule of activeRules) {
        await this.checkRuleCompliance(rule);
      }

      this.logger.log('SLA compliance check completed');
    } catch (error) {
      this.logger.error('Error checking SLA compliance', error);
    }
  }

  // Run every hour to check for escalations
  @Cron(CronExpression.EVERY_HOUR)
  async checkEscalations(): Promise<void> {
    this.logger.log('Checking for SLA escalations...');

    try {
      const violations = await this.slaViolationRepository.find({
        where: {
          status: SlaViolationStatus.OPEN,
          escalated: false,
        },
        relations: ['slaRule'],
      });

      for (const violation of violations) {
        if (violation.slaRule.escalationHours) {
          const hoursSinceViolation =
            (Date.now() - violation.violatedAt.getTime()) / (1000 * 60 * 60);

          if (hoursSinceViolation >= violation.slaRule.escalationHours) {
            await this.escalateViolation(violation);
          }
        }
      }

      this.logger.log('Escalation check completed');
    } catch (error) {
      this.logger.error('Error checking escalations', error);
    }
  }

  private async checkRuleCompliance(rule: SlaRule): Promise<void> {
    switch (rule.type) {
      case SlaRuleType.TIME_TO_FIRST_REVIEW:
        await this.checkTimeToFirstReview(rule);
        break;
      case SlaRuleType.TIME_TO_SCHEDULE_INTERVIEW:
        await this.checkTimeToScheduleInterview(rule);
        break;
      case SlaRuleType.TIME_TO_PROVIDE_FEEDBACK:
        await this.checkTimeToProvideFeedback(rule);
        break;
      case SlaRuleType.TIME_TO_OFFER:
        await this.checkTimeToOffer(rule);
        break;
      case SlaRuleType.TIME_TO_HIRE:
        await this.checkTimeToHire(rule);
        break;
    }
  }

  private async checkTimeToFirstReview(rule: SlaRule): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - rule.thresholdHours);

    const query = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoin('app.job', 'job')
      .where('app.appliedAt < :thresholdDate', { thresholdDate })
      .andWhere('app.status = :status', { status: 'active' })
      .andWhere('job.organizationId = :organizationId', {
        organizationId: rule.organizationId,
      });

    // Apply job/department filters
    if (rule.jobIds && rule.jobIds.length > 0) {
      query.andWhere('app.jobId IN (:...jobIds)', { jobIds: rule.jobIds });
    }

    if (rule.departmentIds && rule.departmentIds.length > 0) {
      query.andWhere('job.departmentId IN (:...departmentIds)', {
        departmentIds: rule.departmentIds,
      });
    }

    // Check if still in initial stage (no stage changes)
    query.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('COUNT(*)')
        .from('application_history', 'ah')
        .where('ah.applicationId = app.id')
        .getQuery();
      return `(${subQuery}) = 0`;
    });

    const applications = await query.getMany();

    for (const application of applications) {
      await this.createOrUpdateViolation(
        rule,
        SlaEntityType.APPLICATION,
        application.id,
        application.appliedAt,
      );
    }
  }

  private async checkTimeToScheduleInterview(rule: SlaRule): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - rule.thresholdHours);

    const query = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoin('app.job', 'job')
      .leftJoin('app.interviews', 'interview')
      .where('app.stageEnteredAt < :thresholdDate', { thresholdDate })
      .andWhere('app.status = :status', { status: 'active' })
      .andWhere('job.organizationId = :organizationId', {
        organizationId: rule.organizationId,
      })
      .andWhere('interview.id IS NULL'); // No interview scheduled

    if (rule.jobIds && rule.jobIds.length > 0) {
      query.andWhere('app.jobId IN (:...jobIds)', { jobIds: rule.jobIds });
    }

    if (rule.departmentIds && rule.departmentIds.length > 0) {
      query.andWhere('job.departmentId IN (:...departmentIds)', {
        departmentIds: rule.departmentIds,
      });
    }

    const applications = await query.getMany();

    for (const application of applications) {
      await this.createOrUpdateViolation(
        rule,
        SlaEntityType.APPLICATION,
        application.id,
        application.stageEnteredAt,
      );
    }
  }

  private async checkTimeToProvideFeedback(rule: SlaRule): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - rule.thresholdHours);

    const query = this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoin('interview.application', 'app')
      .leftJoin('app.job', 'job')
      .leftJoin('interview.feedback', 'feedback')
      .where('interview.scheduledAt < :thresholdDate', { thresholdDate })
      .andWhere('interview.status = :status', { status: 'completed' })
      .andWhere('job.organizationId = :organizationId', {
        organizationId: rule.organizationId,
      })
      .andWhere('feedback.id IS NULL'); // No feedback provided

    if (rule.jobIds && rule.jobIds.length > 0) {
      query.andWhere('app.jobId IN (:...jobIds)', { jobIds: rule.jobIds });
    }

    if (rule.departmentIds && rule.departmentIds.length > 0) {
      query.andWhere('job.departmentId IN (:...departmentIds)', {
        departmentIds: rule.departmentIds,
      });
    }

    const interviews = await query.getMany();

    for (const interview of interviews) {
      await this.createOrUpdateViolation(
        rule,
        SlaEntityType.INTERVIEW,
        interview.id,
        interview.scheduledAt,
      );
    }
  }

  private async checkTimeToOffer(rule: SlaRule): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - rule.thresholdHours);

    const query = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoin('app.job', 'job')
      .leftJoin('app.offers', 'offer')
      .where('app.stageEnteredAt < :thresholdDate', { thresholdDate })
      .andWhere('app.status = :status', { status: 'active' })
      .andWhere('job.organizationId = :organizationId', {
        organizationId: rule.organizationId,
      })
      .andWhere('offer.id IS NULL'); // No offer created

    if (rule.jobIds && rule.jobIds.length > 0) {
      query.andWhere('app.jobId IN (:...jobIds)', { jobIds: rule.jobIds });
    }

    if (rule.departmentIds && rule.departmentIds.length > 0) {
      query.andWhere('job.departmentId IN (:...departmentIds)', {
        departmentIds: rule.departmentIds,
      });
    }

    const applications = await query.getMany();

    for (const application of applications) {
      await this.createOrUpdateViolation(
        rule,
        SlaEntityType.APPLICATION,
        application.id,
        application.stageEnteredAt,
      );
    }
  }

  private async checkTimeToHire(rule: SlaRule): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - rule.thresholdHours);

    const query = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoin('app.job', 'job')
      .where('app.appliedAt < :thresholdDate', { thresholdDate })
      .andWhere('app.status = :status', { status: 'active' })
      .andWhere('job.organizationId = :organizationId', {
        organizationId: rule.organizationId,
      })
      .andWhere('app.hiredAt IS NULL');

    if (rule.jobIds && rule.jobIds.length > 0) {
      query.andWhere('app.jobId IN (:...jobIds)', { jobIds: rule.jobIds });
    }

    if (rule.departmentIds && rule.departmentIds.length > 0) {
      query.andWhere('job.departmentId IN (:...departmentIds)', {
        departmentIds: rule.departmentIds,
      });
    }

    const applications = await query.getMany();

    for (const application of applications) {
      await this.createOrUpdateViolation(
        rule,
        SlaEntityType.APPLICATION,
        application.id,
        application.appliedAt,
      );
    }
  }

  private async createOrUpdateViolation(
    rule: SlaRule,
    entityType: SlaEntityType,
    entityId: string,
    startDate: Date,
  ): Promise<void> {
    // Check if violation already exists
    const existing = await this.slaViolationRepository.findOne({
      where: {
        slaRuleId: rule.id,
        entityType,
        entityId,
      },
    });

    if (existing) {
      // Update actual hours
      const actualHours =
        (Date.now() - startDate.getTime()) / (1000 * 60 * 60);
      existing.actualHours = actualHours;
      await this.slaViolationRepository.save(existing);
      return;
    }

    // Create new violation
    const expectedAt = new Date(startDate);
    expectedAt.setHours(expectedAt.getHours() + rule.thresholdHours);

    const actualHours = (Date.now() - startDate.getTime()) / (1000 * 60 * 60);

    const violation = this.slaViolationRepository.create({
      slaRuleId: rule.id,
      entityType,
      entityId,
      violatedAt: new Date(),
      expectedAt,
      actualHours,
      status: SlaViolationStatus.OPEN,
    });

    await this.slaViolationRepository.save(violation);

    // Send alert notification
    await this.sendAlertNotification(rule, violation);

    this.logger.log(
      `Created SLA violation for ${entityType} ${entityId} (rule: ${rule.name})`,
    );
  }

  private async escalateViolation(violation: SlaViolation): Promise<void> {
    violation.escalated = true;
    violation.escalatedAt = new Date();
    await this.slaViolationRepository.save(violation);

    // Send escalation notification
    await this.sendEscalationNotification(violation);

    this.logger.log(`Escalated SLA violation ${violation.id}`);
  }

  private async sendAlertNotification(
    rule: SlaRule,
    violation: SlaViolation,
  ): Promise<void> {
    // TODO: Integrate with notification service
    // This would send emails/slack messages to rule.alertRecipients
    this.logger.log(
      `Alert notification for violation ${violation.id} to ${rule.alertRecipients.join(', ')}`,
    );
  }

  private async sendEscalationNotification(
    violation: SlaViolation,
  ): Promise<void> {
    const rule = await this.slaRuleRepository.findOne({
      where: { id: violation.slaRuleId },
    });

    if (!rule) return;

    // TODO: Integrate with notification service
    // This would send emails/slack messages to rule.escalationRecipients
    this.logger.log(
      `Escalation notification for violation ${violation.id} to ${rule.escalationRecipients.join(', ')}`,
    );
  }

  async acknowledgeViolation(
    violationId: string,
    userId: string,
  ): Promise<SlaViolation> {
    const violation = await this.slaViolationRepository.findOne({
      where: { id: violationId },
    });

    if (!violation) {
      throw new Error('Violation not found');
    }

    violation.status = SlaViolationStatus.ACKNOWLEDGED;
    violation.acknowledgedAt = new Date();
    violation.acknowledgedBy = userId;

    return this.slaViolationRepository.save(violation);
  }

  async resolveViolation(
    violationId: string,
    userId: string,
    notes?: string,
  ): Promise<SlaViolation> {
    const violation = await this.slaViolationRepository.findOne({
      where: { id: violationId },
    });

    if (!violation) {
      throw new Error('Violation not found');
    }

    violation.status = SlaViolationStatus.RESOLVED;
    violation.resolvedAt = new Date();
    violation.resolvedBy = userId;
    if (notes) {
      violation.notes = notes;
    }

    return this.slaViolationRepository.save(violation);
  }
}
