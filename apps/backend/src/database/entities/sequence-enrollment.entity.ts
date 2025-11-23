import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { EmailSequence } from './email-sequence.entity';
import { Candidate } from './candidate.entity';
import { TalentPool } from './talent-pool.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced',
}

export enum ResponseSentiment {
  INTERESTED = 'interested',
  NOT_INTERESTED = 'not_interested',
  NEUTRAL = 'neutral',
}

@Entity('sequence_enrollments')
export class SequenceEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sequence_id' })
  sequenceId: string;

  @ManyToOne(() => EmailSequence)
  @JoinColumn({ name: 'sequence_id' })
  sequence: EmailSequence;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'pool_id', nullable: true })
  poolId: string;

  @ManyToOne(() => TalentPool, { nullable: true })
  @JoinColumn({ name: 'pool_id' })
  pool: TalentPool;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ name: 'current_step', default: 0 })
  currentStep: number;

  @Column({ name: 'next_send_at', type: 'timestamp', nullable: true })
  nextSendAt: Date | null;

  @Column({ name: 'enrolled_at', type: 'timestamp' })
  enrolledAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  repliedAt: Date;

  @Column({
    type: 'enum',
    enum: ResponseSentiment,
    nullable: true,
  })
  responseSentiment: ResponseSentiment;

  @Column({ name: 'emails_sent', default: 0 })
  emailsSent: number;

  @Column({ name: 'emails_opened', default: 0 })
  emailsOpened: number;

  @Column({ name: 'emails_clicked', default: 0 })
  emailsClicked: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
