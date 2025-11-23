import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Interview } from './interview.entity';
import { User } from './user.entity';

export enum ParticipantRole {
  INTERVIEWER = 'interviewer',
  COORDINATOR = 'coordinator',
  OBSERVER = 'observer',
}

@Entity('interview_participants')
export class InterviewParticipant {
  @PrimaryColumn({ name: 'interview_id' })
  interviewId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Interview, (interview) => interview.participants)
  @JoinColumn({ name: 'interview_id' })
  interview: Interview;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
  })
  role: ParticipantRole;

  @Column({ name: 'calendar_event_id', nullable: true })
  calendarEventId: string;
}
