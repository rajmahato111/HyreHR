export enum TalentPoolType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export interface TalentPoolCriteria {
  skills?: string[];
  experience?: { min?: number; max?: number };
  location?: string[];
  tags?: string[];
  currentTitle?: string;
  currentCompany?: string;
}

export interface TalentPool {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: TalentPoolType;
  criteria?: TalentPoolCriteria;
  ownerId?: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
  memberCount: number;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  candidates?: any[];
}

export interface CreateTalentPoolDto {
  name: string;
  description?: string;
  type: TalentPoolType;
  criteria?: TalentPoolCriteria;
  ownerId?: string;
  tags?: string[];
  candidateIds?: string[];
}

export interface UpdateTalentPoolDto extends Partial<CreateTalentPoolDto> {}

export interface AddCandidatesDto {
  candidateIds: string[];
}

export interface TalentPoolAnalytics {
  totalMembers: number;
  newMembersThisMonth: number;
  engagementRate: number;
  emailsSent: number;
  emailsOpened: number;
  emailsReplied: number;
  applicationsFromPool: number;
  hiresFromPool: number;
}
