import { create } from 'zustand';
import { apiClient } from '@/services/api';
import { offlineService } from '@/services/offlineService';
import { offlineQueueService } from '@/services/offlineQueueService';
import { syncService } from '@/services/syncService';

interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  locationType: string;
  locationDetails?: string;
  meetingLink?: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
  };
  participants: Array<{
    userId: string;
    role: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

interface InterviewState {
  interviews: Interview[];
  selectedInterview: Interview | null;
  isLoading: boolean;
  error: string | null;
  fetchInterviews: (filters?: any) => Promise<void>;
  fetchInterview: (id: string) => Promise<void>;
  submitFeedback: (interviewId: string, feedback: any) => Promise<void>;
  clearError: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  interviews: [],
  selectedInterview: null,
  isLoading: false,
  error: null,

  fetchInterviews: async (filters?: any) => {
    set({ isLoading: true, error: null });
    try {
      // Try to fetch from API
      const data = await apiClient.getInterviews(filters);
      set({ interviews: data, isLoading: false });
      
      // Cache the data
      await offlineService.cacheInterviews(data);
    } catch (error: any) {
      // If offline, try to load from cache
      if (!syncService.isConnected()) {
        const cached = await offlineService.getCachedInterviews();
        if (cached) {
          set({ interviews: cached, isLoading: false });
          return;
        }
      }
      
      set({ 
        error: error.response?.data?.message || 'Failed to fetch interviews', 
        isLoading: false 
      });
    }
  },

  fetchInterview: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getInterview(id);
      set({ selectedInterview: data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch interview', 
        isLoading: false 
      });
    }
  },

  submitFeedback: async (interviewId: string, feedback: any) => {
    set({ isLoading: true, error: null });
    try {
      if (syncService.isConnected()) {
        await apiClient.submitFeedback(interviewId, feedback);
      } else {
        // Queue for later if offline
        await offlineQueueService.addToQueue('submit_feedback', {
          interviewId,
          feedback,
        });
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to submit feedback', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
