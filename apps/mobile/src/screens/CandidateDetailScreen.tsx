import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { apiClient } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

type RouteProps = RouteProp<RootStackParamList, 'CandidateDetail'>;

export default function CandidateDetailScreen() {
  const route = useRoute<RouteProps>();
  const { candidateId } = route.params;
  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCandidate();
  }, [candidateId]);

  const loadCandidate = async () => {
    try {
      const data = await apiClient.getCandidate(candidateId);
      setCandidate(data);
    } catch (error) {
      console.error('Failed to load candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    if (candidate?.phone) {
      Linking.openURL(`tel:${candidate.phone}`);
    }
  };

  const handleEmail = () => {
    if (candidate?.email) {
      Linking.openURL(`mailto:${candidate.email}`);
    }
  };

  const handleLinkedIn = () => {
    if (candidate?.linkedinUrl) {
      Linking.openURL(candidate.linkedinUrl);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!candidate) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Candidate not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {candidate.firstName[0]}
            {candidate.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {candidate.firstName} {candidate.lastName}
        </Text>
        {candidate.currentTitle && (
          <Text style={styles.title}>{candidate.currentTitle}</Text>
        )}
        {candidate.currentCompany && (
          <Text style={styles.company}>{candidate.currentCompany}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#3b82f6" />
          <Text style={styles.actionLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
          <Ionicons name="mail" size={24} color="#3b82f6" />
          <Text style={styles.actionLabel}>Email</Text>
        </TouchableOpacity>
        {candidate.linkedinUrl && (
          <TouchableOpacity style={styles.actionButton} onPress={handleLinkedIn}>
            <Ionicons name="logo-linkedin" size={24} color="#3b82f6" />
            <Text style={styles.actionLabel}>LinkedIn</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color="#6b7280" />
          <Text style={styles.infoText}>{candidate.email}</Text>
        </View>
        {candidate.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#6b7280" />
            <Text style={styles.infoText}>{candidate.phone}</Text>
          </View>
        )}
        {candidate.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#6b7280" />
            <Text style={styles.infoText}>
              {candidate.location.city}, {candidate.location.state}
            </Text>
          </View>
        )}
      </View>

      {candidate.tags && candidate.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {candidate.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  errorText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#3b82f6',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#1f2937',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});
