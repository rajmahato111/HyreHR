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
import { useApplicationStore } from '@/store/applicationStore';
import { format } from 'date-fns';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ApplicationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { applications, isLoading, fetchApplications } = useApplicationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  const renderApplication = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ApplicationDetail', { applicationId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.candidateName}>
          {item.candidate.firstName} {item.candidate.lastName}
        </Text>
        <View style={[styles.badge, getStatusBadgeStyle(item.status)]}>
          <Text style={styles.badgeText}>{item.stage.name}</Text>
        </View>
      </View>

      <Text style={styles.jobTitle}>{item.job.title}</Text>
      <Text style={styles.department}>{item.job.department}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          Applied {format(new Date(item.appliedAt), 'MMM d, yyyy')}
        </Text>
        {item.rating && (
          <View style={styles.rating}>
            <Text style={styles.ratingText}>★ {item.rating}/5</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && applications.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No applications found</Text>
          </View>
        }
      />
    </View>
  );
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'active':
      return { backgroundColor: '#dbeafe' };
    case 'rejected':
      return { backgroundColor: '#fee2e2' };
    case 'hired':
      return { backgroundColor: '#d1fae5' };
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
    alignItems: 'center',
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  jobTitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
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
