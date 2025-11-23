import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_KEYS, MAX_RETRY_ATTEMPTS } from '@/config/constants';
import { apiClient } from './api';

export interface QueuedAction {
  id: string;
  type: 'move_application' | 'reject_application' | 'submit_feedback' | 'send_email';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
  error?: string;
}

class OfflineQueueService {
  private queue: QueuedAction[] = [];
  private isProcessing = false;

  /**
   * Initialize queue from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEYS.PENDING_ACTIONS);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to initialize queue:', error);
    }
  }

  /**
   * Add action to queue
   */
  async addToQueue(
    type: QueuedAction['type'],
    payload: any
  ): Promise<string> {
    const action: QueuedAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(action);
    await this.saveQueue();
    return action.id;
  }

  /**
   * Process all pending actions
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    const pendingActions = this.queue.filter(
      (action) => action.status === 'pending' || action.status === 'failed'
    );

    for (const action of pendingActions) {
      if (action.retryCount >= MAX_RETRY_ATTEMPTS) {
        // Mark as permanently failed
        action.status = 'failed';
        action.error = 'Max retry attempts reached';
        continue;
      }

      try {
        action.status = 'processing';
        await this.executeAction(action);

        // Remove from queue on success
        this.queue = this.queue.filter((a) => a.id !== action.id);
      } catch (error: any) {
        action.status = 'failed';
        action.retryCount++;
        action.error = error.message || 'Unknown error';
      }
    }

    await this.saveQueue();
    this.isProcessing = false;
  }

  /**
   * Execute a queued action
   */
  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'move_application':
        await apiClient.moveApplication(
          action.payload.applicationId,
          action.payload.stageId
        );
        break;

      case 'reject_application':
        await apiClient.rejectApplication(
          action.payload.applicationId,
          action.payload.reasonId,
          action.payload.notes
        );
        break;

      case 'submit_feedback':
        await apiClient.submitFeedback(
          action.payload.interviewId,
          action.payload.feedback
        );
        break;

      case 'send_email':
        await apiClient.sendEmail(action.payload);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_KEYS.PENDING_ACTIONS,
        JSON.stringify(this.queue)
      );
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }

  /**
   * Get all queued actions
   */
  getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  /**
   * Get pending actions count
   */
  getPendingCount(): number {
    return this.queue.filter(
      (action) => action.status === 'pending' || action.status === 'failed'
    ).length;
  }

  /**
   * Clear all actions
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Remove specific action
   */
  async removeAction(actionId: string): Promise<void> {
    this.queue = this.queue.filter((action) => action.id !== actionId);
    await this.saveQueue();
  }

  /**
   * Retry failed actions
   */
  async retryFailedActions(): Promise<void> {
    const failedActions = this.queue.filter((action) => action.status === 'failed');
    
    for (const action of failedActions) {
      action.status = 'pending';
      action.retryCount = 0;
      action.error = undefined;
    }

    await this.saveQueue();
    await this.processQueue();
  }
}

export const offlineQueueService = new OfflineQueueService();
