import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { useInterviewStore } from '@/store/interviewStore';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function InterviewsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { interviews, isLoading, fetchInterviews } = useInterviewStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInterviews();
    setRefreshing(false);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const renderInterview = ({ item }: any) => {
    const scheduledDate = new Date(item.scheduledAt);
    const isCompleted = item.status === 'completed';
    const isUpcoming = !isPast(scheduledDate) && !isCompleted;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InterviewDetail', { interviewId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>{getDateLabel(scheduledDate)}</Text>
            <Text style={styles.time}>{format(scheduledDate, 'h:mm a')}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.candidateName}>
          {item.candidate.firstName} {item.candidate.lastName}
        </Text>
        <Text style={styles.jobTitle}>{item.job.title}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.locationInfo}>
            <Ionicons
              name={item.locationType === 'video' ? 'videocam' : 'location'}
              size={16}
              color="#6b7280"
            />
            <Text style={styles.locationType}>{item.locationType}</Text>
          </View>

          {isCompleted && (
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => navigation.navigate('InterviewFeedback', { interviewId: item.id })}
            >
              <Text style={styles.feedbackButtonText}>Add Feedback</Text>
            </TouchableOpacity>
          )}
        </View>

        {isUpcoming && (
          <View style={styles.upcomingBanner}>
            <Ionicons name="time" size={16} color="#3b82f6" />
            <Text style={styles.upcomingText}>Upcoming</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && interviews.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={interviews}
        renderItem={renderInterview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No interviews scheduled</Text>
          </View>
        }
      />
    </View>
  );
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'scheduled':
      return { backgroundColor: '#dbeafe' };
    case 'completed':
      return { backgroundColor: '#d1fae5' };
    case 'cancelled':
      return { backgroundColor: '#fee2e2' };
    default:
      return { backgroundColor: '#f3f4f6' };
  }
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
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  time: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textTransform: 'capitalize',
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationType: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  feedbackButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  feedbackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  upcomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
