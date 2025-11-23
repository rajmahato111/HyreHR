export interface Candidate {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  currentCompany?: string;
  currentTitle?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrls: string[];
  tags: string[];
  source: {
    type: string;
    details: Record<string, any>;
  };
  gdprConsent: boolean;
  gdprConsentDate?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  currentCompany?: string;
  currentTitle?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  tags?: string[];
  source?: {
    type: string;
    details: Record<string, any>;
  };
  gdprConsent?: boolean;
  customFields?: Record<string, any>;
}

export interface UpdateCandidateDto extends Partial<CreateCandidateDto> {}

export interface CandidateFilters {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  location?: string;
  skills?: string[];
  experience?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedCandidates {
  data: Candidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
