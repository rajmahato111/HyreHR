import { Candidate } from './candidate';

export enum ApplicationStatus {
  ACTIVE = 'active',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  HIRED = 'hired',
}

export interface PipelineStage {
  id: string;
  organizationId: string;
  name: string;
  type: string;
  orderIndex: number;
  jobId?: string;
  createdAt: string;
}

export interface StageHistory {
  fromStageId?: string;
  toStageId: string;
  movedAt: string;
  movedBy: string;
  automated: boolean;
}

export interface MatchBreakdown {
  skills: number;
  experience: number;
  education: number;
  location: number;
  title: number;
}

export interface Application {
  id: string;
  candidateId: string;
  candidate?: Candidate;
  jobId: string;
  stageId: string;
  stage?: PipelineStage;
  status: ApplicationStatus;
  source: {
    type: string;
    details: Record<string, any>;
  };
  appliedAt: string;
  stageEnteredAt: string;
  rejectedAt?: string;
  rejectionReasonId?: string;
  hiredAt?: string;
  rating?: number;
  archived: boolean;
  customFields?: {
    matchScore?: number;
    matchBreakdown?: MatchBreakdown;
    skillGaps?: string[];
    matchReasons?: string[];
    lastMatchCalculated?: string;
    [key: string]: any;
  };
  history?: StageHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  candidateId: string;
  jobId: string;
  stageId: string;
  source?: {
    type: string;
    details: Record<string, any>;
  };
  rating?: number;
  customFields?: Record<string, any>;
}

export interface UpdateApplicationDto {
  stageId?: string;
  status?: ApplicationStatus;
  rating?: number;
  customFields?: Record<string, any>;
}

export interface MoveApplicationDto {
  stageId: string;
}

export interface RejectApplicationDto {
  rejectionReasonId?: string;
  notes?: string;
}

export interface ApplicationFilters {
  page?: number;
  limit?: number;
  jobId?: string;
  candidateId?: string;
  stageId?: string;
  status?: ApplicationStatus;
  rating?: number;
  archived?: boolean;
  minMatchScore?: number;
  maxMatchScore?: number;
  sortBy?: 'appliedAt' | 'matchScore' | 'rating';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedApplications {
  data: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
