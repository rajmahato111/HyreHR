import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Candidate } from '../../database/entities/candidate.entity';
import { Communication } from '../../database/entities/communication.entity';
import { Application } from '../../database/entities/application.entity';
import { Interview } from '../../database/entities/interview.entity';
import { DataRetentionPolicy } from '../../database/entities/data-retention-policy.entity';
import { EncryptionService } from './encryption.service';
import { AuditLogService } from './audit-log.service';

export interface DataExportResult {
  candidate: any;
  applications: any[];
  interviews: any[];
  communications: any[];
  exportedAt: Date;
}

export interface RetentionPolicyDto {
  entityType: string;
  retentionPeriodDays: number;
  autoDelete: boolean;
  notifyBeforeDays: number;
  description?: string;
}

@Injectable()
export class GDPRService {
  private readonly logger = new Logger(GDPRService.name);

  constructor(
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
    @InjectRepository(DataRetentionPolicy)
    private retentionPolicyRepository: Repository<DataRetentionPolicy>,
    private encryptionService: EncryptionService,
    private auditLogService: AuditLogService,
    private dataSource: DataSource,
  ) {}

  /**
   * Export all data for a candidate (Right to Access)
   */
  async exportCandidateData(
    candidateId: string,
    organizationId: string,
  ): Promise<DataExportResult> {
    // Get candidate
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, organizationId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Get applications
    const applications = await this.applicationRepository.find({
      where: { candidateId, job: { organizationId } },
      relations: ['job', 'stage'],
    });

    // Get interviews
    const interviews = await this.interviewRepository
      .createQueryBuilder('interview')
      .innerJoin('interview.application', 'application')
      .where('application.candidate_id = :candidateId', { candidateId })
      .getMany();

    // Get communications
    const communications = await this.communicationRepository.find({
      where: { candidateId },
    });

    // Log the export
    await this.auditLogService.log({
      organizationId,
      action: 'export',
      entityType: 'candidate',
      entityId: candidateId,
      metadata: {
        type: 'gdpr_data_export',
        recordCount: {
          applications: applications.length,
          interviews: interviews.length,
          communications: communications.length,
        },
      },
    });

    return {
      candidate: this.sanitizeForExport(candidate),
      applications: applications.map((app) => this.sanitizeForExport(app)),
      interviews: interviews.map((interview) => this.sanitizeForExport(interview)),
      communications: communications.map((comm) => this.sanitizeForExport(comm)),
      exportedAt: new Date(),
    };
  }

  /**
   * Delete/anonymize candidate data (Right to Erasure)
   */
  async deleteCandidateData(
    candidateId: string,
    organizationId: string,
    userId?: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const candidate = await manager.findOne(Candidate, {
        where: { id: candidateId, organizationId },
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Anonymize candidate data instead of deleting to maintain referential integrity
      candidate.firstName = 'Deleted';
      candidate.lastName = 'User';
      candidate.email = this.encryptionService.anonymizeEmail(candidate.email);
      candidate.phone = null as any;
      candidate.locationCity = null as any;
      candidate.locationState = null as any;
      candidate.locationCountry = null as any;
      candidate.currentCompany = null as any;
      candidate.currentTitle = null as any;
      candidate.linkedinUrl = null as any;
      candidate.githubUrl = null as any;
      candidate.portfolioUrl = null as any;
      candidate.tags = [];
      candidate.customFields = {};
      candidate.gdprConsent = false;

      // Mark as anonymized
      (candidate as any).anonymized = true;
      (candidate as any).gdprDeletedAt = new Date();

      await manager.save(candidate);

      // Delete communications
      await manager.delete(Communication, { candidateId });

      // Log the deletion
      await this.auditLogService.log({
        organizationId,
        userId,
        action: 'delete',
        entityType: 'candidate',
        entityId: candidateId,
        metadata: {
          type: 'gdpr_data_deletion',
          reason: 'right_to_erasure',
        },
      });
    });
  }

  /**
   * Record consent
   */
  async recordConsent(
    candidateId: string,
    organizationId: string,
    consentType: string,
  ): Promise<void> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, organizationId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    candidate.gdprConsent = true;
    candidate.gdprConsentDate = new Date();
    (candidate as any).gdprConsentType = consentType;

    await this.candidateRepository.save(candidate);

    // Log consent
    await this.auditLogService.log({
      organizationId,
      action: 'update',
      entityType: 'candidate',
      entityId: candidateId,
      metadata: {
        type: 'gdpr_consent_recorded',
        consentType,
      },
    });
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(
    candidateId: string,
    organizationId: string,
  ): Promise<void> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, organizationId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    candidate.gdprConsent = false;

    await this.candidateRepository.save(candidate);

    // Log consent withdrawal
    await this.auditLogService.log({
      organizationId,
      action: 'update',
      entityType: 'candidate',
      entityId: candidateId,
      metadata: {
        type: 'gdpr_consent_withdrawn',
      },
    });
  }

  /**
   * Check if candidate has given consent
   */
  async hasConsent(candidateId: string, organizationId: string): Promise<boolean> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, organizationId },
      select: ['id', 'gdprConsent'],
    });

    return candidate?.gdprConsent || false;
  }

  /**
   * Get data retention policy status
   */
  async getRetentionStatus(
    candidateId: string,
    organizationId: string,
  ): Promise<{
    candidateId: string;
    createdAt: Date;
    lastActivity: Date;
    retentionPeriodDays: number;
    shouldBeDeleted: boolean;
    daysUntilDeletion: number;
  }> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, organizationId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Get last activity (most recent application, interview, or communication)
    const lastApplication = await this.applicationRepository.findOne({
      where: { candidateId },
      order: { createdAt: 'DESC' },
    });

    const lastCommunication = await this.communicationRepository.findOne({
      where: { candidateId },
      order: { createdAt: 'DESC' },
    });

    const activities = [
      candidate.updatedAt,
      lastApplication?.createdAt,
      lastCommunication?.createdAt,
    ].filter((date): date is Date => date !== undefined && date !== null);

    const lastActivity = activities.length > 0
      ? activities.sort((a, b) => b.getTime() - a.getTime())[0]
      : candidate.createdAt;

    // Default retention period: 3 years (1095 days)
    const retentionPeriodDays = 1095;
    const daysSinceLastActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysUntilDeletion = retentionPeriodDays - daysSinceLastActivity;

    return {
      candidateId,
      createdAt: candidate.createdAt,
      lastActivity,
      retentionPeriodDays,
      shouldBeDeleted: daysUntilDeletion <= 0,
      daysUntilDeletion: Math.max(0, daysUntilDeletion),
    };
  }

  /**
   * Create or update data retention policy
   */
  async createRetentionPolicy(
    organizationId: string,
    policyDto: RetentionPolicyDto,
  ): Promise<DataRetentionPolicy> {
    const policy = this.retentionPolicyRepository.create({
      organizationId,
      ...policyDto,
    });

    const savedPolicy = await this.retentionPolicyRepository.save(policy);

    await this.auditLogService.log({
      organizationId,
      action: 'create',
      entityType: 'data_retention_policy',
      entityId: savedPolicy.id,
      metadata: {
        entityType: policyDto.entityType,
        retentionPeriodDays: policyDto.retentionPeriodDays,
      },
    });

    return savedPolicy;
  }

  /**
   * Get retention policies for an organization
   */
  async getRetentionPolicies(
    organizationId: string,
  ): Promise<DataRetentionPolicy[]> {
    return this.retentionPolicyRepository.find({
      where: { organizationId, active: true },
      order: { entityType: 'ASC' },
    });
  }

  /**
   * Update retention policy
   */
  async updateRetentionPolicy(
    policyId: string,
    organizationId: string,
    updates: Partial<RetentionPolicyDto>,
  ): Promise<DataRetentionPolicy> {
    const policy = await this.retentionPolicyRepository.findOne({
      where: { id: policyId, organizationId },
    });

    if (!policy) {
      throw new Error('Retention policy not found');
    }

    Object.assign(policy, updates);
    const updatedPolicy = await this.retentionPolicyRepository.save(policy);

    await this.auditLogService.log({
      organizationId,
      action: 'update',
      entityType: 'data_retention_policy',
      entityId: policyId,
      metadata: { updates },
    });

    return updatedPolicy;
  }

  /**
   * Delete retention policy
   */
  async deleteRetentionPolicy(
    policyId: string,
    organizationId: string,
  ): Promise<void> {
    const policy = await this.retentionPolicyRepository.findOne({
      where: { id: policyId, organizationId },
    });

    if (!policy) {
      throw new Error('Retention policy not found');
    }

    await this.retentionPolicyRepository.remove(policy);

    await this.auditLogService.log({
      organizationId,
      action: 'delete',
      entityType: 'data_retention_policy',
      entityId: policyId,
    });
  }

  /**
   * Get candidates that should be deleted based on retention policies
   */
  async getCandidatesForDeletion(
    organizationId: string,
  ): Promise<Array<{ candidate: Candidate; policy: DataRetentionPolicy; daysOverdue: number }>> {
    const policy = await this.retentionPolicyRepository.findOne({
      where: {
        organizationId,
        entityType: 'candidate',
        active: true,
      },
    });

    if (!policy) {
      return [];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriodDays);

    // Find candidates with no recent activity
    const candidates = await this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.organization_id = :organizationId', { organizationId })
      .andWhere('candidate.anonymized = false')
      .andWhere('candidate.updated_at < :cutoffDate', { cutoffDate })
      .getMany();

    const result = [];

    for (const candidate of candidates) {
      const retentionStatus = await this.getRetentionStatus(
        candidate.id,
        organizationId,
      );

      if (retentionStatus.shouldBeDeleted) {
        result.push({
          candidate,
          policy,
          daysOverdue: Math.abs(retentionStatus.daysUntilDeletion),
        });
      }
    }

    return result;
  }

  /**
   * Scheduled job to auto-delete candidates based on retention policies
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async autoDeleteExpiredData(): Promise<void> {
    this.logger.log('Starting auto-delete job for expired candidate data');

    try {
      // Get all organizations with auto-delete enabled
      const policies = await this.retentionPolicyRepository.find({
        where: {
          entityType: 'candidate',
          autoDelete: true,
          active: true,
        },
      });

      let totalDeleted = 0;

      for (const policy of policies) {
        const candidatesForDeletion = await this.getCandidatesForDeletion(
          policy.organizationId,
        );

        this.logger.log(
          `Found ${candidatesForDeletion.length} candidates for deletion in organization ${policy.organizationId}`,
        );

        for (const { candidate } of candidatesForDeletion) {
          try {
            await this.deleteCandidateData(
              candidate.id,
              policy.organizationId,
              undefined, // System-initiated
            );
            totalDeleted++;
          } catch (error) {
            this.logger.error(
              `Failed to delete candidate ${candidate.id}: ${error.message}`,
            );
          }
        }
      }

      this.logger.log(
        `Auto-delete job completed. Deleted ${totalDeleted} candidates.`,
      );
    } catch (error) {
      this.logger.error(`Auto-delete job failed: ${error.message}`);
    }
  }

  /**
   * Get candidates approaching deletion (for notifications)
   */
  async getCandidatesApproachingDeletion(
    organizationId: string,
  ): Promise<Array<{ candidate: Candidate; daysUntilDeletion: number }>> {
    const policy = await this.retentionPolicyRepository.findOne({
      where: {
        organizationId,
        entityType: 'candidate',
        active: true,
      },
    });

    if (!policy) {
      return [];
    }

    const notifyDate = new Date();
    notifyDate.setDate(
      notifyDate.getDate() - policy.retentionPeriodDays + policy.notifyBeforeDays,
    );

    const candidates = await this.candidateRepository
      .createQueryBuilder('candidate')
      .where('candidate.organization_id = :organizationId', { organizationId })
      .andWhere('candidate.anonymized = false')
      .andWhere('candidate.updated_at < :notifyDate', { notifyDate })
      .getMany();

    const result = [];

    for (const candidate of candidates) {
      const retentionStatus = await this.getRetentionStatus(
        candidate.id,
        organizationId,
      );

      if (
        !retentionStatus.shouldBeDeleted &&
        retentionStatus.daysUntilDeletion <= policy.notifyBeforeDays
      ) {
        result.push({
          candidate,
          daysUntilDeletion: retentionStatus.daysUntilDeletion,
        });
      }
    }

    return result;
  }

  /**
   * Sanitize data for export (remove internal fields)
   */
  private sanitizeForExport(data: any): any {
    const sanitized = { ...data };
    
    // Remove internal fields
    delete sanitized.passwordHash;
    delete sanitized.mfaSecret;
    delete sanitized.mfaBackupCodes;
    
    return sanitized;
  }
}
