import api from './api';
import {
  Communication,
  CreateCommunicationDto,
  CommunicationType,
  CommunicationDirection,
} from '../types/communication';
import { Note, CreateNoteDto, UpdateNoteDto } from '../types/note';

export interface EmailTemplate {
  id: string;
  organizationId: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  shared: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateDto {
  name: string;
  subject: string;
  body: string;
  category?: string;
  variables?: string[];
  shared?: boolean;
}

export interface UpdateEmailTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  category?: string;
  variables?: string[];
}

export interface SendEmailDto {
  candidateId: string;
  applicationId?: string;
  toEmails: string[];
  ccEmails?: string[];
  bccEmails?: string[];
  subject: string;
  body: string;
  templateId?: string;
  attachments?: File[];
}

export interface ActivityFeedItem {
  id: string;
  type: 'email' | 'note' | 'status_change' | 'interview' | 'application';
  timestamp: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  data: any;
}

export interface FilterCommunicationDto {
  candidateId?: string;
  applicationId?: string;
  type?: CommunicationType;
  direction?: CommunicationDirection;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Email operations
export const sendEmail = async (dto: SendEmailDto): Promise<Communication> => {
  const formData = new FormData();
  
  formData.append('candidateId', dto.candidateId);
  if (dto.applicationId) formData.append('applicationId', dto.applicationId);
  formData.append('toEmails', JSON.stringify(dto.toEmails));
  if (dto.ccEmails) formData.append('ccEmails', JSON.stringify(dto.ccEmails));
  if (dto.bccEmails) formData.append('bccEmails', JSON.stringify(dto.bccEmails));
  formData.append('subject', dto.subject);
  formData.append('body', dto.body);
  if (dto.templateId) formData.append('templateId', dto.templateId);
  
  if (dto.attachments) {
    dto.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const response = await api.post('/communication/emails/send', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const syncEmails = async (provider: 'gmail' | 'outlook'): Promise<{ success: boolean; syncedCount: number }> => {
  const response = await api.post('/communication/emails/sync', { provider });
  return response.data;
};

export const getEmailThread = async (threadId: string, provider: 'gmail' | 'outlook'): Promise<Communication[]> => {
  const response = await api.get(`/communication/emails/thread/${threadId}`, {
    params: { provider },
  });
  return response.data;
};

// Notes operations
export const createNote = async (dto: CreateNoteDto): Promise<Note> => {
  const response = await api.post('/communication/notes', dto);
  return response.data;
};

// Communications operations
export const getCommunications = async (filters: FilterCommunicationDto): Promise<{ data: Communication[]; total: number }> => {
  const response = await api.get('/communication/communications', { params: filters });
  return response.data;
};

export const getCommunicationById = async (id: string): Promise<Communication> => {
  const response = await api.get(`/communication/communications/${id}`);
  return response.data;
};

// Email templates operations
export const createEmailTemplate = async (dto: CreateEmailTemplateDto): Promise<EmailTemplate> => {
  const response = await api.post('/communication/templates', dto);
  return response.data;
};

export const getEmailTemplates = async (category?: string): Promise<EmailTemplate[]> => {
  const response = await api.get('/communication/templates', {
    params: category ? { category } : {},
  });
  return response.data;
};

export const getEmailTemplatesByCategory = async (): Promise<Record<string, EmailTemplate[]>> => {
  const response = await api.get('/communication/templates/by-category');
  return response.data;
};

export const getEmailTemplateById = async (id: string): Promise<EmailTemplate> => {
  const response = await api.get(`/communication/templates/${id}`);
  return response.data;
};

export const updateEmailTemplate = async (id: string, dto: UpdateEmailTemplateDto): Promise<EmailTemplate> => {
  const response = await api.put(`/communication/templates/${id}`, dto);
  return response.data;
};

export const deleteEmailTemplate = async (id: string): Promise<void> => {
  await api.delete(`/communication/templates/${id}`);
};

export const duplicateEmailTemplate = async (id: string): Promise<EmailTemplate> => {
  const response = await api.post(`/communication/templates/${id}/duplicate`);
  return response.data;
};

export const shareEmailTemplate = async (id: string, shared: boolean): Promise<EmailTemplate> => {
  const response = await api.put(`/communication/templates/${id}/share`, { shared });
  return response.data;
};

export const previewEmailTemplate = async (id: string, variables: Record<string, any>): Promise<{ subject: string; body: string }> => {
  const response = await api.post(`/communication/templates/${id}/preview`, { variables });
  return response.data;
};

export const createDefaultEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const response = await api.post('/communication/templates/default');
  return response.data;
};

// Activity feed operations
export const getCandidateActivityFeed = async (candidateId: string, limit: number = 50): Promise<ActivityFeedItem[]> => {
  const response = await api.get(`/communication/activity/candidate/${candidateId}`, {
    params: { limit },
  });
  return response.data;
};

export const getApplicationActivityFeed = async (applicationId: string): Promise<ActivityFeedItem[]> => {
  const response = await api.get(`/communication/activity/application/${applicationId}`);
  return response.data;
};

export const getActivitySummary = async (
  candidateId: string,
  startDate: string,
  endDate: string
): Promise<{ totalEmails: number; totalNotes: number; totalStatusChanges: number; totalInterviews: number }> => {
  const response = await api.get(`/communication/activity/candidate/${candidateId}/summary`, {
    params: { startDate, endDate },
  });
  return response.data;
};

// Email tracking operations
export const getTrackingStats = async (communicationId: string): Promise<{ opened: boolean; clicked: boolean; openedAt?: string; clickedAt?: string }> => {
  const response = await api.get(`/communication/track/stats/${communicationId}`);
  return response.data;
};

export const getAggregateTrackingStats = async (communicationIds: string[]): Promise<{ totalSent: number; totalOpened: number; totalClicked: number; openRate: number; clickRate: number }> => {
  const response = await api.post('/communication/track/stats/aggregate', { communicationIds });
  return response.data;
};
