import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { Department } from './department.entity';
import { Location } from './location.entity';

export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  ON_HOLD = 'on_hold',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

export enum SeniorityLevel {
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal',
  EXECUTIVE = 'executive',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_jobs_org')
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index('idx_jobs_department')
  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToMany(() => Location)
  @JoinTable({
    name: 'job_locations',
    joinColumn: { name: 'job_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'location_id', referencedColumnName: 'id' },
  })
  locations: Location[];

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Index('idx_jobs_status')
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @Column({ name: 'employment_type', type: 'enum', enum: EmploymentType })
  employmentType: EmploymentType;

  @Column({ name: 'seniority_level', type: 'enum', enum: SeniorityLevel, nullable: true })
  seniorityLevel: SeniorityLevel;

  @Column({ name: 'remote_ok', type: 'boolean', default: false })
  remoteOk: boolean;

  @Column({ name: 'salary_min', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ name: 'salary_max', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ name: 'salary_currency', type: 'varchar', length: 3, default: 'USD' })
  salaryCurrency: string;

  @Column({ name: 'requisition_id', type: 'varchar', length: 100, nullable: true })
  requisitionId: string;

  @Column({ type: 'boolean', default: false })
  confidential: boolean;

  @Column({ name: 'interview_plan_id', type: 'uuid', nullable: true })
  interviewPlanId: string;

  // @Column({ type: 'jsonb', default: {} })
  // customFields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'opened_at', type: 'timestamp', nullable: true })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;
}
