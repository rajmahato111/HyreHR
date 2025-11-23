import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { Candidate } from './candidate.entity';
import { Application } from './application.entity';
import { Interview } from './interview.entity';

export enum SurveyResponseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum SentimentScore {
  VERY_NEGATIVE = 'very_negative',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  POSITIVE = 'positive',
  VERY_POSITIVE = 'very_positive',
}

export interface QuestionAnswer {
  questionId: string;
  answer: string | number | string[];
}

@Entity('survey_responses')
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'survey_id' })
  surveyId: string;

  @ManyToOne(() => Survey)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'application_id', nullable: true })
  applicationId: string;

  @ManyToOne(() => Application, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'interview_id', nullable: true })
  interviewId: string;

  @ManyToOne(() => Interview, { nullable: true })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @Column({
    type: 'enum',
    enum: SurveyResponseStatus,
    default: SurveyResponseStatus.PENDING,
  })
  status: SurveyResponseStatus;

  @Column({ type: 'jsonb', nullable: true })
  answers: QuestionAnswer[];

  @Column({ name: 'nps_score', type: 'integer', nullable: true })
  npsScore: number;

  @Column({
    type: 'enum',
    enum: SentimentScore,
    nullable: true,
  })
  sentiment: SentimentScore;

  @Column({ type: 'text', nullable: true })
  sentimentAnalysis: string;

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'response_token', unique: true })
  responseToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
