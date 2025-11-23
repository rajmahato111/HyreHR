import api from './api';

export type EmailTone = 'professional' | 'friendly' | 'casual';

export interface GeneratedEmail {
  subject: string;
  body: string;
  tone: EmailTone;
  tokens: string[];
}

export interface EmailToneOption {
  value: EmailTone;
  label: string;
  description: string;
}

export interface GenerateOutreachEmailRequest {
  candidateId: string;
  jobId: string;
  tone: EmailTone;
  additionalContext?: string;
  recruiterName?: string;
  companyName?: string;
}

export interface GenerateResponseEmailRequest {
  candidateEmail: string;
  candidateId?: string;
  applicationId?: string;
  tone: EmailTone;
  context?: string;
}

export interface GenerateRejectionEmailRequest {
  applicationId: string;
  tone: EmailTone;
  rejectionReason?: string;
  constructiveFeedback?: string;
}

/**
 * Generate personalized outreach email for a candidate
 */
export const generateOutreachEmail = async (
  request: GenerateOutreachEmailRequest
): Promise<GeneratedEmail> => {
  const response = await api.post<{ success: boolean; data: GeneratedEmail }>(
    '/ai/email/outreach',
    request
  );
  return response.data.data;
};

/**
 * Generate context-aware response to candidate email
 */
export const generateResponseEmail = async (
  request: GenerateResponseEmailRequest
): Promise<GeneratedEmail> => {
  const response = await api.post<{ success: boolean; data: GeneratedEmail }>(
    '/ai/email/response',
    request
  );
  return response.data.data;
};

/**
 * Generate rejection email with optional constructive feedback
 */
export const generateRejectionEmail = async (
  request: GenerateRejectionEmailRequest
): Promise<GeneratedEmail> => {
  const response = await api.post<{ success: boolean; data: GeneratedEmail }>(
    '/ai/email/rejection',
    request
  );
  return response.data.data;
};

/**
 * Get available email tones
 */
export const getEmailTones = async (): Promise<EmailToneOption[]> => {
  const response = await api.get<{ success: boolean; data: EmailToneOption[] }>(
    '/ai/email/tones'
  );
  return response.data.data;
};

export default {
  generateOutreachEmail,
  generateResponseEmail,
  generateRejectionEmail,
  getEmailTones,
};
