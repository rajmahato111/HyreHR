import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Interview } from './interview.entity';
import { User } from './user.entity';
import { Scorecard } from './scorecard.entity';

export enum Decision {
  STRONG_YES = 'strong_yes',
  YES = 'yes',
  NEUTRAL = 'neutral',
  NO = 'no',
  STRONG_NO = 'strong_no',
}

export interface AttributeRating {
  attributeId: string;
  value: any;
}

@Entity('interview_feedback')
export class InterviewFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interview_id' })
  interviewId: string;

  @ManyToOne(() => Interview, (interview) => interview.feedback)
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @Column({ name: 'interviewer_id' })
  interviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'interviewer_id' })
  interviewer: User;

  @Column({ name: 'scorecard_id', nullable: true })
  scorecardId: string;

  @ManyToOne(() => Scorecard, { nullable: true })
  @JoinColumn({ name: 'scorecard_id' })
  scorecard: Scorecard;

  @Column({ name: 'overall_rating', nullable: true })
  overallRating: number;

  @Column({
    type: 'enum',
    enum: Decision,
    nullable: true,
  })
  decision: Decision;

  @Column({ name: 'attribute_ratings', type: 'jsonb', default: '[]' })
  attributeRatings: AttributeRating[];

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  concerns: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
