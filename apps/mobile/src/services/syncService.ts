import NetInfo from '@react-native-community/netinfo';
import { offlineService } from './offlineService';
import { offlineQueueService } from './offlineQueueService';
import { useApplicationStore } from '@/store/applicationStore';
import { useInterviewStore } from '@/store/interviewStore';
import { SYNC_INTERVAL } from '@/config/constants';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = true;
  private listeners: Array<(isOnline: boolean) => void> = [];

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    // Initialize offline queue
    await offlineQueueService.initialize();

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // Notify listeners
      this.listeners.forEach((listener) => listener(this.isOnline));

      // If coming back online, sync immediately
      if (wasOffline && this.isOnline) {
        this.syncNow();
      }
    });

    // Start periodic sync
    this.startPeriodicSync();
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncNow();
      }
    }, SYNC_INTERVAL);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync now
   */
  async syncNow(): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      // Process pending actions first
      await offlineQueueService.processQueue();

      // Fetch fresh data
      await this.fetchFreshData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  /**
   * Fetch fresh data from server
   */
  private async fetchFreshData(): Promise<void> {
    try {
      // Fetch applications
      const applicationStore = useApplicationStore.getState();
      await applicationStore.fetchApplications();

      // Fetch interviews
      const interviewStore = useInterviewStore.getState();
      await interviewStore.fetchInterviews();
    } catch (error) {
      console.error('Failed to fetch fresh data:', error);
    }
  }

  /**
   * Check if online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Add network status listener
   */
  addNetworkListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get pending actions count
   */
  getPendingActionsCount(): number {
    return offlineQueueService.getPendingCount();
  }

  /**
   * Force sync with retry
   */
  async forceSyncWithRetry(maxRetries = 3): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.syncNow();
        return true;
      } catch (error) {
        console.error(`Sync attempt ${i + 1} failed:`, error);
        if (i < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    return false;
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    await offlineService.clearCache();
    await offlineQueueService.clearQueue();
  }
}

export const syncService = new SyncService();
