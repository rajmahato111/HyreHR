import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('data_retention_policies')
export class DataRetentionPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_retention_policies_org')
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string; // 'candidate', 'application', 'communication', etc.

  @Column({ name: 'retention_period_days', type: 'integer' })
  retentionPeriodDays: number;

  @Column({ name: 'auto_delete', type: 'boolean', default: false })
  autoDelete: boolean;

  @Column({ name: 'notify_before_days', type: 'integer', default: 30 })
  notifyBeforeDays: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
