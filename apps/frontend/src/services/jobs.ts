import api from './api';
import type {
  Job,
  CreateJobDto,
  UpdateJobDto,
  JobFilters,
  PaginatedJobs,
  JobStatistics,
  JobStatus,
} from '../types/job';

export const jobsApi = {
  // Get all jobs with filters
  getJobs: async (filters?: JobFilters): Promise<PaginatedJobs> => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },

  // Get single job
  getJob: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create job
  createJob: async (data: CreateJobDto): Promise<Job> => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  // Update job
  updateJob: async (id: string, data: UpdateJobDto): Promise<Job> => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  // Delete job
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  // Clone job
  cloneJob: async (id: string): Promise<Job> => {
    const response = await api.post(`/jobs/${id}/clone`);
    return response.data;
  },

  // Update job status
  updateJobStatus: async (id: string, status: JobStatus): Promise<Job> => {
    const response = await api.patch(`/jobs/${id}/status`, { status });
    return response.data;
  },

  // Get job statistics
  getStatistics: async (): Promise<JobStatistics> => {
    const response = await api.get('/jobs/statistics');
    return response.data;
  },
};
