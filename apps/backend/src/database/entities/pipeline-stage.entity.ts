import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Job } from './job.entity';

export enum StageType {
  APPLIED = 'applied',
  PHONE_SCREEN = 'phone_screen',
  TECHNICAL_INTERVIEW = 'technical_interview',
  ONSITE_INTERVIEW = 'onsite_interview',
  OFFER = 'offer',
  HIRED = 'hired',
  REJECTED = 'rejected',
  CUSTOM = 'custom',
}

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: StageType;

  @Column({ name: 'order_index', type: 'integer' })
  orderIndex: number;

  @Column({ name: 'job_id', type: 'uuid', nullable: true })
  jobId: string | null;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'job_id' })
  job: Job | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
