import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { InterviewStage } from './interview-stage.entity';
import { InterviewParticipant } from './interview-participant.entity';
import { InterviewFeedback } from './interview-feedback.entity';

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum LocationType {
  PHONE = 'phone',
  VIDEO = 'video',
  ONSITE = 'onsite',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status: InterviewStatus;

  @Column({
    name: 'location_type',
    type: 'enum',
    enum: LocationType,
    nullable: true,
  })
  locationType: LocationType;

  @Column({ name: 'location_details', type: 'text', nullable: true })
  locationDetails: string;

  @Column({ name: 'meeting_link', type: 'text', nullable: true })
  meetingLink: string;

  @Column({ name: 'room_id', nullable: true })
  roomId: string;

  @OneToMany(() => InterviewParticipant, (participant) => participant.interview)
  participants: InterviewParticipant[];

  @OneToMany(() => InterviewFeedback, (feedback) => feedback.interview)
  feedback: InterviewFeedback[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
