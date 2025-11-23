import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SlaRule } from './sla-rule.entity';

export enum SlaViolationStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
}

export enum SlaEntityType {
  APPLICATION = 'application',
  INTERVIEW = 'interview',
  OFFER = 'offer',
}

@Entity('sla_violations')
export class SlaViolation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sla_rule_id' })
  slaRuleId: string;

  @ManyToOne(() => SlaRule)
  @JoinColumn({ name: 'sla_rule_id' })
  slaRule: SlaRule;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: SlaEntityType,
  })
  entityType: SlaEntityType;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'violated_at' })
  violatedAt: Date;

  @Column({ name: 'expected_at' })
  expectedAt: Date;

  @Column({ name: 'actual_hours', type: 'decimal', precision: 10, scale: 2 })
  actualHours: number;

  @Column({
    type: 'enum',
    enum: SlaViolationStatus,
    default: SlaViolationStatus.OPEN,
  })
  status: SlaViolationStatus;

  @Column({ name: 'acknowledged_at', nullable: true })
  acknowledgedAt: Date;

  @Column({ name: 'acknowledged_by', nullable: true })
  acknowledgedBy: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolved_by', nullable: true })
  resolvedBy: string;

  @Column({ name: 'escalated', default: false })
  escalated: boolean;

  @Column({ name: 'escalated_at', nullable: true })
  escalatedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
