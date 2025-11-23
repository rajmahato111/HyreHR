import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/config/constants';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await SecureStore.getItemAsync('auth_token');
        }
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearToken();
          // Emit event for logout
          // You can use an event emitter or navigation here
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    this.token = token;
    await SecureStore.setItemAsync('auth_token', token);
  }

  async clearToken() {
    this.token = null;
    await SecureStore.deleteItemAsync('auth_token');
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await SecureStore.getItemAsync('auth_token');
    }
    return this.token;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.token) {
      await this.setToken(response.data.token);
    }
    return response.data;
  }

  async logout() {
    await this.clearToken();
  }

  // Applications endpoints
  async getApplications(params?: any) {
    const response = await this.client.get('/applications', { params });
    return response.data;
  }

  async getApplication(id: string) {
    const response = await this.client.get(`/applications/${id}`);
    return response.data;
  }

  async moveApplication(id: string, stageId: string) {
    const response = await this.client.post(`/applications/${id}/move`, { stageId });
    return response.data;
  }

  async rejectApplication(id: string, reasonId: string, notes?: string) {
    const response = await this.client.post(`/applications/${id}/reject`, { 
      reasonId, 
      notes 
    });
    return response.data;
  }

  // Candidates endpoints
  async getCandidate(id: string) {
    const response = await this.client.get(`/candidates/${id}`);
    return response.data;
  }

  // Communications endpoints
  async getCommunications(candidateId: string) {
    const response = await this.client.get('/communications', {
      params: { candidateId }
    });
    return response.data;
  }

  async sendEmail(data: {
    candidateId: string;
    subject: string;
    body: string;
    templateId?: string;
  }) {
    const response = await this.client.post('/communications/email', data);
    return response.data;
  }

  // Interviews endpoints
  async getInterviews(params?: any) {
    const response = await this.client.get('/interviews', { params });
    return response.data;
  }

  async getInterview(id: string) {
    const response = await this.client.get(`/interviews/${id}`);
    return response.data;
  }

  async submitFeedback(interviewId: string, feedback: any) {
    const response = await this.client.post(`/interviews/${interviewId}/feedback`, feedback);
    return response.data;
  }

  async getInterviewFeedback(interviewId: string) {
    const response = await this.client.get(`/interviews/${interviewId}/feedback`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
