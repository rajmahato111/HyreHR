import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('offer_templates')
export class OfferTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', array: true, default: [] })
  variables: string[];

  @Column({ name: 'default_currency', type: 'varchar', length: 3, default: 'USD' })
  defaultCurrency: string;

  @Column({ name: 'default_benefits', type: 'text', nullable: true })
  defaultBenefits?: string;

  @Column({ name: 'expiry_days', type: 'integer', default: 7 })
  expiryDays: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
