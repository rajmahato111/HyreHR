import api from './api';
import {
  Candidate,
  CandidateFilters,
  PaginatedCandidates,
  CreateCandidateDto,
  UpdateCandidateDto,
} from '../types/candidate';

export const candidatesService = {
  // Get all candidates with filters
  async getCandidates(filters?: CandidateFilters): Promise<PaginatedCandidates> {
    const response = await api.get('/candidates', { params: filters });
    return response.data;
  },

  // Get single candidate
  async getCandidate(id: string): Promise<Candidate> {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  // Create candidate
  async createCandidate(data: CreateCandidateDto): Promise<Candidate> {
    const response = await api.post('/candidates', data);
    return response.data;
  },

  // Update candidate
  async updateCandidate(id: string, data: UpdateCandidateDto): Promise<Candidate> {
    const response = await api.put(`/candidates/${id}`, data);
    return response.data;
  },

  // Delete candidate
  async deleteCandidate(id: string): Promise<void> {
    await api.delete(`/candidates/${id}`);
  },

  // Search candidates
  async searchCandidates(query: string, filters?: CandidateFilters): Promise<PaginatedCandidates> {
    const response = await api.get('/candidates/search', {
      params: { ...filters, search: query },
    });
    return response.data;
  },
};

export default candidatesService;
