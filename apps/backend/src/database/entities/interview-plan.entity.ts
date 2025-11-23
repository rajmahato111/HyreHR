import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Job } from './job.entity';
import { InterviewStage } from './interview-stage.entity';

@Entity('interview_plans')
export class InterviewPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ name: 'job_id', nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @OneToMany(() => InterviewStage, (stage) => stage.interviewPlan)
  stages: InterviewStage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
