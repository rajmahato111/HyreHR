import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syncService } from '@/services/syncService';
import { offlineQueueService } from '@/services/offlineQueueService';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initial state
    setIsOnline(syncService.isConnected());
    setPendingCount(syncService.getPendingActionsCount());

    // Listen for network changes
    const unsubscribe = syncService.addNetworkListener((online) => {
      setIsOnline(online);
      if (online) {
        // Update pending count after sync
        setTimeout(() => {
          setPendingCount(syncService.getPendingActionsCount());
        }, 1000);
      }
    });

    // Update pending count periodically
    const interval = setInterval(() => {
      setPendingCount(syncService.getPendingActionsCount());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    await syncService.syncNow();
    setPendingCount(syncService.getPendingActionsCount());
  };

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, !isOnline && styles.offline]}>
      <View style={styles.content}>
        <Ionicons
          name={isOnline ? 'cloud-upload' : 'cloud-offline'}
          size={16}
          color="#fff"
        />
        <Text style={styles.text}>
          {isOnline
            ? `${pendingCount} pending action${pendingCount !== 1 ? 's' : ''}`
            : 'Offline mode'}
        </Text>
      </View>
      {isOnline && pendingCount > 0 && (
        <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  offline: {
    backgroundColor: '#6b7280',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
