// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';

// App Configuration
export const APP_NAME = 'Recruiting Platform';
export const APP_VERSION = '1.0.0';

// Notification Configuration
export const NOTIFICATION_CHANNELS = {
  DEFAULT: 'default',
  INTERVIEWS: 'interviews',
  APPLICATIONS: 'applications',
  URGENT: 'urgent',
};

// Cache Configuration
export const CACHE_KEYS = {
  USER: 'user',
  APPLICATIONS: 'applications',
  INTERVIEWS: 'interviews',
  PENDING_ACTIONS: 'pending_actions',
};

// Sync Configuration
export const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const MAX_RETRY_ATTEMPTS = 3;
