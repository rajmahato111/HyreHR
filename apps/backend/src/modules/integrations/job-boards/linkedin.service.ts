import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  JobBoardBaseService,
  JobBoardPosting,
  JobBoardPostRequest,
  JobBoardUpdateRequest,
  JobBoardCloseRequest,
} from './job-board-base.service';

interface LinkedInJobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  seniorityLevel?: string;
  companyId: string;
  listedAt: number;
  state: 'LISTED' | 'CLOSED' | 'EXPIRED';
}

@Injectable()
export class LinkedInJobBoardService extends JobBoardBaseService {
  private readonly logger = new Logger(LinkedInJobBoardService.name);
  private readonly baseUrl = 'https://api.linkedin.com/v2';

  private createClient(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
  }

  async postJob(request: JobBoardPostRequest): Promise<JobBoardPosting> {
    this.logger.log(`Posting job to LinkedIn: ${request.job.title}`);

    const { job, credentials } = request;
    const client = this.createClient(credentials.accessToken);

    try {
      // LinkedIn requires a company ID
      if (!credentials.companyId) {
        throw new BadRequestException('LinkedIn company ID is required');
      }

      const payload = {
        companyId: credentials.companyId,
        title: job.title,
        description: this.formatJobDescription(job),
        location: this.formatLocation(job),
        employmentType: this.mapEmploymentType(job.employmentType),
        seniorityLevel: job.seniorityLevel ? this.mapSeniorityLevel(job.seniorityLevel) : undefined,
        listedAt: Date.now(),
      };

      const response = await client.post('/jobPostings', payload);
      const linkedInJob = response.data;

      return {
        externalId: linkedInJob.id,
        jobBoardName: 'LinkedIn',
        postedAt: new Date(linkedInJob.listedAt),
        url: `https://www.linkedin.com/jobs/view/${linkedInJob.id}`,
        status: 'active',
        lastSyncAt: new Date(),
        metadata: {
          companyId: credentials.companyId,
          state: linkedInJob.state,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to post job to LinkedIn: ${error.message}`, error.stack);
      throw new BadRequestException(`LinkedIn posting failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateJob(request: JobBoardUpdateRequest): Promise<JobBoardPosting> {
    this.logger.log(`Updating LinkedIn job: ${request.externalId}`);

    const { job, externalId, credentials } = request;
    const client = this.createClient(credentials.accessToken);

    try {
      const payload = {
        title: job.title,
        description: this.formatJobDescription(job),
        location: this.formatLocation(job),
        employmentType: this.mapEmploymentType(job.employmentType),
        seniorityLevel: job.seniorityLevel ? this.mapSeniorityLevel(job.seniorityLevel) : undefined,
      };

      await client.patch(`/jobPostings/${externalId}`, payload);

      // Fetch updated job details
      return this.getJobStatus(externalId, credentials);
    } catch (error) {
      this.logger.error(`Failed to update LinkedIn job: ${error.message}`, error.stack);
      throw new BadRequestException(`LinkedIn update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async closeJob(request: JobBoardCloseRequest): Promise<void> {
    this.logger.log(`Closing LinkedIn job: ${request.externalId}`);

    const { externalId, credentials } = request;
    const client = this.createClient(credentials.accessToken);

    try {
      await client.patch(`/jobPostings/${externalId}`, {
        state: 'CLOSED',
      });

      this.logger.log(`Successfully closed LinkedIn job: ${externalId}`);
    } catch (error) {
      this.logger.error(`Failed to close LinkedIn job: ${error.message}`, error.stack);
      throw new BadRequestException(`LinkedIn close failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getJobStatus(externalId: string, credentials: Record<string, any>): Promise<JobBoardPosting> {
    const client = this.createClient(credentials.accessToken);

    try {
      const response = await client.get(`/jobPostings/${externalId}`);
      const linkedInJob: LinkedInJobPosting = response.data;

      return {
        externalId: linkedInJob.id,
        jobBoardName: 'LinkedIn',
        postedAt: new Date(linkedInJob.listedAt),
        url: `https://www.linkedin.com/jobs/view/${linkedInJob.id}`,
        status: this.mapStatus(linkedInJob.state),
        lastSyncAt: new Date(),
        metadata: {
          companyId: linkedInJob.companyId,
          state: linkedInJob.state,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get LinkedIn job status: ${error.message}`, error.stack);
      throw new BadRequestException(`LinkedIn status check failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async validateCredentials(credentials: Record<string, any>): Promise<boolean> {
    try {
      if (!credentials.accessToken || !credentials.companyId) {
        return false;
      }

      const client = this.createClient(credentials.accessToken);
      
      // Verify access token by fetching company info
      await client.get(`/organizations/${credentials.companyId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`LinkedIn credentials validation failed: ${error.message}`);
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

  private mapSeniorityLevel(level: string): string {
    const levelMap: Record<string, string> = {
      entry: 'ENTRY_LEVEL',
      junior: 'ASSOCIATE',
      mid: 'MID_SENIOR_LEVEL',
      senior: 'MID_SENIOR_LEVEL',
      lead: 'DIRECTOR',
      principal: 'DIRECTOR',
      executive: 'EXECUTIVE',
    };
    return levelMap[level] || 'NOT_APPLICABLE';
  }

  private mapStatus(state: string): 'active' | 'closed' | 'expired' | 'error' {
    const statusMap: Record<string, 'active' | 'closed' | 'expired' | 'error'> = {
      LISTED: 'active',
      CLOSED: 'closed',
      EXPIRED: 'expired',
    };
    return statusMap[state] || 'error';
  }
}
