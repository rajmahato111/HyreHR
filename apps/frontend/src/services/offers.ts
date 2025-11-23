import api from './api';
import {
  Offer,
  CreateOfferDto,
  UpdateOfferDto,
  ApproveOfferDto,
  RejectOfferDto,
  SendOfferDto,
  OfferTemplate,
  CreateOfferTemplateDto,
  UpdateOfferTemplateDto,
} from '../types/offer';

export const offersService = {
  // Offers
  async getOffers(): Promise<Offer[]> {
    const response = await api.get('/offers');
    return response.data;
  },

  async getOffer(id: string): Promise<Offer> {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  async getOfferByApplication(applicationId: string): Promise<Offer> {
    const response = await api.get(`/offers/application/${applicationId}`);
    return response.data;
  },

  async createOffer(data: CreateOfferDto): Promise<Offer> {
    const response = await api.post('/offers', data);
    return response.data;
  },

  async updateOffer(id: string, data: UpdateOfferDto): Promise<Offer> {
    const response = await api.put(`/offers/${id}`, data);
    return response.data;
  },

  async approveOffer(id: string, data?: ApproveOfferDto): Promise<Offer> {
    const response = await api.post(`/offers/${id}/approve`, data || {});
    return response.data;
  },

  async rejectOffer(id: string, data?: RejectOfferDto): Promise<Offer> {
    const response = await api.post(`/offers/${id}/reject`, data || {});
    return response.data;
  },

  async sendOffer(id: string, data: SendOfferDto): Promise<Offer> {
    const response = await api.post(`/offers/${id}/send`, data);
    return response.data;
  },

  async acceptOffer(id: string): Promise<Offer> {
    const response = await api.post(`/offers/${id}/accept`);
    return response.data;
  },

  async declineOffer(id: string): Promise<Offer> {
    const response = await api.post(`/offers/${id}/decline`);
    return response.data;
  },

  async withdrawOffer(id: string): Promise<Offer> {
    const response = await api.post(`/offers/${id}/withdraw`);
    return response.data;
  },

  async deleteOffer(id: string): Promise<void> {
    await api.delete(`/offers/${id}`);
  },

  async sendWithDocuSign(id: string, data: SendOfferDto): Promise<Offer> {
    const response = await api.post(`/offers/${id}/send-docusign`, data);
    return response.data;
  },

  async handoffToHRIS(id: string, provider: string): Promise<any> {
    const response = await api.post(`/offers/${id}/handoff-hris`, null, {
      params: { provider },
    });
    return response.data;
  },

  async getHRISStatus(id: string): Promise<any> {
    const response = await api.get(`/offers/${id}/hris-status`);
    return response.data;
  },

  // Templates
  async getTemplates(): Promise<OfferTemplate[]> {
    const response = await api.get('/offers/templates');
    return response.data;
  },

  async getActiveTemplates(): Promise<OfferTemplate[]> {
    const response = await api.get('/offers/templates/active');
    return response.data;
  },

  async getTemplate(id: string): Promise<OfferTemplate> {
    const response = await api.get(`/offers/templates/${id}`);
    return response.data;
  },

  async createTemplate(data: CreateOfferTemplateDto): Promise<OfferTemplate> {
    const response = await api.post('/offers/templates', data);
    return response.data;
  },

  async updateTemplate(id: string, data: UpdateOfferTemplateDto): Promise<OfferTemplate> {
    const response = await api.put(`/offers/templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/offers/templates/${id}`);
  },
};

export default offersService;
