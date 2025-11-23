import api from './api';
import {
  Application,
  ApplicationFilters,
  PaginatedApplications,
  CreateApplicationDto,
  UpdateApplicationDto,
  MoveApplicationDto,
  RejectApplicationDto,
  PipelineStage,
} from '../types/application';

export const applicationsService = {
  // Get all applications with filters
  async getApplications(filters?: ApplicationFilters): Promise<PaginatedApplications> {
    const response = await api.get('/applications', { params: filters });
    return response.data;
  },

  // Get single application
  async getApplication(id: string): Promise<Application> {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  // Create application
  async createApplication(data: CreateApplicationDto): Promise<Application> {
    const response = await api.post('/applications', data);
    return response.data;
  },

  // Update application
  async updateApplication(id: string, data: UpdateApplicationDto): Promise<Application> {
    const response = await api.put(`/applications/${id}`, data);
    return response.data;
  },

  // Move application to different stage
  async moveApplication(id: string, data: MoveApplicationDto): Promise<Application> {
    const response = await api.post(`/applications/${id}/move`, data);
    return response.data;
  },

  // Reject application
  async rejectApplication(id: string, data: RejectApplicationDto): Promise<Application> {
    const response = await api.post(`/applications/${id}/reject`, data);
    return response.data;
  },

  // Delete application
  async deleteApplication(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  // Get pipeline stages for a job
  async getPipelineStages(jobId?: string): Promise<PipelineStage[]> {
    const params = jobId ? { jobId } : {};
    const response = await api.get('/pipeline-stages', { params });
    return response.data;
  },
};

export default applicationsService;
