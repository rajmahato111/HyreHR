export enum OfferStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  WITHDRAWN = 'withdrawn',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface EquityDetails {
  type: 'stock_options' | 'rsu' | 'equity_grant';
  amount: number;
  vestingSchedule?: string;
}

export interface OfferApprover {
  userId: string;
  order: number;
  status: ApprovalStatus;
  approvedAt?: string;
  rejectedAt?: string;
  comments?: string;
}

export interface Offer {
  id: string;
  applicationId: string;
  templateId?: string;
  status: OfferStatus;
  jobTitle: string;
  salary: number;
  currency: string;
  bonus?: number;
  equity?: EquityDetails;
  startDate?: string;
  benefits?: string;
  notes?: string;
  approvalWorkflow?: OfferApprover[];
  sentAt?: string;
  expiresAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  withdrawnAt?: string;
  docusignEnvelopeId?: string;
  docusignStatus?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  application?: any;
}

export interface CreateOfferDto {
  applicationId: string;
  templateId?: string;
  jobTitle: string;
  salary: number;
  currency?: string;
  bonus?: number;
  equity?: EquityDetails;
  startDate?: string;
  benefits?: string;
  notes?: string;
  approvalWorkflow?: Array<{
    userId: string;
    order: number;
  }>;
  expiryDays?: number;
  customFields?: Record<string, any>;
}

export interface UpdateOfferDto {
  jobTitle?: string;
  salary?: number;
  currency?: string;
  bonus?: number;
  equity?: EquityDetails;
  startDate?: string;
  benefits?: string;
  notes?: string;
  approvalWorkflow?: Array<{
    userId: string;
    order: number;
  }>;
  expiryDays?: number;
  customFields?: Record<string, any>;
}

export interface ApproveOfferDto {
  comments?: string;
}

export interface RejectOfferDto {
  comments?: string;
}

export interface SendOfferDto {
  recipientEmail: string;
  recipientName: string;
  message?: string;
  ccEmails?: string[];
}

export interface OfferTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  jobTitle: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  bonusMin?: number;
  bonusMax?: number;
  equity?: EquityDetails;
  benefits?: string;
  notes?: string;
  approvalWorkflow?: Array<{
    userId: string;
    order: number;
  }>;
  expiryDays: number;
  active: boolean;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferTemplateDto {
  name: string;
  description?: string;
  jobTitle: string;
  salaryMin: number;
  salaryMax: number;
  currency?: string;
  bonusMin?: number;
  bonusMax?: number;
  equity?: EquityDetails;
  benefits?: string;
  notes?: string;
  approvalWorkflow?: Array<{
    userId: string;
    order: number;
  }>;
  expiryDays?: number;
  active?: boolean;
  customFields?: Record<string, any>;
}

export interface UpdateOfferTemplateDto extends Partial<CreateOfferTemplateDto> {}
