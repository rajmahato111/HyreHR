import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Interview } from './interview.entity';

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
  startTime: number; // seconds from start
  endTime: number;
  confidence: number; // 0-1
}

export interface KeyPoint {
  text: string;
  timestamp: number;
  importance: 'high' | 'medium' | 'low';
  category: string;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  segments: {
    timestamp: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
  }[];
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

@Entity('interview_transcripts')
export class InterviewTranscript {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interview_id' })
  interviewId: string;

  @ManyToOne(() => Interview)
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @Column({
    type: 'enum',
    enum: TranscriptStatus,
    default: TranscriptStatus.PROCESSING,
  })
  status: TranscriptStatus;

  @Column({ type: 'jsonb', nullable: true })
  speakers: Speaker[];

  @Column({ type: 'jsonb', nullable: true })
  segments: TranscriptSegment[];

  @Column({ type: 'text', nullable: true })
  fullText: string;

  @Column({ type: 'jsonb', nullable: true })
  keyPoints: KeyPoint[];

  @Column({ type: 'jsonb', nullable: true })
  sentimentAnalysis: SentimentAnalysis;

  @Column({ type: 'jsonb', nullable: true })
  redFlags: RedFlag[];

  @Column({ type: 'jsonb', nullable: true })
  greenFlags: GreenFlag[];

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  suggestedFeedback: string;

  @Column({ name: 'processing_started_at', type: 'timestamp', nullable: true })
  processingStartedAt: Date;

  @Column({ name: 'processing_completed_at', type: 'timestamp', nullable: true })
  processingCompletedAt: Date;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
