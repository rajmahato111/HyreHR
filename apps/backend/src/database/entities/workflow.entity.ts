import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum WorkflowTriggerType {
  APPLICATION_CREATED = 'application_created',
  APPLICATION_STAGE_CHANGED = 'application_stage_changed',
  INTERVIEW_COMPLETED = 'interview_completed',
  INTERVIEW_FEEDBACK_SUBMITTED = 'interview_feedback_submitted',
  OFFER_SENT = 'offer_sent',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  CANDIDATE_CREATED = 'candidate_created',
  JOB_OPENED = 'job_opened',
  JOB_CLOSED = 'job_closed',
}

export enum WorkflowActionType {
  SEND_EMAIL = 'send_email',
  MOVE_TO_STAGE = 'move_to_stage',
  SEND_NOTIFICATION = 'send_notification',
  CREATE_TASK = 'create_task',
  UPDATE_FIELD = 'update_field',
  ASSIGN_USER = 'assign_user',
  ADD_TAG = 'add_tag',
  REMOVE_TAG = 'remove_tag',
}

export enum WorkflowConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
}

export interface WorkflowCondition {
  field: string;
  operator: WorkflowConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, any>;
  delayMinutes?: number;
}

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkflowTriggerType,
    name: 'trigger_type',
  })
  triggerType: WorkflowTriggerType;

  @Column({ type: 'jsonb', name: 'trigger_config', default: {} })
  triggerConfig: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  conditions: WorkflowCondition[];

  @Column({ type: 'jsonb', default: [] })
  actions: WorkflowAction[];

  @Column({ default: true })
  active: boolean;

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
