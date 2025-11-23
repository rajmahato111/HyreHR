import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { InterviewStage } from './interview-stage.entity';
import { Interview } from './interview.entity';
import { User } from './user.entity';
import { LocationType } from './interview.entity';

@Entity('scheduling_links')
export class SchedulingLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'interview_stage_id', nullable: true })
  interviewStageId: string;

  @ManyToOne(() => InterviewStage, { nullable: true })
  @JoinColumn({ name: 'interview_stage_id' })
  interviewStage: InterviewStage;

  @Column({ name: 'interviewer_ids', type: 'uuid', array: true })
  interviewerIds: string[];

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({
    name: 'location_type',
    type: 'enum',
    enum: LocationType,
  })
  locationType: LocationType;

  @Column({ name: 'meeting_link', type: 'text', nullable: true })
  meetingLink: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'buffer_minutes', default: 0 })
  bufferMinutes: number;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @Column({ name: 'interview_id', nullable: true })
  interviewId: string;

  @ManyToOne(() => Interview, { nullable: true })
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @Column({ name: 'allow_reschedule', default: true })
  allowReschedule: boolean;

  @Column({ name: 'reschedule_token', nullable: true, unique: true })
  rescheduleToken: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
