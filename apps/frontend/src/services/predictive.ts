import api from './api';

export interface TimeToFillPrediction {
  predictedDays: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: {
    name: string;
    impact: number;
    value: any;
  }[];
}

export interface OfferAcceptancePrediction {
  acceptanceProbability: number;
  factors: {
    name: string;
    impact: number;
    value: any;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export const predictiveService = {
  async getTimeToFillPrediction(jobId: string): Promise<TimeToFillPrediction> {
    const response = await api.get(`/predictive/time-to-fill/${jobId}`);
    return response.data;
  },

  async getOfferAcceptancePrediction(offerId: string): Promise<OfferAcceptancePrediction> {
    const response = await api.get(`/predictive/offer-acceptance/${offerId}`);
    return response.data;
  },
};
