import api from './api';
import {
  BiasReport,
  BiasAlert,
  BiasMetrics,
  FeedbackBiasCheck,
} from '../types/bias-detection';

export const biasDetectionService = {
  /**
   * Analyze specific feedback for bias
   */
  analyzeFeedback: async (feedbackId: string) => {
    const response = await api.get(`/bias-detection/feedback/${feedbackId}`);
    return response.data;
  },

  /**
   * Check feedback text before submission
   */
  checkFeedback: async (feedbackText: {
    strengths?: string;
    concerns?: string;
    notes?: string;
  }): Promise<FeedbackBiasCheck> => {
    const response = await api.post('/bias-detection/check-feedback', feedbackText);
    return response.data;
  },

  /**
   * Generate bias report
   */
  generateReport: async (params: {
    jobId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<BiasReport> => {
    const response = await api.get('/bias-detection/report', { params });
    return response.data;
  },

  /**
   * Get bias alerts for a job
   */
  getJobAlerts: async (jobId: string): Promise<BiasAlert[]> => {
    const response = await api.get(`/bias-detection/alerts/job/${jobId}`);
    return response.data;
  },

  /**
   * Get bias alerts for feedback
   */
  getFeedbackAlerts: async (feedbackId: string): Promise<BiasAlert[]> => {
    const response = await api.get(`/bias-detection/alerts/feedback/${feedbackId}`);
    return response.data;
  },

  /**
   * Get bias metrics for dashboard
   */
  getMetrics: async (
    organizationId: string,
    jobId?: string
  ): Promise<BiasMetrics> => {
    const response = await api.get('/bias-detection/metrics', {
      params: { organizationId, jobId },
    });
    return response.data;
  },

  /**
   * Get general recommendations
   */
  getRecommendations: async (): Promise<string[]> => {
    const response = await api.get('/bias-detection/recommendations');
    return response.data.recommendations;
  },
};
