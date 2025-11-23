import { create } from 'zustand';
import { apiClient } from '@/services/api';
import { offlineService } from '@/services/offlineService';
import { offlineQueueService } from '@/services/offlineQueueService';
import { syncService } from '@/services/syncService';

interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  stageId: string;
  status: string;
  appliedAt: string;
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  job: {
    id: string;
    title: string;
    department: string;
  };
  stage: {
    id: string;
    name: string;
  };
  rating?: number;
}

interface ApplicationState {
  applications: Application[];
  selectedApplication: Application | null;
  isLoading: boolean;
  error: string | null;
  fetchApplications: (filters?: any) => Promise<void>;
  fetchApplication: (id: string) => Promise<void>;
  moveApplication: (id: string, stageId: string) => Promise<void>;
  rejectApplication: (id: string, reasonId: string, notes?: string) => Promise<void>;
  clearError: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,

  fetchApplications: async (filters?: any) => {
    set({ isLoading: true, error: null });
    try {
      // Try to fetch from API
      const data = await apiClient.getApplications(filters);
      set({ applications: data, isLoading: false });
      
      // Cache the data
      await offlineService.cacheApplications(data);
    } catch (error: any) {
      // If offline, try to load from cache
      if (!syncService.isConnected()) {
        const cached = await offlineService.getCachedApplications();
        if (cached) {
          set({ applications: cached, isLoading: false });
          return;
        }
      }
      
      set({ 
        error: error.response?.data?.message || 'Failed to fetch applications', 
        isLoading: false 
      });
    }
  },

  fetchApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getApplication(id);
      set({ selectedApplication: data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch application', 
        isLoading: false 
      });
    }
  },

  moveApplication: async (id: string, stageId: string) => {
    set({ isLoading: true, error: null });
    try {
      if (syncService.isConnected()) {
        await apiClient.moveApplication(id, stageId);
        // Refresh applications
        await get().fetchApplications();
      } else {
        // Queue for later if offline
        await offlineQueueService.addToQueue('move_application', {
          applicationId: id,
          stageId,
        });
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to move application', 
        isLoading: false 
      });
      throw error;
    }
  },

  rejectApplication: async (id: string, reasonId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      if (syncService.isConnected()) {
        await apiClient.rejectApplication(id, reasonId, notes);
        // Refresh applications
        await get().fetchApplications();
      } else {
        // Queue for later if offline
        await offlineQueueService.addToQueue('reject_application', {
          applicationId: id,
          reasonId,
          notes,
        });
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to reject application', 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
