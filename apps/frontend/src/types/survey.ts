export enum SurveyTriggerType {
  POST_APPLICATION = 'post_application',
  POST_INTERVIEW = 'post_interview',
  POST_REJECTION = 'post_rejection',
  POST_OFFER = 'post_offer',
  MANUAL = 'manual',
}

export enum SurveyQuestionType {
  NPS = 'nps',
  RATING = 'rating',
  TEXT = 'text',
  MULTIPLE_CHOICE = 'multiple_choice',
  YES_NO = 'yes_no',
}

export enum SurveyResponseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum SentimentScore {
  VERY_NEGATIVE = 'very_negative',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  POSITIVE = 'positive',
  VERY_POSITIVE = 'very_positive',
}

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  question: string;
  required: boolean;
  options?: string[];
  order: number;
}

export interface Survey {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  triggerType: SurveyTriggerType;
  questions: SurveyQuestion[];
  active: boolean;
  sendDelayHours: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionAnswer {
  questionId: string;
  answer: string | number | string[];
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  candidateId: string;
  applicationId?: string;
  interviewId?: string;
  status: SurveyResponseStatus;
  answers?: QuestionAnswer[];
  npsScore?: number;
  sentiment?: SentimentScore;
  sentimentAnalysis?: string;
  sentAt?: string;
  completedAt?: string;
  expiresAt?: string;
  responseToken: string;
  createdAt: string;
  updatedAt: string;
  survey?: Survey;
  candidate?: any;
}

export interface SurveyAnalytics {
  totalResponses: number;
  completionRate: number;
  nps: number;
  sentimentDistribution: {
    very_positive: number;
    positive: number;
    neutral: number;
    negative: number;
    very_negative: number;
  };
  avgResponseTime: number;
  responses: Array<{
    id: string;
    candidateId: string;
    completedAt: string;
    npsScore?: number;
    sentiment?: SentimentScore;
  }>;
}

export interface OrganizationSurveyAnalytics {
  totalResponses: number;
  overallNPS: number;
  sentimentDistribution: {
    very_positive: number;
    positive: number;
    neutral: number;
    negative: number;
    very_negative: number;
  };
  npsByTrigger: Record<string, number>;
  surveys: Array<{
    id: string;
    name: string;
    triggerType: SurveyTriggerType;
    responseCount: number;
  }>;
}
