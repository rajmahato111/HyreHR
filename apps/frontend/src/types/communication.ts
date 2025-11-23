export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  NOTE = 'note',
  CALL = 'call',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal',
}

export enum CommunicationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  FAILED = 'failed',
}

export interface Communication {
  id: string;
  candidateId: string;
  applicationId?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  fromEmail?: string;
  toEmails: string[];
  ccEmails?: string[];
  subject?: string;
  body?: string;
  templateId?: string;
  status: CommunicationStatus;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  userId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface CreateCommunicationDto {
  candidateId: string;
  applicationId?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  toEmails: string[];
  ccEmails?: string[];
  subject?: string;
  body?: string;
  templateId?: string;
}
