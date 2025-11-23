import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { Job } from './job.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { ApplicationHistory } from './application-history.entity';

export enum ApplicationStatus {
  ACTIVE = 'active',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  HIRED = 'hired',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'candidate_id', type: 'uuid' })
  candidateId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'stage_id', type: 'uuid' })
  stageId: string;

  @ManyToOne(() => PipelineStage)
  @JoinColumn({ name: 'stage_id' })
  stage: PipelineStage;

  @Column({ type: 'varchar', length: 50, default: ApplicationStatus.ACTIVE })
  status: ApplicationStatus;

  @Column({ name: 'source_type', type: 'varchar', length: 50, nullable: true })
  sourceType: string | null;

  @Column({ name: 'source_details', type: 'jsonb', default: {} })
  sourceDetails: Record<string, any>;

  @Column({ name: 'applied_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt: Date;

  @Column({ name: 'stage_entered_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  stageEnteredAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'rejection_reason_id', type: 'uuid', nullable: true })
  rejectionReasonId: string | null;

  @Column({ name: 'hired_at', type: 'timestamp', nullable: true })
  hiredAt: Date | null;

  @Column({ type: 'integer', nullable: true })
  rating: number | null;

  @Column({ type: 'boolean', default: false })
  archived: boolean;

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ApplicationHistory, (history) => history.application)
  history: ApplicationHistory[];
}
