import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  JobBoardBaseService,
  JobBoardPosting,
  JobBoardPostRequest,
  JobBoardUpdateRequest,
  JobBoardCloseRequest,
} from './job-board-base.service';

interface IndeedJobPosting {
  jobId: string;
  title: string;
  description: string;
  location: string;
  jobType: string;
  postedDate: string;
  status: 'active' | 'closed' | 'expired';
  url: string;
}

@Injectable()
export class IndeedJobBoardService extends JobBoardBaseService {
  private readonly logger = new Logger(IndeedJobBoardService.name);
  private readonly baseUrl = 'https://apis.indeed.com/ads/v1';

  private createClient(apiKey: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async postJob(request: JobBoardPostRequest): Promise<JobBoardPosting> {
    this.logger.log(`Posting job to Indeed: ${request.job.title}`);

    const { job, credentials } = request;
    const client = this.createClient(credentials.apiKey);

    try {
      if (!credentials.employerId) {
        throw new BadRequestException('Indeed employer ID is required');
      }

      const payload = {
        employerId: credentials.employerId,
        title: job.title,
        description: this.formatJobDescription(job),
        location: this.formatLocation(job),
        jobType: this.mapEmploymentType(job.employmentType),
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        remoteType: job.remoteOk ? 'REMOTE' : 'ON_SITE',
        applicationUrl: credentials.applicationUrl || undefined,
      };

      const response = await client.post('/jobs', payload);
      const indeedJob = response.data;

      return {
        externalId: indeedJob.jobId,
        jobBoardName: 'Indeed',
        postedAt: new Date(indeedJob.postedDate),
        url: indeedJob.url,
        status: 'active',
        lastSyncAt: new Date(),
        metadata: {
          employerId: credentials.employerId,
          jobType: indeedJob.jobType,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to post job to Indeed: ${error.message}`, error.stack);
      throw new BadRequestException(`Indeed posting failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateJob(request: JobBoardUpdateRequest): Promise<JobBoardPosting> {
    this.logger.log(`Updating Indeed job: ${request.externalId}`);

    const { job, externalId, credentials } = request;
    const client = this.createClient(credentials.apiKey);

    try {
      const payload = {
        title: job.title,
        description: this.formatJobDescription(job),
        location: this.formatLocation(job),
        jobType: this.mapEmploymentType(job.employmentType),
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        remoteType: job.remoteOk ? 'REMOTE' : 'ON_SITE',
      };

      await client.put(`/jobs/${externalId}`, payload);

      // Fetch updated job details
      return this.getJobStatus(externalId, credentials);
    } catch (error) {
      this.logger.error(`Failed to update Indeed job: ${error.message}`, error.stack);
      throw new BadRequestException(`Indeed update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async closeJob(request: JobBoardCloseRequest): Promise<void> {
    this.logger.log(`Closing Indeed job: ${request.externalId}`);

    const { externalId, credentials } = request;
    const client = this.createClient(credentials.apiKey);

    try {
      await client.post(`/jobs/${externalId}/close`);

      this.logger.log(`Successfully closed Indeed job: ${externalId}`);
    } catch (error) {
      this.logger.error(`Failed to close Indeed job: ${error.message}`, error.stack);
      throw new BadRequestException(`Indeed close failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getJobStatus(externalId: string, credentials: Record<string, any>): Promise<JobBoardPosting> {
    const client = this.createClient(credentials.apiKey);

    try {
      const response = await client.get(`/jobs/${externalId}`);
      const indeedJob: IndeedJobPosting = response.data;

      return {
        externalId: indeedJob.jobId,
        jobBoardName: 'Indeed',
        postedAt: new Date(indeedJob.postedDate),
        url: indeedJob.url,
        status: indeedJob.status,
        lastSyncAt: new Date(),
        metadata: {
          jobType: indeedJob.jobType,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get Indeed job status: ${error.message}`, error.stack);
      throw new BadRequestException(`Indeed status check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      if (!credentials.apiKey || !credentials.employerId) {
        return false;
      }

      const client = this.createClient(credentials.apiKey);
      
      // Verify API key by fetching employer info
      await client.get(`/employers/${credentials.employerId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Indeed credentials validation failed: ${error.message}`);
      return false;
    }
  }

  private formatLocation(job: any): string {
    if (job.remoteOk) {
      return 'Remote';
    }

    if (job.locations && job.locations.length > 0) {
      const location = job.locations[0];
      const parts = [location.city, location.state, location.country].filter(Boolean);
      return parts.join(', ');
    }

    return 'Not specified';
  }

  private mapEmploymentType(type: string): string {
    const typeMap: Record<string, string> = {
      full_time: 'FULL_TIME',
      part_time: 'PART_TIME',
      contract: 'CONTRACT',
      internship: 'INTERNSHIP',
    };
    return typeMap[type] || 'FULL_TIME';
  }
}
