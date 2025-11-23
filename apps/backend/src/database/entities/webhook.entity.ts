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
import { Integration } from './integration.entity';

export enum WebhookEvent {
  APPLICATION_CREATED = 'application.created',
  APPLICATION_STAGE_CHANGED = 'application.stage_changed',
  APPLICATION_REJECTED = 'application.rejected',
  APPLICATION_HIRED = 'application.hired',
  INTERVIEW_SCHEDULED = 'interview.scheduled',
  INTERVIEW_COMPLETED = 'interview.completed',
  INTERVIEW_CANCELLED = 'interview.cancelled',
  OFFER_CREATED = 'offer.created',
  OFFER_SENT = 'offer.sent',
  OFFER_ACCEPTED = 'offer.accepted',
  OFFER_DECLINED = 'offer.declined',
  CANDIDATE_CREATED = 'candidate.created',
  CANDIDATE_UPDATED = 'candidate.updated',
  JOB_CREATED = 'job.created',
  JOB_OPENED = 'job.opened',
  JOB_CLOSED = 'job.closed',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
}

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'integration_id', type: 'uuid', nullable: true })
  integrationId: string;

  @ManyToOne(() => Integration, { nullable: true })
  @JoinColumn({ name: 'integration_id' })
  integration: Integration;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secret: string;

  @Column({
    type: 'enum',
    enum: WebhookStatus,
    default: WebhookStatus.ACTIVE,
  })
  status: WebhookStatus;

  @Column({ type: 'simple-array' })
  events: WebhookEvent[];

  @Column({ type: 'jsonb', default: {} })
  headers: Record<string, string>;

  @Column({ type: 'int', default: 3 })
  retryAttempts: number;

  @Column({ type: 'int', default: 30000 })
  timeoutMs: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccessAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
