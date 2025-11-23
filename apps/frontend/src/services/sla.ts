import api from './api';
import {
  SlaRule,
  CreateSlaRuleDto,
  UpdateSlaRuleDto,
  SlaViolation,
  SlaComplianceMetrics,
} from '../types/sla';

export const slaService = {
  // SLA Rules
  async createRule(data: CreateSlaRuleDto): Promise<SlaRule> {
    const response = await api.post('/sla/rules', data);
    return response.data;
  },

  async findAllRules(filters?: {
    type?: string;
    active?: boolean;
  }): Promise<SlaRule[]> {
    const response = await api.get('/sla/rules', { params: filters });
    return response.data;
  },

  async findRuleById(id: string): Promise<SlaRule> {
    const response = await api.get(`/sla/rules/${id}`);
    return response.data;
  },

  async updateRule(id: string, data: UpdateSlaRuleDto): Promise<SlaRule> {
    const response = await api.put(`/sla/rules/${id}`, data);
    return response.data;
  },

  async deleteRule(id: string): Promise<void> {
    await api.delete(`/sla/rules/${id}`);
  },

  // SLA Violations
  async findAllViolations(filters?: {
    status?: string;
    ruleId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SlaViolation[]> {
    const response = await api.get('/sla/violations', { params: filters });
    return response.data;
  },

  async findViolationById(id: string): Promise<SlaViolation> {
    const response = await api.get(`/sla/violations/${id}`);
    return response.data;
  },

  async acknowledgeViolation(id: string): Promise<SlaViolation> {
    const response = await api.put(`/sla/violations/${id}/acknowledge`);
    return response.data;
  },

  async resolveViolation(id: string, notes?: string): Promise<SlaViolation> {
    const response = await api.put(`/sla/violations/${id}/resolve`, { notes });
    return response.data;
  },

  // Metrics
  async getComplianceMetrics(
    startDate?: string,
    endDate?: string
  ): Promise<SlaComplianceMetrics> {
    const response = await api.get('/sla/metrics/compliance', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
