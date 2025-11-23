import api from './api';
import {
  Interview,
  InterviewFeedback,
  Scorecard,
  InterviewPlan,
  InterviewStage,
  User,
  TimeSlot,
  UserAvailability,
  ConflictInfo,
} from '../types/interview';

export interface CreateInterviewData {
  applicationId: string;
  interviewStageId?: string;
  scheduledAt: string;
  durationMinutes: number;
  locationType: 'phone' | 'video' | 'onsite';
  locationDetails?: string;
  meetingLink?: string;
  roomId?: string;
  participants: Array<{
    userId: string;
    role: 'interviewer' | 'coordinator' | 'observer';
  }>;
}

export interface UpdateInterviewData {
  scheduledAt?: string;
  durationMinutes?: number;
  locationType?: 'phone' | 'video' | 'onsite';
  locationDetails?: string;
  meetingLink?: string;
  roomId?: string;
  participants?: Array<{
    userId: string;
    role: 'interviewer' | 'coordinator' | 'observer';
  }>;
}

export interface CreateFeedbackData {
  interviewId: string;
  scorecardId?: string;
  overallRating?: number;
  decision?: string;
  attributeRatings?: Array<{
    attributeId: string;
    value: any;
  }>;
  strengths?: string;
  concerns?: string;
  notes?: string;
}

export interface UpdateFeedbackData {
  overallRating?: number;
  decision?: string;
  attributeRatings?: Array<{
    attributeId: string;
    value: any;
  }>;
  strengths?: string;
  concerns?: string;
  notes?: string;
}

export interface CreateScorecardData {
  name: string;
  attributes: Array<{
    id: string;
    name: string;
    type: 'rating' | 'yes_no' | 'text';
    description?: string;
    required: boolean;
    options?: string[];
  }>;
}

export interface CreateInterviewPlanData {
  name: string;
  jobId?: string;
}

export interface CreateInterviewStageData {
  interviewPlanId: string;
  name: string;
  type: string;
  durationMinutes: number;
  orderIndex: number;
  instructions?: string;
  scorecardId?: string;
}

export const interviewService = {
  // Interview CRUD
  async createInterview(data: CreateInterviewData): Promise<Interview> {
    const response = await api.post('/interviews', data);
    return response.data;
  },

  async getInterviews(applicationId?: string): Promise<Interview[]> {
    const params = applicationId ? { applicationId } : {};
    const response = await api.get('/interviews', { params });
    return response.data;
  },

  async getInterview(id: string): Promise<Interview> {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },

  async updateInterview(
    id: string,
    data: UpdateInterviewData
  ): Promise<Interview> {
    const response = await api.put(`/interviews/${id}`, data);
    return response.data;
  },

  async deleteInterview(id: string): Promise<void> {
    await api.delete(`/interviews/${id}`);
  },

  async cancelInterview(id: string): Promise<Interview> {
    const response = await api.post(`/interviews/${id}/cancel`);
    return response.data;
  },

  async completeInterview(id: string): Promise<Interview> {
    const response = await api.post(`/interviews/${id}/complete`);
    return response.data;
  },

  async markNoShow(id: string): Promise<Interview> {
    const response = await api.post(`/interviews/${id}/no-show`);
    return response.data;
  },

  // Get interviews by date range
  async getInterviewsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Interview[]> {
    const response = await api.get('/interviews/by-date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get upcoming interviews for current user
  async getMyUpcomingInterviews(): Promise<Interview[]> {
    const response = await api.get('/interviews/upcoming/me');
    return response.data;
  },

  // Feedback
  async createFeedback(data: CreateFeedbackData): Promise<InterviewFeedback> {
    const response = await api.post('/interviews/feedback', data);
    return response.data;
  },

  async getFeedback(interviewId: string): Promise<InterviewFeedback[]> {
    const response = await api.get('/interviews/feedback', {
      params: { interviewId },
    });
    return response.data;
  },

  async getFeedbackById(id: string): Promise<InterviewFeedback> {
    const response = await api.get(`/interviews/feedback/${id}`);
    return response.data;
  },

  async updateFeedback(
    id: string,
    data: UpdateFeedbackData
  ): Promise<InterviewFeedback> {
    const response = await api.put(`/interviews/feedback/${id}`, data);
    return response.data;
  },

  async submitFeedback(id: string): Promise<InterviewFeedback> {
    const response = await api.post(`/interviews/feedback/${id}/submit`);
    return response.data;
  },

  async deleteFeedback(id: string): Promise<void> {
    await api.delete(`/interviews/feedback/${id}`);
  },

  // Feedback analytics
  async getFeedbackSummaryForApplication(
    applicationId: string
  ): Promise<any> {
    const response = await api.get(
      `/interviews/analytics/feedback/application/${applicationId}`
    );
    return response.data;
  },

  async getInterviewsNeedingFeedback(): Promise<Interview[]> {
    const response = await api.get('/interviews/needing-feedback');
    return response.data;
  },

  // Scorecards
  async createScorecard(data: CreateScorecardData): Promise<Scorecard> {
    const response = await api.post('/interviews/scorecards', data);
    return response.data;
  },

  async getScorecards(): Promise<Scorecard[]> {
    const response = await api.get('/interviews/scorecards');
    return response.data;
  },

  async getScorecard(id: string): Promise<Scorecard> {
    const response = await api.get(`/interviews/scorecards/${id}`);
    return response.data;
  },

  async updateScorecard(
    id: string,
    data: Partial<CreateScorecardData>
  ): Promise<Scorecard> {
    const response = await api.put(`/interviews/scorecards/${id}`, data);
    return response.data;
  },

  async deleteScorecard(id: string): Promise<void> {
    await api.delete(`/interviews/scorecards/${id}`);
  },

  // Interview Plans
  async createInterviewPlan(
    data: CreateInterviewPlanData
  ): Promise<InterviewPlan> {
    const response = await api.post('/interviews/plans', data);
    return response.data;
  },

  async getInterviewPlans(): Promise<InterviewPlan[]> {
    const response = await api.get('/interviews/plans');
    return response.data;
  },

  async getInterviewPlan(id: string): Promise<InterviewPlan> {
    const response = await api.get(`/interviews/plans/${id}`);
    return response.data;
  },

  async updateInterviewPlan(
    id: string,
    data: Partial<CreateInterviewPlanData>
  ): Promise<InterviewPlan> {
    const response = await api.put(`/interviews/plans/${id}`, data);
    return response.data;
  },

  async deleteInterviewPlan(id: string): Promise<void> {
    await api.delete(`/interviews/plans/${id}`);
  },

  // Interview Stages
  async createInterviewStage(
    data: CreateInterviewStageData
  ): Promise<InterviewStage> {
    const response = await api.post('/interviews/stages', data);
    return response.data;
  },

  async getInterviewStages(
    interviewPlanId: string
  ): Promise<InterviewStage[]> {
    const response = await api.get('/interviews/stages', {
      params: { interviewPlanId },
    });
    return response.data;
  },

  async getInterviewStage(id: string): Promise<InterviewStage> {
    const response = await api.get(`/interviews/stages/${id}`);
    return response.data;
  },

  async updateInterviewStage(
    id: string,
    data: Partial<CreateInterviewStageData>
  ): Promise<InterviewStage> {
    const response = await api.put(`/interviews/stages/${id}`, data);
    return response.data;
  },

  async deleteInterviewStage(id: string): Promise<void> {
    await api.delete(`/interviews/stages/${id}`);
  },

  // Calendar & Availability
  async getCalendarAuthUrl(
    provider: 'google' | 'microsoft'
  ): Promise<{ authUrl: string }> {
    const response = await api.get('/interviews/calendar/auth-url', {
      params: { provider },
    });
    return response.data;
  },

  async connectCalendar(
    provider: 'google' | 'microsoft',
    code: string
  ): Promise<{ message: string; provider: string }> {
    const response = await api.post('/interviews/calendar/connect', {
      provider,
      code,
    });
    return response.data;
  },

  async disconnectCalendar(): Promise<{ message: string }> {
    const response = await api.delete('/interviews/calendar/disconnect');
    return response.data;
  },

  async getMyAvailability(
    startDate: string,
    endDate: string
  ): Promise<UserAvailability> {
    const response = await api.get('/interviews/calendar/availability', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async findCommonAvailability(
    userIds: string[],
    startDate: string,
    endDate: string,
    durationMinutes: number,
    targetTimezone?: string
  ): Promise<TimeSlot[]> {
    const response = await api.post(
      '/interviews/calendar/availability/slots',
      {
        userIds,
        startDate,
        endDate,
        durationMinutes,
        targetTimezone,
      }
    );
    return response.data.slots;
  },

  async checkConflicts(
    userIds: string[],
    start: string,
    end: string
  ): Promise<ConflictInfo[]> {
    const response = await api.post('/interviews/calendar/conflicts/check', {
      userIds,
      start,
      end,
    });
    return response.data.conflicts;
  },

  async updateWorkingHours(workingHours: any): Promise<{ message: string }> {
    const response = await api.put('/interviews/calendar/working-hours', {
      workingHours,
    });
    return response.data;
  },

  async updateTimezone(timezone: string): Promise<{ message: string }> {
    const response = await api.put('/interviews/calendar/timezone', {
      timezone,
    });
    return response.data;
  },
};
