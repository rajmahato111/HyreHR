export enum TranscriptStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Speaker {
  id: string;
  name?: string;
  role: 'interviewer' | 'candidate' | 'unknown';
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface KeyPoint {
  text: string;
  timestamp: number;
  importance: 'high' | 'medium' | 'low';
  category: string;
}

export interface SentimentSegment {
  timestamp: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number;
  segments: SentimentSegment[];
}

export interface RedFlag {
  text: string;
  timestamp: number;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface GreenFlag {
  text: string;
  timestamp: number;
  reason: string;
}

export interface InterviewTranscript {
  id: string;
  interviewId: string;
  status: TranscriptStatus;
  speakers?: Speaker[];
  segments?: TranscriptSegment[];
  fullText?: string;
  keyPoints?: KeyPoint[];
  sentimentAnalysis?: SentimentAnalysis;
  redFlags?: RedFlag[];
  greenFlags?: GreenFlag[];
  summary?: string;
  suggestedFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartTranscriptionRequest {
  interviewId: string;
  audioUrl?: string;
  videoUrl?: string;
}

export interface UpdateTranscriptionRequest {
  segments?: TranscriptSegment[];
  fullText?: string;
}
