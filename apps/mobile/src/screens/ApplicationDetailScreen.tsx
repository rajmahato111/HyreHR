import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { useApplicationStore } from '@/store/applicationStore';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

type RouteProps = RouteProp<RootStackParamList, 'ApplicationDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ApplicationDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { applicationId } = route.params;
  const { selectedApplication, isLoading, fetchApplication, moveApplication, rejectApplication } =
    useApplicationStore();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplication(applicationId);
  }, [applicationId]);

  const handleCall = () => {
    if (selectedApplication?.candidate.phone) {
      Linking.openURL(`tel:${selectedApplication.candidate.phone}`);
    }
  };

  const handleEmail = () => {
    navigation.navigate('SendEmail', {
      candidateId: selectedApplication!.candidate.id,
      applicationId: selectedApplication!.id,
    });
  };

  const handleViewCandidate = () => {
    navigation.navigate('CandidateDetail', {
      candidateId: selectedApplication!.candidate.id,
    });
  };

  const handleMoveStage = () => {
    Alert.alert(
      'Move to Stage',
      'Select the stage to move this application to',
      [
        { text: 'Phone Screen', onPress: () => moveToStage('phone_screen') },
        { text: 'Technical Interview', onPress: () => moveToStage('technical') },
        { text: 'Final Interview', onPress: () => moveToStage('final') },
        { text: 'Offer', onPress: () => moveToStage('offer') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const moveToStage = async (stageId: string) => {
    setActionLoading(true);
    try {
      await moveApplication(applicationId, stageId);
      Alert.alert('Success', 'Application moved successfully');
      fetchApplication(applicationId);
    } catch (error) {
      Alert.alert('Error', 'Failed to move application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this application?',
      [
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await rejectApplication(applicationId, 'not_qualified');
              Alert.alert('Success', 'Application rejected');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject application');
            } finally {
              setActionLoading(false);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (isLoading || !selectedApplication) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const { candidate, job, stage, appliedAt, rating } = selectedApplication;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Candidate</Text>
        <TouchableOpacity style={styles.candidateCard} onPress={handleViewCandidate}>
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>
              {candidate.firstName} {candidate.lastName}
            </Text>
            <Text style={styles.candidateEmail}>{candidate.email}</Text>
            {candidate.phone && (
              <Text style={styles.candidatePhone}>{candidate.phone}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Ionicons name="mail" size={20} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job</Text>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.jobDepartment}>{job.department}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Current Stage:</Text>
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeText}>{stage.name}</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Applied:</Text>
          <Text style={styles.value}>{format(new Date(appliedAt), 'MMM d, yyyy')}</Text>
        </View>
        {rating && (
          <View style={styles.statusRow}>
            <Text style={styles.label}>Rating:</Text>
            <Text style={styles.ratingValue}>★ {rating}/5</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, actionLoading && styles.buttonDisabled]}
          onPress={handleMoveStage}
          disabled={actionLoading}
        >
          <Text style={styles.primaryButtonText}>Move to Stage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerButton, actionLoading && styles.buttonDisabled]}
          onPress={handleReject}
          disabled={actionLoading}
        >
          <Text style={styles.dangerButtonText}>Reject</Text>
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
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  candidateEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  candidatePhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  jobDepartment: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  stageBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e40af',
  },
  ratingValue: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
