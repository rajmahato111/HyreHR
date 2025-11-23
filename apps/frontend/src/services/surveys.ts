import api from './api';
import {
  Survey,
  SurveyResponse,
  SurveyAnalytics,
  OrganizationSurveyAnalytics,
  QuestionAnswer,
} from '../types/survey';

export const surveysService = {
  // Survey CRUD
  async createSurvey(data: Partial<Survey>): Promise<Survey> {
    const response = await api.post('/surveys', data);
    return response.data;
  },

  async getSurveys(): Promise<Survey[]> {
    const response = await api.get('/surveys');
    return response.data;
  },

  async getSurvey(id: string): Promise<Survey> {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  async updateSurvey(id: string, data: Partial<Survey>): Promise<Survey> {
    const response = await api.patch(`/surveys/${id}`, data);
    return response.data;
  },

  async deleteSurvey(id: string): Promise<void> {
    await api.delete(`/surveys/${id}`);
  },

  async toggleSurveyActive(id: string): Promise<Survey> {
    const response = await api.patch(`/surveys/${id}/toggle`);
    return response.data;
  },

  // Survey Analytics
  async getSurveyAnalytics(id: string): Promise<SurveyAnalytics> {
    const response = await api.get(`/surveys/${id}/analytics`);
    return response.data;
  },

  async getSurveyResponses(id: string): Promise<SurveyResponse[]> {
    const response = await api.get(`/surveys/${id}/responses`);
    return response.data;
  },

  async getOrganizationAnalytics(
    startDate?: string,
    endDate?: string,
  ): Promise<OrganizationSurveyAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/surveys/analytics?${params.toString()}`);
    return response.data;
  },

  // Public survey response endpoints
  async getSurveyByToken(token: string): Promise<SurveyResponse> {
    const response = await api.get(`/surveys/response/${token}`);
    return response.data;
  },

  async submitSurveyResponse(
    token: string,
    answers: QuestionAnswer[],
  ): Promise<SurveyResponse> {
    const response = await api.post(`/surveys/response/${token}/submit`, {
      answers,
    });
    return response.data;
  },
};
