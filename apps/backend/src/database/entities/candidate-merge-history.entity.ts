import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { Candidate } from './candidate.entity';

@Entity('candidate_merge_history')
export class CandidateMergeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_merge_history_org')
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'source_candidate_id', type: 'uuid' })
  sourceCandidateId: string;

  @Column({ name: 'target_candidate_id', type: 'uuid' })
  targetCandidateId: string;

  @ManyToOne(() => Candidate, { nullable: true })
  @JoinColumn({ name: 'target_candidate_id' })
  targetCandidate: Candidate;

  @Column({ name: 'merged_by', type: 'uuid' })
  mergedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'merged_by' })
  mergedByUser: User;

  @Column({ name: 'source_data', type: 'jsonb' })
  sourceData: Record<string, any>;

  @Column({ name: 'target_data_before', type: 'jsonb' })
  targetDataBefore: Record<string, any>;

  @Column({ name: 'field_resolutions', type: 'jsonb', default: {} })
  fieldResolutions: Record<string, 'source' | 'target'>;

  @CreateDateColumn({ name: 'merged_at' })
  mergedAt: Date;
}
