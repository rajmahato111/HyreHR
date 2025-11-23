export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  ON_HOLD = 'on_hold',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

export enum SeniorityLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal',
  EXECUTIVE = 'executive',
}

export interface Job {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
  ownerId?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  locations?: Array<{
    id: string;
    name: string;
    city?: string;
    state?: string;
    country?: string;
    remote: boolean;
  }>;
  status: JobStatus;
  employmentType: EmploymentType;
  seniorityLevel?: SeniorityLevel;
  remoteOk: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  requisitionId?: string;
  confidential: boolean;
  interviewPlanId?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  openedAt?: string;
  closedAt?: string;
}

export interface CreateJobDto {
  title: string;
  description?: string;
  departmentId?: string;
  locationIds?: string[];
  ownerId?: string;
  status?: JobStatus;
  employmentType: EmploymentType;
  seniorityLevel?: SeniorityLevel;
  remoteOk?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  requisitionId?: string;
  confidential?: boolean;
  interviewPlanId?: string;
  customFields?: Record<string, any>;
}

export interface UpdateJobDto extends Partial<CreateJobDto> { }

export interface JobFilters {
  page?: number;
  limit?: number;
  status?: JobStatus;
  departmentId?: string;
  locationId?: string;
  ownerId?: string;
  employmentType?: EmploymentType;
  seniorityLevel?: SeniorityLevel;
  remoteOk?: boolean;
  confidential?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

export interface PaginatedJobs {
  data: Job[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface JobStatistics {
  total: number;
  byStatus: {
    open: number;
    draft: number;
    onHold: number;
    closed: number;
  };
}
