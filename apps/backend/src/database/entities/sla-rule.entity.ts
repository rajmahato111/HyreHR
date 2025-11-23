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

export enum SlaRuleType {
  TIME_TO_FIRST_REVIEW = 'time_to_first_review',
  TIME_TO_SCHEDULE_INTERVIEW = 'time_to_schedule_interview',
  TIME_TO_PROVIDE_FEEDBACK = 'time_to_provide_feedback',
  TIME_TO_OFFER = 'time_to_offer',
  TIME_TO_HIRE = 'time_to_hire',
}

@Entity('sla_rules')
export class SlaRule {
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
    enum: SlaRuleType,
  })
  type: SlaRuleType;

  @Column({ name: 'threshold_hours', type: 'integer' })
  thresholdHours: number;

  @Column({ name: 'alert_recipients', type: 'jsonb', default: [] })
  alertRecipients: string[];

  @Column({ name: 'escalation_recipients', type: 'jsonb', default: [] })
  escalationRecipients: string[];

  @Column({ name: 'escalation_hours', type: 'integer', nullable: true })
  escalationHours: number;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'job_ids', type: 'jsonb', nullable: true })
  jobIds: string[];

  @Column({ name: 'department_ids', type: 'jsonb', nullable: true })
  departmentIds: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
