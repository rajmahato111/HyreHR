import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum SequenceStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export interface SequenceStep {
  order: number;
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
}

@Entity('email_sequences')
export class EmailSequence {
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
    enum: SequenceStatus,
    default: SequenceStatus.DRAFT,
  })
  status: SequenceStatus;

  @Column({ type: 'jsonb' })
  steps: SequenceStep[];

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'total_enrolled', default: 0 })
  totalEnrolled: number;

  @Column({ name: 'total_completed', default: 0 })
  totalCompleted: number;

  @Column({ name: 'total_replied', default: 0 })
  totalReplied: number;

  @Column({ name: 'open_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  openRate: number;

  @Column({ name: 'reply_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  replyRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
