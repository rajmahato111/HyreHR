import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Job, JobStatus } from '../../../database/entities/job.entity';
import { Integration, IntegrationProvider } from '../../../database/entities/integration.entity';
import { LinkedInJobBoardService } from './linkedin.service';
import { IndeedJobBoardService } from './indeed.service';
import { GlassdoorJobBoardService } from './glassdoor.service';
import { JobBoardBaseService, JobBoardPosting } from './job-board-base.service';
import { EncryptionService } from '../../../common/services/encryption.service';

export interface JobBoardPostingRecord {
  id: string;
  jobId: string;
  integrationId: string;
  jobBoardName: string;
  externalId: string;
  url?: string;
  status: 'active' | 'closed' | 'expired' | 'error';
  postedAt: Date;
  lastSyncAt?: Date;
  metadata?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class JobBoardPostingService {
  private readonly logger = new Logger(JobBoardPostingService.name);
  private readonly jobBoardServices: Map<IntegrationProvider, JobBoardBaseService>;

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    private linkedInService: LinkedInJobBoardService,
    private indeedService: IndeedJobBoardService,
    private glassdoorService: GlassdoorJobBoardService,
    private encryptionService: EncryptionService,
  ) {
    this.jobBoardServices = new Map<IntegrationProvider, JobBoardBaseService>([
      [IntegrationProvider.LINKEDIN, linkedInService as JobBoardBaseService],
      [IntegrationProvider.INDEED, indeedService as JobBoardBaseService],
      [IntegrationProvider.GLASSDOOR, glassdoorService as JobBoardBaseService],
    ]);
  }

  async postJobToBoard(
    jobId: string,
    integrationId: string,
    organizationId: string,
  ): Promise<JobBoardPostingRecord> {
    this.logger.log(`Posting job ${jobId} to job board via integration ${integrationId}`);

    // Fetch job with relations
    const job = await this.jobRepository.findOne({
      where: { id: jobId, organizationId },
      relations: ['locations', 'department'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Validate job is open
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('Only open jobs can be posted to job boards');
    }

    // Fetch integration
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId, organizationId },
      select: ['id', 'provider', 'status', 'credentials'],
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID ${integrationId} not found`);
    }

    // Get job board service
    const service = this.jobBoardServices.get(integration.provider);
    if (!service) {
      throw new BadRequestException(`Job board ${integration.provider} is not supported`);
    }

    // Decrypt credentials
    const credentials = this.decryptCredentials(integration.credentials);

    // Post job to board
    const posting = await service.postJob({
      job,
      organizationId,
      integrationId,
      credentials,
    });

    // Store posting record in job metadata
    const postings: JobBoardPostingRecord[] = []; // job.customFields.jobBoardPostings || [];
    const postingRecord: JobBoardPostingRecord = {
      id: this.generatePostingId(),
      jobId: job.id,
      integrationId: integration.id,
      jobBoardName: posting.jobBoardName,
      externalId: posting.externalId,
      url: posting.url,
      status: posting.status,
      postedAt: posting.postedAt,
      lastSyncAt: posting.lastSyncAt,
      metadata: posting.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    postings.push(postingRecord);
    // job.customFields = { ...job.customFields, jobBoardPostings: postings };
    await this.jobRepository.save(job);

    this.logger.log(`Successfully posted job ${jobId} to ${posting.jobBoardName}`);
    return postingRecord;
  }

  async updateJobOnBoard(
    jobId: string,
    postingId: string,
    organizationId: string,
  ): Promise<JobBoardPostingRecord> {
    this.logger.log(`Updating job ${jobId} on job board, posting ${postingId}`);

    // Fetch job with posting
    const job = await this.jobRepository.findOne({
      where: { id: jobId, organizationId },
      relations: ['locations', 'department'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const postings: JobBoardPostingRecord[] = []; // job.customFields.jobBoardPostings || [];
    const postingRecord = postings.find((p: JobBoardPostingRecord) => p.id === postingId);

    if (!postingRecord) {
      throw new NotFoundException(`Posting with ID ${postingId} not found`);
    }

    // Fetch integration
    const integration = await this.integrationRepository.findOne({
      where: { id: postingRecord.integrationId, organizationId },
      select: ['id', 'provider', 'credentials'],
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found`);
    }

    // Get job board service
    const service = this.jobBoardServices.get(integration.provider);
    if (!service) {
      throw new BadRequestException(`Job board ${integration.provider} is not supported`);
    }

    // Decrypt credentials
    const credentials = this.decryptCredentials(integration.credentials);

    // Update job on board
    const updatedPosting = await service.updateJob({
      job,
      organizationId,
      integrationId: integration.id,
      credentials,
      externalId: postingRecord.externalId,
    });

    // Update posting record
    postingRecord.status = updatedPosting.status;
    postingRecord.lastSyncAt = updatedPosting.lastSyncAt;
    postingRecord.metadata = updatedPosting.metadata;
    postingRecord.updatedAt = new Date();

    // job.customFields = { ...job.customFields, jobBoardPostings: postings };
    await this.jobRepository.save(job);

    this.logger.log(`Successfully updated job ${jobId} on ${updatedPosting.jobBoardName}`);
    return postingRecord;
  }

  async closeJobOnBoard(
    jobId: string,
    postingId: string,
    organizationId: string,
  ): Promise<void> {
    this.logger.log(`Closing job ${jobId} on job board, posting ${postingId}`);

    // Fetch job with posting
    const job = await this.jobRepository.findOne({
      where: { id: jobId, organizationId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const postings: JobBoardPostingRecord[] = []; // job.customFields.jobBoardPostings || [];
    const postingRecord = postings.find((p: JobBoardPostingRecord) => p.id === postingId);

    if (!postingRecord) {
      throw new NotFoundException(`Posting with ID ${postingId} not found`);
    }

    // Fetch integration
    const integration = await this.integrationRepository.findOne({
      where: { id: postingRecord.integrationId, organizationId },
      select: ['id', 'provider', 'credentials'],
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found`);
    }

    // Get job board service
    const service = this.jobBoardServices.get(integration.provider);
    if (!service) {
      throw new BadRequestException(`Job board ${integration.provider} is not supported`);
    }

    // Decrypt credentials
    const credentials = this.decryptCredentials(integration.credentials);

    // Close job on board
    await service.closeJob({
      externalId: postingRecord.externalId,
      integrationId: integration.id,
      credentials,
    });

    // Update posting record
    postingRecord.status = 'closed';
    postingRecord.lastSyncAt = new Date();
    postingRecord.updatedAt = new Date();

    // job.customFields = { ...job.customFields, jobBoardPostings: postings };
    await this.jobRepository.save(job);

    this.logger.log(`Successfully closed job ${jobId} on ${postingRecord.jobBoardName}`);
  }

  async getJobPostings(jobId: string, organizationId: string): Promise<JobBoardPostingRecord[]> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, organizationId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return []; // job.customFields.jobBoardPostings || [];
  }

  async syncJobPosting(
    jobId: string,
    postingId: string,
    organizationId: string,
  ): Promise<JobBoardPostingRecord> {
    this.logger.log(`Syncing job posting ${postingId} for job ${jobId}`);

    const job = await this.jobRepository.findOne({
      where: { id: jobId, organizationId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const postings: JobBoardPostingRecord[] = []; // job.customFields.jobBoardPostings || [];
    const postingRecord = postings.find((p: JobBoardPostingRecord) => p.id === postingId);

    if (!postingRecord) {
      throw new NotFoundException(`Posting with ID ${postingId} not found`);
    }

    // Fetch integration
    const integration = await this.integrationRepository.findOne({
      where: { id: postingRecord.integrationId, organizationId },
      select: ['id', 'provider', 'credentials'],
    });

    if (!integration) {
      throw new NotFoundException(`Integration not found`);
    }

    // Get job board service
    const service = this.jobBoardServices.get(integration.provider);
    if (!service) {
      throw new BadRequestException(`Job board ${integration.provider} is not supported`);
    }

    // Decrypt credentials
    const credentials = this.decryptCredentials(integration.credentials);

    try {
      // Get current status from job board
      const currentStatus = await service.getJobStatus(postingRecord.externalId, credentials);

      // Update posting record
      postingRecord.status = currentStatus.status;
      postingRecord.lastSyncAt = currentStatus.lastSyncAt;
      postingRecord.metadata = currentStatus.metadata;
      postingRecord.updatedAt = new Date();
      postingRecord.error = undefined;

      // job.customFields = { ...job.customFields, jobBoardPostings: postings };
      await this.jobRepository.save(job);

      this.logger.log(`Successfully synced posting ${postingId}`);
      return postingRecord;
    } catch (error) {
      this.logger.error(`Failed to sync posting ${postingId}: ${error.message}`, error.stack);

      // Update error in posting record
      postingRecord.status = 'error';
      postingRecord.error = error.message;
      postingRecord.updatedAt = new Date();

      // job.customFields = { ...job.customFields, jobBoardPostings: postings };
      await this.jobRepository.save(job);

      throw error;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncAllPostings(): Promise<void> {
    this.logger.log('Starting scheduled sync of all job board postings');

    try {
      // Find all jobs with postings
      const jobs = await this.jobRepository
        .createQueryBuilder('job')
        .where("job.customFields->>'jobBoardPostings' IS NOT NULL")
        .getMany();

      this.logger.log(`Found ${jobs.length} jobs with postings to sync`);

      for (const job of jobs) {
        const postings: JobBoardPostingRecord[] = []; // job.customFields.jobBoardPostings || [];

        for (const posting of postings) {
          // Only sync active postings
          if (posting.status === 'active') {
            try {
              await this.syncJobPosting(job.id, posting.id, job.organizationId);
            } catch (error) {
              this.logger.error(`Failed to sync posting ${posting.id}: ${error.message}`);
              // Continue with next posting
            }
          }
        }
      }

      this.logger.log('Completed scheduled sync of job board postings');
    } catch (error) {
      this.logger.error(`Error during scheduled sync: ${error.message}`, error.stack);
    }
  }

  private decryptCredentials(encryptedCredentials: Record<string, any>): Record<string, any> {
    const decrypted: Record<string, any> = {};

    for (const [key, value] of Object.entries(encryptedCredentials)) {
      if (typeof value === 'string' && value.includes(':')) {
        // Encrypted value
        decrypted[key] = this.encryptionService.decrypt(value);
      } else {
        decrypted[key] = value;
      }
    }

    return decrypted;
  }

  private generatePostingId(): string {
    return `posting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
