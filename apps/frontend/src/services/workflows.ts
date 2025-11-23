import api from './api';
import {
  Workflow,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowStatistics,
} from '../types/workflow';

export const workflowsService = {
  // Workflow CRUD
  async create(data: CreateWorkflowDto): Promise<Workflow> {
    const response = await api.post('/workflows', data);
    return response.data;
  },

  async findAll(activeOnly?: boolean): Promise<Workflow[]> {
    const response = await api.get('/workflows', {
      params: { activeOnly },
    });
    return response.data;
  },

  async findOne(id: string): Promise<Workflow> {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateWorkflowDto): Promise<Workflow> {
    const response = await api.put(`/workflows/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/workflows/${id}`);
  },

  async activate(id: string): Promise<Workflow> {
    const response = await api.post(`/workflows/${id}/activate`);
    return response.data;
  },

  async deactivate(id: string): Promise<Workflow> {
    const response = await api.post(`/workflows/${id}/deactivate`);
    return response.data;
  },

  // Executions
  async getExecutions(
    id: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ executions: WorkflowExecution[]; total: number; page: number; limit: number }> {
    const response = await api.get(`/workflows/${id}/executions`, {
      params: { page, limit },
    });
    return response.data;
  },

  async getStatistics(id: string): Promise<WorkflowStatistics> {
    const response = await api.get(`/workflows/${id}/statistics`);
    return response.data;
  },

  async getExecution(executionId: string): Promise<WorkflowExecution> {
    const response = await api.get(`/workflows/executions/${executionId}`);
    return response.data;
  },

  // Templates
  async getTemplates(): Promise<WorkflowTemplate[]> {
    const response = await api.get('/workflows/templates/list');
    return response.data;
  },

  async getTemplateCategories(): Promise<string[]> {
    const response = await api.get('/workflows/templates/categories');
    return response.data;
  },

  async getTemplateByName(name: string): Promise<WorkflowTemplate> {
    const response = await api.get(`/workflows/templates/${name}`);
    return response.data;
  },

  async createFromTemplate(
    name: string,
    customizations?: Partial<CreateWorkflowDto>
  ): Promise<Workflow> {
    const response = await api.post(`/workflows/templates/${name}/create`, customizations);
    return response.data;
  },
};
