# Offline Support Documentation

The mobile app includes comprehensive offline support to ensure users can continue working even without an internet connection.

## Features

### 1. Data Caching

The app automatically caches data locally using AsyncStorage:

- **Applications**: Cached for 5 minutes
- **Interviews**: Cached for 5 minutes
- **User Profile**: Cached indefinitely

When offline, the app will load data from cache instead of making API requests.

### 2. Action Queue

Actions performed while offline are queued and automatically synced when the connection is restored:

- Move application to different stage
- Reject application
- Submit interview feedback
- Send email to candidate

Each queued action includes:
- Unique ID
- Action type and payload
- Timestamp
- Retry count
- Status (pending, processing, failed)

### 3. Automatic Sync

The sync service runs automatically:

- **Periodic Sync**: Every 5 minutes when online
- **Connection Restore**: Immediately when coming back online
- **Manual Sync**: User can trigger sync from offline indicator

### 4. Retry Logic

Failed actions are automatically retried:
- Maximum 3 retry attempts
- Exponential backoff between retries
- Failed actions can be manually retried

## Implementation Details

### Services

#### OfflineService (`src/services/offlineService.ts`)

Handles data caching using AsyncStorage:

```typescript
// Cache data
await offlineService.cacheApplications(applications);

// Retrieve cached data
const cached = await offlineService.getCachedApplications();

// Check if cache is stale
const isStale = await offlineService.isCacheStale(key, maxAge);
```

#### OfflineQueueService (`src/services/offlineQueueService.ts`)

Manages the queue of pending actions:

```typescript
// Add action to queue
await offlineQueueService.addToQueue('move_application', {
  applicationId: 'uuid',
  stageId: 'uuid',
});

// Process all pending actions
await offlineQueueService.processQueue();

// Get pending count
const count = offlineQueueService.getPendingCount();
```

#### SyncService (`src/services/syncService.ts`)

Coordinates offline/online state and syncing:

```typescript
// Initialize sync service
await syncService.initialize();

// Check connection status
const isOnline = syncService.isConnected();

// Trigger manual sync
await syncService.syncNow();

// Listen for network changes
const unsubscribe = syncService.addNetworkListener((isOnline) => {
  console.log('Network status:', isOnline);
});
```

### Store Integration

The Zustand stores are integrated with offline services:

```typescript
// In applicationStore.ts
fetchApplications: async () => {
  try {
    const data = await apiClient.getApplications();
    await offlineService.cacheApplications(data);
  } catch (error) {
    if (!syncService.isConnected()) {
      const cached = await offlineService.getCachedApplications();
      if (cached) {
        set({ applications: cached });
        return;
      }
    }
    throw error;
  }
}

moveApplication: async (id, stageId) => {
  if (syncService.isConnected()) {
    await apiClient.moveApplication(id, stageId);
  } else {
    await offlineQueueService.addToQueue('move_application', {
      applicationId: id,
      stageId,
    });
  }
}
```

## User Experience

### Offline Indicator

The `OfflineIndicator` component shows:
- Current connection status
- Number of pending actions
- Sync button to manually trigger sync

### Optimistic Updates

When performing actions offline:
1. Action is queued immediately
2. UI updates optimistically
3. Action syncs when connection is restored
4. If sync fails, user is notified

### Cache Expiration

Cached data includes timestamps and expiration times:
- Stale data is automatically refreshed when online
- Users can manually refresh with pull-to-refresh

## Testing Offline Mode

### iOS Simulator

1. Open Settings app
2. Toggle Airplane Mode on
3. Test app functionality

### Android Emulator

1. Swipe down from top
2. Toggle Airplane Mode on
3. Test app functionality

### Physical Device

1. Enable Airplane Mode
2. Test app functionality
3. Disable Airplane Mode to test sync

## Best Practices

### For Developers

1. **Always check connection status** before making API calls
2. **Cache data after successful fetches** to ensure offline availability
3. **Queue actions when offline** instead of showing errors
4. **Provide feedback** to users about offline status
5. **Handle sync failures gracefully** with retry logic

### For Users

1. **Check offline indicator** at top of screen
2. **Wait for sync** after coming back online
3. **Use manual sync** if automatic sync doesn't trigger
4. **Review pending actions** before logging out

## Troubleshooting

### Actions Not Syncing

1. Check network connection
2. Verify pending actions count in offline indicator
3. Try manual sync
4. Check app logs for errors

### Stale Data

1. Pull to refresh on list screens
2. Force close and reopen app
3. Clear cache (Settings > Clear Cache)

### Queue Growing Too Large

1. Ensure stable internet connection
2. Manually sync pending actions
3. Check for failed actions and retry
4. Clear queue if actions are no longer needed

## Configuration

Offline behavior can be configured in `src/config/constants.ts`:

```typescript
// Sync interval (milliseconds)
export const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Maximum retry attempts
export const MAX_RETRY_ATTEMPTS = 3;

// Cache keys
export const CACHE_KEYS = {
  USER: 'user',
  APPLICATIONS: 'applications',
  INTERVIEWS: 'interviews',
  PENDING_ACTIONS: 'pending_actions',
};
```

## Future Enhancements

Potential improvements for offline support:

1. **Conflict Resolution**: Handle conflicts when multiple devices modify same data
2. **Selective Sync**: Allow users to choose what data to cache
3. **Background Sync**: Use background tasks for syncing
4. **Compression**: Compress cached data to save storage
5. **Encryption**: Encrypt sensitive cached data
6. **Smart Caching**: Predict and pre-cache data user is likely to need
