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
import { Job } from './job.entity';

@Entity('application_forms')
export class ApplicationForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'job_id', nullable: true })
  jobId: string;

  @ManyToOne(() => Job, { nullable: true })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: false, name: 'is_default' })
  isDefault: boolean;

  @Column({ type: 'jsonb', default: [] })
  fields: Array<{
    id: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 'date';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
    order: number;
  }>;

  @Column({ type: 'jsonb', default: [] })
  screeningQuestions: Array<{
    id: string;
    question: string;
    type: 'text' | 'boolean' | 'select' | 'multiselect';
    required: boolean;
    options?: string[];
    disqualifyingAnswers?: string[];
    order: number;
  }>;

  @Column({ type: 'boolean', default: true, name: 'include_resume' })
  includeResume: boolean;

  @Column({ type: 'boolean', default: false, name: 'include_cover_letter' })
  includeCoverLetter: boolean;

  @Column({ type: 'boolean', default: true, name: 'include_eeo' })
  includeEEO: boolean;

  @Column({ type: 'jsonb', default: {} })
  eeoConfig: {
    voluntary: boolean;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
    }>;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
