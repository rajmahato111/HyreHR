import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { Candidate } from './candidate.entity';

export enum TalentPoolType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

@Entity('talent_pools')
export class TalentPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TalentPoolType,
    default: TalentPoolType.STATIC,
  })
  type: TalentPoolType;

  @Column({ type: 'jsonb', nullable: true })
  criteria: {
    skills?: string[];
    experience?: { min?: number; max?: number };
    location?: string[];
    tags?: string[];
    currentTitle?: string;
    currentCompany?: string;
  };

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @ManyToMany(() => Candidate)
  @JoinTable({
    name: 'talent_pool_members',
    joinColumn: { name: 'pool_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'candidate_id', referencedColumnName: 'id' },
  })
  candidates: Candidate[];

  @Column({ name: 'member_count', default: 0 })
  memberCount: number;

  @Column({ name: 'engagement_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  engagementRate: number;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
