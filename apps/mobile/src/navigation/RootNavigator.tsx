import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '@/store/authStore';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ApplicationDetailScreen from '@/screens/ApplicationDetailScreen';
import InterviewDetailScreen from '@/screens/InterviewDetailScreen';
import InterviewFeedbackScreen from '@/screens/InterviewFeedbackScreen';
import CandidateDetailScreen from '@/screens/CandidateDetailScreen';
import SendEmailScreen from '@/screens/SendEmailScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="ApplicationDetail" 
              component={ApplicationDetailScreen}
              options={{ headerShown: true, title: 'Application' }}
            />
            <Stack.Screen 
              name="InterviewDetail" 
              component={InterviewDetailScreen}
              options={{ headerShown: true, title: 'Interview' }}
            />
            <Stack.Screen 
              name="InterviewFeedback" 
              component={InterviewFeedbackScreen}
              options={{ headerShown: true, title: 'Submit Feedback' }}
            />
            <Stack.Screen 
              name="CandidateDetail" 
              component={CandidateDetailScreen}
              options={{ headerShown: true, title: 'Candidate' }}
            />
            <Stack.Screen 
              name="SendEmail" 
              component={SendEmailScreen}
              options={{ headerShown: true, title: 'Send Email' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
