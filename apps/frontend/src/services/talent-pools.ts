import api from './api';
import {
  TalentPool,
  CreateTalentPoolDto,
  UpdateTalentPoolDto,
  AddCandidatesDto,
  TalentPoolAnalytics,
} from '../types/talent-pool';
import { Candidate } from '../types/candidate';

export const talentPoolsService = {
  // Get all talent pools
  async getTalentPools(): Promise<TalentPool[]> {
    const response = await api.get('/talent-pools');
    return response.data;
  },

  // Get single talent pool
  async getTalentPool(id: string): Promise<TalentPool> {
    const response = await api.get(`/talent-pools/${id}`);
    return response.data;
  },

  // Create talent pool
  async createTalentPool(data: CreateTalentPoolDto): Promise<TalentPool> {
    const response = await api.post('/talent-pools', data);
    return response.data;
  },

  // Update talent pool
  async updateTalentPool(id: string, data: UpdateTalentPoolDto): Promise<TalentPool> {
    const response = await api.put(`/talent-pools/${id}`, data);
    return response.data;
  },

  // Delete talent pool
  async deleteTalentPool(id: string): Promise<void> {
    await api.delete(`/talent-pools/${id}`);
  },

  // Add candidates to pool
  async addCandidates(id: string, data: AddCandidatesDto): Promise<TalentPool> {
    const response = await api.post(`/talent-pools/${id}/candidates`, data);
    return response.data;
  },

  // Remove candidates from pool
  async removeCandidates(id: string, candidateIds: string[]): Promise<TalentPool> {
    const response = await api.delete(`/talent-pools/${id}/candidates`, {
      data: { candidateIds },
    });
    return response.data;
  },

  // Sync dynamic pool
  async syncPool(id: string): Promise<TalentPool> {
    const response = await api.post(`/talent-pools/${id}/sync`);
    return response.data;
  },

  // Get pool candidates
  async getPoolCandidates(id: string): Promise<Candidate[]> {
    const response = await api.get(`/talent-pools/${id}/candidates`);
    return response.data;
  },

  // Get pool analytics (mock for now - would be implemented in backend)
  async getPoolAnalytics(id: string): Promise<TalentPoolAnalytics> {
    // This would be a real endpoint in production
    return {
      totalMembers: 0,
      newMembersThisMonth: 0,
      engagementRate: 0,
      emailsSent: 0,
      emailsOpened: 0,
      emailsReplied: 0,
      applicationsFromPool: 0,
      hiresFromPool: 0,
    };
  },
};

export default talentPoolsService;
