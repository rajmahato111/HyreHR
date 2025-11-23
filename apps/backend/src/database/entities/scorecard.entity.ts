import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

export interface ScorecardAttribute {
  id: string;
  name: string;
  type: 'rating' | 'yes_no' | 'text';
  description?: string;
  required: boolean;
  options?: string[];
}

@Entity('scorecards')
export class Scorecard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  attributes: ScorecardAttribute[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
