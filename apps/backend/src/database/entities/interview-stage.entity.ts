import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { InterviewPlan } from './interview-plan.entity';
import { Scorecard } from './scorecard.entity';

export enum InterviewStageType {
  PHONE_SCREEN = 'phone_screen',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  ONSITE = 'onsite',
  PANEL = 'panel',
  CASE_STUDY = 'case_study',
  PRESENTATION = 'presentation',
  FINAL = 'final',
}

@Entity('interview_stages')
export class InterviewStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'interview_plan_id' })
  interviewPlanId: string;

  @ManyToOne(() => InterviewPlan, (plan) => plan.stages)
  @JoinColumn({ name: 'interview_plan_id' })
  interviewPlan: InterviewPlan;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: InterviewStageType,
  })
  type: InterviewStageType;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ name: 'scorecard_id', nullable: true })
  scorecardId: string;

  @ManyToOne(() => Scorecard, { nullable: true })
  @JoinColumn({ name: 'scorecard_id' })
  scorecard: Scorecard;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
