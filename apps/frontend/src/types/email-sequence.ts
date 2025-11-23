export enum SequenceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum ResponseSentiment {
  INTERESTED = 'interested',
  NOT_INTERESTED = 'not_interested',
  NEUTRAL = 'neutral',
}

export interface SequenceStep {
  order: number;
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
}

export interface EmailSequence {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  steps: SequenceStep[];
  status: SequenceStatus;
  totalEnrolled: number;
  totalCompleted: number;
  totalReplied: number;
  openRate: number;
  replyRate: number;
  createdBy: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailSequenceDto {
  name: string;
  description?: string;
  steps: SequenceStep[];
}

export interface UpdateEmailSequenceDto extends Partial<CreateEmailSequenceDto> {
  status?: SequenceStatus;
}

export interface EnrollCandidatesDto {
  candidateIds: string[];
  poolId?: string;
}

export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  candidateId: string;
  poolId?: string;
  status: EnrollmentStatus;
  currentStep: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  responseSentiment?: ResponseSentiment;
  enrolledAt: string;
  nextSendAt?: string;
  repliedAt?: string;
  completedAt?: string;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    currentTitle?: string;
    currentCompany?: string;
  };
}

export interface SequencePerformance {
  totalEnrolled: number;
  totalCompleted: number;
  totalReplied: number;
  openRate: number;
  replyRate: number;
  completionRate: number;
  averageResponseTime: number;
  sentimentBreakdown: {
    interested: number;
    notInterested: number;
    neutral: number;
  };
}
