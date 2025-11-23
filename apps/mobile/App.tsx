import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import { notificationService } from './src/services/notificationService';
import { syncService } from './src/services/syncService';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize sync service
    syncService.initialize();

    // Initialize notifications
    if (isAuthenticated) {
      notificationService.initialize();
    }

    // Listen for notifications
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle notification tap - navigate to relevant screen
        const data = response.notification.request.content.data;
        if (data.type === 'interview' && data.interviewId) {
          // Navigate to interview detail
        } else if (data.type === 'application' && data.applicationId) {
          // Navigate to application detail
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      syncService.stopPeriodicSync();
    };
  }, [isAuthenticated]);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
