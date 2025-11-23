import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum SurveyTriggerType {
  POST_APPLICATION = 'post_application',
  POST_INTERVIEW = 'post_interview',
  POST_REJECTION = 'post_rejection',
  POST_OFFER = 'post_offer',
  MANUAL = 'manual',
}

export enum SurveyQuestionType {
  NPS = 'nps',
  RATING = 'rating',
  TEXT = 'text',
  MULTIPLE_CHOICE = 'multiple_choice',
  YES_NO = 'yes_no',
}

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  question: string;
  required: boolean;
  options?: string[];
  order: number;
}

@Entity('surveys')
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SurveyTriggerType,
  })
  triggerType: SurveyTriggerType;

  @Column({ type: 'jsonb' })
  questions: SurveyQuestion[];

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'send_delay_hours', default: 0 })
  sendDelayHours: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
