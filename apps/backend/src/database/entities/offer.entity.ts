import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from './application.entity';

export enum OfferStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  WITHDRAWN = 'withdrawn',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface OfferApprover {
  userId: string;
  order: number;
  status: ApprovalStatus;
  approvedAt?: Date;
  rejectedAt?: Date;
  comments?: string;
}

export interface EquityDetails {
  type: 'stock_options' | 'rsu' | 'equity_grant';
  amount: number;
  vestingSchedule?: string;
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId?: string;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.DRAFT,
  })
  status: OfferStatus;

  @Column({ name: 'job_title', type: 'varchar', length: 255 })
  jobTitle: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  bonus?: number;

  @Column({ type: 'jsonb', nullable: true })
  equity?: EquityDetails;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'text', nullable: true })
  benefits?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'approval_workflow', type: 'jsonb', nullable: true })
  approvalWorkflow?: OfferApprover[];

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ name: 'declined_at', type: 'timestamp', nullable: true })
  declinedAt?: Date;

  @Column({ name: 'withdrawn_at', type: 'timestamp', nullable: true })
  withdrawnAt?: Date;

  @Column({ name: 'docusign_envelope_id', type: 'varchar', nullable: true })
  docusignEnvelopeId?: string;

  @Column({ name: 'docusign_status', type: 'varchar', nullable: true })
  docusignStatus?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
