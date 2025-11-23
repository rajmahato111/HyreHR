import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { Application } from './application.entity';
import { User } from './user.entity';
import { EmailTemplate } from './email-template.entity';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  NOTE = 'note',
  CALL = 'call',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal',
}

export enum CommunicationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  FAILED = 'failed',
}

@Entity('communications')
export class Communication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'candidate_id', nullable: true })
  candidateId: string;

  @ManyToOne(() => Candidate, { nullable: true })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'application_id', nullable: true })
  applicationId: string;

  @ManyToOne(() => Application, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({
    type: 'enum',
    enum: CommunicationType,
  })
  type: CommunicationType;

  @Column({
    type: 'enum',
    enum: CommunicationDirection,
  })
  direction: CommunicationDirection;

  @Column({ name: 'from_email', length: 255, nullable: true })
  fromEmail: string;

  @Column('simple-array', { name: 'to_emails' })
  toEmails: string[];

  @Column('simple-array', { name: 'cc_emails', default: '' })
  ccEmails: string[];

  @Column('simple-array', { name: 'bcc_emails', default: '' })
  bccEmails: string[];

  @Column({ length: 500, nullable: true })
  subject: string;

  @Column('text', { nullable: true })
  body: string;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @ManyToOne(() => EmailTemplate, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: EmailTemplate;

  @Column({
    type: 'enum',
    enum: CommunicationStatus,
    default: CommunicationStatus.DRAFT,
  })
  status: CommunicationStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
  openedAt: Date;

  @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
  clickedAt: Date;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('simple-array', { default: '', nullable: true })
  attachments: string[];

  @Column('jsonb', { nullable: true, default: {} })
  metadata: Record<string, any>;

  @Column({ name: 'thread_id', nullable: true })
  threadId: string;

  @Column({ name: 'in_reply_to', nullable: true })
  inReplyTo: string;

  @Column({ name: 'external_id', nullable: true })
  externalId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
