import api from './api';
import {
  CareerSite,
  ApplicationForm,
  PublicJob,
  ApplicationSubmission,
} from '../types/career-site';

export const careerSiteService = {
  // Admin endpoints
  async createCareerSite(data: Partial<CareerSite>): Promise<CareerSite> {
    const response = await api.post('/career-sites', data);
    return response.data;
  },

  async getCareerSites(): Promise<CareerSite[]> {
    const response = await api.get('/career-sites');
    return response.data;
  },

  async getCareerSite(id: string): Promise<CareerSite> {
    const response = await api.get(`/career-sites/${id}`);
    return response.data;
  },

  async updateCareerSite(id: string, data: Partial<CareerSite>): Promise<CareerSite> {
    const response = await api.put(`/career-sites/${id}`, data);
    return response.data;
  },

  async deleteCareerSite(id: string): Promise<void> {
    await api.delete(`/career-sites/${id}`);
  },

  async publishCareerSite(id: string): Promise<CareerSite> {
    const response = await api.post(`/career-sites/${id}/publish`);
    return response.data;
  },

  async unpublishCareerSite(id: string): Promise<CareerSite> {
    const response = await api.post(`/career-sites/${id}/unpublish`);
    return response.data;
  },

  // Application form endpoints
  async createApplicationForm(data: Partial<ApplicationForm>): Promise<ApplicationForm> {
    const response = await api.post('/career-sites/application-forms', data);
    return response.data;
  },

  async getApplicationForms(): Promise<ApplicationForm[]> {
    const response = await api.get('/career-sites/application-forms');
    return response.data;
  },

  async getApplicationForm(id: string): Promise<ApplicationForm> {
    const response = await api.get(`/career-sites/application-forms/${id}`);
    return response.data;
  },

  async updateApplicationForm(
    id: string,
    data: Partial<ApplicationForm>,
  ): Promise<ApplicationForm> {
    const response = await api.put(`/career-sites/application-forms/${id}`, data);
    return response.data;
  },

  async deleteApplicationForm(id: string): Promise<void> {
    await api.delete(`/career-sites/application-forms/${id}`);
  },

  // Public endpoints (no auth required)
  async getPublicCareerSite(slug: string): Promise<CareerSite> {
    const response = await api.get(`/career-sites/public/${slug}`);
    return response.data;
  },

  async getPublicJobs(
    slug: string,
    params?: {
      search?: string;
      departments?: string[];
      locations?: string[];
      employmentTypes?: string[];
      page?: number;
      limit?: number;
    },
  ): Promise<{
    jobs: PublicJob[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.get(`/career-sites/public/${slug}/jobs`, { params });
    return response.data;
  },

  async getPublicJob(slug: string, jobId: string): Promise<PublicJob> {
    const response = await api.get(`/career-sites/public/${slug}/jobs/${jobId}`);
    return response.data;
  },

  async getPublicApplicationForm(slug: string, jobId: string): Promise<ApplicationForm> {
    const response = await api.get(
      `/career-sites/public/${slug}/jobs/${jobId}/application-form`,
    );
    return response.data;
  },

  async submitApplication(
    slug: string,
    data: ApplicationSubmission,
  ): Promise<{ applicationId: string; message: string }> {
    const response = await api.post(`/career-sites/public/${slug}/applications`, data);
    return response.data;
  },

  // Candidate portal endpoints
  async loginCandidatePortal(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string; candidate: any }> {
    const response = await api.post('/career-sites/portal/login', credentials);
    return response.data;
  },

  async registerCandidatePortal(data: {
    email: string;
    password: string;
    candidateId: string;
  }): Promise<{ token: string }> {
    const response = await api.post('/career-sites/portal/register', data);
    return response.data;
  },

  async getCandidateApplications(): Promise<any[]> {
    const response = await api.get('/career-sites/portal/applications');
    return response.data;
  },

  async getCandidateInterviews(): Promise<any[]> {
    const response = await api.get('/career-sites/portal/interviews');
    return response.data;
  },

  async uploadCandidateDocument(
    documentType: string,
    documentUrl: string,
  ): Promise<void> {
    await api.post('/career-sites/portal/documents', { documentType, documentUrl });
  },
};
