import { Injectable } from '@nestjs/common';
import { Job } from '../../../database/entities/job.entity';

export interface JobBoardPosting {
  externalId: string;
  jobBoardName: string;
  postedAt: Date;
  url?: string;
  status: 'active' | 'closed' | 'expired' | 'error';
  lastSyncAt?: Date;
  metadata?: Record<string, any>;
}

export interface JobBoardPostRequest {
  job: Job;
  organizationId: string;
  integrationId: string;
  credentials: Record<string, any>;
}

export interface JobBoardUpdateRequest extends JobBoardPostRequest {
  externalId: string;
}

export interface JobBoardCloseRequest {
  externalId: string;
  integrationId: string;
  credentials: Record<string, any>;
}

@Injectable()
export abstract class JobBoardBaseService {
  abstract postJob(request: JobBoardPostRequest): Promise<JobBoardPosting>;
  
  abstract updateJob(request: JobBoardUpdateRequest): Promise<JobBoardPosting>;
  
  abstract closeJob(request: JobBoardCloseRequest): Promise<void>;
  
  abstract getJobStatus(externalId: string, credentials: Record<string, any>): Promise<JobBoardPosting>;
  
  abstract validateCredentials(credentials: Record<string, any>): Promise<boolean>;
  
  protected formatJobDescription(job: Job): string {
    let description = job.description || '';
    
    // Add employment type
    if (job.employmentType) {
      description += `\n\nEmployment Type: ${this.formatEmploymentType(job.employmentType)}`;
    }
    
    // Add seniority level
    if (job.seniorityLevel) {
      description += `\nSeniority Level: ${this.formatSeniorityLevel(job.seniorityLevel)}`;
    }
    
    // Add salary range if available
    if (job.salaryMin && job.salaryMax) {
      description += `\nSalary Range: ${job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
    }
    
    // Add remote option
    if (job.remoteOk) {
      description += `\nRemote Work: Available`;
    }
    
    return description;
  }
  
  protected formatEmploymentType(type: string): string {
    const typeMap: Record<string, string> = {
      full_time: 'Full-time',
      part_time: 'Part-time',
      contract: 'Contract',
      internship: 'Internship',
    };
    return typeMap[type] || type;
  }
  
  protected formatSeniorityLevel(level: string): string {
    const levelMap: Record<string, string> = {
      entry: 'Entry Level',
      junior: 'Junior',
      mid: 'Mid-Level',
      senior: 'Senior',
      lead: 'Lead',
      principal: 'Principal',
      executive: 'Executive',
    };
    return levelMap[level] || level;
  }
}
