import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';
import { useInterviewStore } from '@/store/interviewStore';
import { Ionicons } from '@expo/vector-icons';

type RouteProps = RouteProp<RootStackParamList, 'InterviewFeedback'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const RATING_OPTIONS = [1, 2, 3, 4, 5];
const DECISION_OPTIONS = [
  { value: 'strong_yes', label: 'Strong Yes', color: '#10b981' },
  { value: 'yes', label: 'Yes', color: '#84cc16' },
  { value: 'neutral', label: 'Neutral', color: '#f59e0b' },
  { value: 'no', label: 'No', color: '#f97316' },
  { value: 'strong_no', label: 'Strong No', color: '#ef4444' },
];

export default function InterviewFeedbackScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { interviewId } = route.params;
  const { submitFeedback, isLoading } = useInterviewStore();

  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [strengths, setStrengths] = useState('');
  const [concerns, setConcerns] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!overallRating || !decision) {
      Alert.alert('Error', 'Please provide an overall rating and decision');
      return;
    }

    if (!strengths.trim() || !concerns.trim()) {
      Alert.alert('Error', 'Please provide strengths and concerns');
      return;
    }

    try {
      await submitFeedback(interviewId, {
        overallRating,
        decision,
        strengths,
        concerns,
        notes,
        attributeRatings: [],
      });

      Alert.alert('Success', 'Feedback submitted successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Rating</Text>
        <View style={styles.ratingContainer}>
          {RATING_OPTIONS.map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                overallRating === rating && styles.ratingButtonSelected,
              ]}
              onPress={() => setOverallRating(rating)}
            >
              <Ionicons
                name="star"
                size={24}
                color={overallRating === rating ? '#f59e0b' : '#d1d5db'}
              />
              <Text
                style={[
                  styles.ratingText,
                  overallRating === rating && styles.ratingTextSelected,
                ]}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decision</Text>
        <View style={styles.decisionContainer}>
          {DECISION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.decisionButton,
                decision === option.value && {
                  backgroundColor: option.color,
                  borderColor: option.color,
                },
              ]}
              onPress={() => setDecision(option.value)}
            >
              <Text
                style={[
                  styles.decisionText,
                  decision === option.value && styles.decisionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strengths</Text>
        <TextInput
          style={styles.textArea}
          placeholder="What did the candidate do well?"
          value={strengths}
          onChangeText={setStrengths}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Concerns</Text>
        <TextInput
          style={styles.textArea}
          placeholder="What are your concerns about the candidate?"
          value={concerns}
          onChangeText={setConcerns}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any additional comments..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
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
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    flex: 1,
    marginHorizontal: 4,
  },
  ratingButtonSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  ratingTextSelected: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  decisionContainer: {
    gap: 8,
  },
  decisionButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  decisionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  decisionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  actions: {
    padding: 16,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
