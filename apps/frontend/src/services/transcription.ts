import api from './api';
import {
  InterviewTranscript,
  StartTranscriptionRequest,
  UpdateTranscriptionRequest,
} from '../types/transcription';

export const transcriptionService = {
  // Start transcription for an interview
  startTranscription: async (
    interviewId: string,
    data: Partial<StartTranscriptionRequest>
  ): Promise<{ message: string; transcript: Partial<InterviewTranscript> }> => {
    const response = await api.post(
      `/interviews/${interviewId}/transcription/start`,
      data
    );
    return response.data;
  },

  // Get transcription for an interview
  getTranscription: async (
    interviewId: string
  ): Promise<{ transcript: InterviewTranscript | null }> => {
    const response = await api.get(`/interviews/${interviewId}/transcription`);
    return response.data;
  },

  // Update transcript segments (for real-time updates)
  updateTranscriptSegments: async (
    transcriptId: string,
    data: UpdateTranscriptionRequest
  ): Promise<{ message: string; transcript: Partial<InterviewTranscript> }> => {
    const response = await api.put(
      `/interviews/transcription/${transcriptId}/segments`,
      data
    );
    return response.data;
  },

  // Delete transcription
  deleteTranscription: async (transcriptId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/interviews/transcription/${transcriptId}`);
    return response.data;
  },
};
