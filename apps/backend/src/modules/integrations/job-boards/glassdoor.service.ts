import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  JobBoardBaseService,
  JobBoardPosting,
  JobBoardPostRequest,
  JobBoardUpdateRequest,
  JobBoardCloseRequest,
} from './job-board-base.service';

interface GlassdoorJobPosting {
  jobId: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  postedDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'EXPIRED';
  jobUrl: string;
}

@Injectable()
export class GlassdoorJobBoardService extends JobBoardBaseService {
  private readonly logger = new Logger(GlassdoorJobBoardService.name);
  private readonly baseUrl = 'https://api.glassdoor.com/api/v1';

  private createClient(apiKey: string, partnerId: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        'api.key': apiKey,
        'partner.id': partnerId,
      },
    });
  }

  async postJob(request: JobBoardPostRequest): Promise<JobBoardPosting> {
    this.logger.log(`Posting job to Glassdoor: ${request.job.title}`);

    const { job, credentials } = request;
    const client = this.createClient(credentials.apiKey, credentials.partnerId);

    try {
      if (!credentials.employerId) {
        throw new BadRequestException('Glassdoor employer ID is required');
      }

      const payload = {
        employerId: credentials.employerId,
        title: job.title,
        description: this.formatJobDescription(job),
        location: this.formatLocation(job),
        employmentType: this.mapEmploymentType(job.employmentType),
        seniorityLevel: job.seniorityLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        isRemote: job.remoteOk,
      };

      const response = await client.post('/jobs', payload);
      const glassdoorJob = response.data;

      return {
        externalId: glassdoorJob.jobId,
        jobBoardName: 'Glassdoor',
        postedAt: new Date(glassdoorJob.postedDate),
        url: glassdoorJob.jobUrl,
        status: 'active',
        lastSyncAt: new Date(),
        metadata: {
          employerId: credentials.employerId,
          employmentType: glassdoorJob.employmentType,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to post job to Glassdoor: ${error.message}`, error.stack);
      throw new BadRequestException(`Glassdoor posting failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateJob(request: JobBoardUpdateRequest): Promise<JobBoardPosting> {
    this.logger.log(`Updating Glassdoor job: ${request.externalId}`);

    const { job, externalId, credentials } = request;
    const client = this.createClient(credentials.apiKey, credentials.partnerId);

    try {
      const payload = {
        title: job.title,
        description: this.formatJobDescription(job),
        location: this.formatLocation(job),
        employmentType: this.mapEmploymentType(job.employmentType),
        seniorityLevel: job.seniorityLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        isRemote: job.remoteOk,
      };

      await client.put(`/jobs/${externalId}`, payload);

      // Fetch updated job details
      return this.getJobStatus(externalId, credentials);
    } catch (error) {
      this.logger.error(`Failed to update Glassdoor job: ${error.message}`, error.stack);
      throw new BadRequestException(`Glassdoor update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async closeJob(request: JobBoardCloseRequest): Promise<void> {
    this.logger.log(`Closing Glassdoor job: ${request.externalId}`);

    const { externalId, credentials } = request;
    const client = this.createClient(credentials.apiKey, credentials.partnerId);

    try {
      await client.delete(`/jobs/${externalId}`);

      this.logger.log(`Successfully closed Glassdoor job: ${externalId}`);
    } catch (error) {
      this.logger.error(`Failed to close Glassdoor job: ${error.message}`, error.stack);
      throw new BadRequestException(`Glassdoor close failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getJobStatus(externalId: string, credentials: Record<string, any>): Promise<JobBoardPosting> {
    const client = this.createClient(credentials.apiKey, credentials.partnerId);

    try {
      const response = await client.get(`/jobs/${externalId}`);
      const glassdoorJob: GlassdoorJobPosting = response.data;

      return {
        externalId: glassdoorJob.jobId,
        jobBoardName: 'Glassdoor',
        postedAt: new Date(glassdoorJob.postedDate),
        url: glassdoorJob.jobUrl,
        status: this.mapStatus(glassdoorJob.status),
        lastSyncAt: new Date(),
        metadata: {
          employmentType: glassdoorJob.employmentType,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get Glassdoor job status: ${error.message}`, error.stack);
      throw new BadRequestException(`Glassdoor status check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      if (!credentials.apiKey || !credentials.partnerId || !credentials.employerId) {
        return false;
      }

      const client = this.createClient(credentials.apiKey, credentials.partnerId);
      
      // Verify credentials by fetching employer info
      await client.get(`/employers/${credentials.employerId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Glassdoor credentials validation failed: ${error.message}`);
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

  private mapStatus(status: string): 'active' | 'closed' | 'expired' | 'error' {
    const statusMap: Record<string, 'active' | 'closed' | 'expired' | 'error'> = {
      ACTIVE: 'active',
      CLOSED: 'closed',
      EXPIRED: 'expired',
    };
    return statusMap[status] || 'error';
  }
}
