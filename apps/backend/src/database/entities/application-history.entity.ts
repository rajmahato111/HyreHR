import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { User } from './user.entity';

@Entity('application_history')
export class ApplicationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'from_stage_id', type: 'uuid', nullable: true })
  fromStageId: string | null;

  @ManyToOne(() => PipelineStage, { nullable: true })
  @JoinColumn({ name: 'from_stage_id' })
  fromStage: PipelineStage | null;

  @Column({ name: 'to_stage_id', type: 'uuid' })
  toStageId: string;

  @ManyToOne(() => PipelineStage)
  @JoinColumn({ name: 'to_stage_id' })
  toStage: PipelineStage;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'boolean', default: false })
  automated: boolean;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'moved_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  movedAt: Date;
}
