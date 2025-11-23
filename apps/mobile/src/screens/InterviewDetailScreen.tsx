import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { useInterviewStore } from '@/store/interviewStore';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

type RouteProps = RouteProp<RootStackParamList, 'InterviewDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function InterviewDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { interviewId } = route.params;
  const { selectedInterview, isLoading, fetchInterview } = useInterviewStore();

  useEffect(() => {
    fetchInterview(interviewId);
  }, [interviewId]);

  const handleJoinMeeting = () => {
    if (selectedInterview?.meetingLink) {
      Linking.openURL(selectedInterview.meetingLink);
    }
  };

  const handleSubmitFeedback = () => {
    navigation.navigate('InterviewFeedback', { interviewId });
  };

  if (isLoading || !selectedInterview) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const { candidate, job, scheduledAt, durationMinutes, locationType, locationDetails, participants } =
    selectedInterview;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleRow}>
            <Ionicons name="calendar" size={20} color="#3b82f6" />
            <Text style={styles.scheduleText}>
              {format(new Date(scheduledAt), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <View style={styles.scheduleRow}>
            <Ionicons name="time" size={20} color="#3b82f6" />
            <Text style={styles.scheduleText}>
              {format(new Date(scheduledAt), 'h:mm a')} ({durationMinutes} min)
            </Text>
          </View>
          <View style={styles.scheduleRow}>
            <Ionicons
              name={locationType === 'video' ? 'videocam' : 'location'}
              size={20}
              color="#3b82f6"
            />
            <Text style={styles.scheduleText}>
              {locationType === 'video' ? 'Video Call' : locationDetails || locationType}
            </Text>
          </View>
        </View>

        {locationType === 'video' && (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinMeeting}>
            <Ionicons name="videocam" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Join Meeting</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Candidate</Text>
        <TouchableOpacity
          style={styles.candidateCard}
          onPress={() => navigation.navigate('CandidateDetail', { candidateId: candidate.id })}
        >
          <View>
            <Text style={styles.candidateName}>
              {candidate.firstName} {candidate.lastName}
            </Text>
            <Text style={styles.candidateEmail}>{candidate.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job</Text>
        <Text style={styles.jobTitle}>{job.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants</Text>
        {participants.map((participant, index) => (
          <View key={index} style={styles.participantRow}>
            <View style={styles.participantAvatar}>
              <Text style={styles.participantInitial}>
                {participant.user.firstName[0]}
              </Text>
            </View>
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>
                {participant.user.firstName} {participant.user.lastName}
              </Text>
              <Text style={styles.participantRole}>{participant.role}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.feedbackButton} onPress={handleSubmitFeedback}>
          <Text style={styles.feedbackButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  scheduleCard: {
    gap: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleText: {
    fontSize: 16,
    color: '#1f2937',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  candidateEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  participantRole: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  actions: {
    padding: 16,
  },
  feedbackButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
