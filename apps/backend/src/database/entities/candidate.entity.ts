import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('candidates')
@Unique(['organizationId', 'email'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_candidates_org')
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Index('idx_candidates_email')
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ name: 'location_city', type: 'varchar', length: 100, nullable: true })
  locationCity: string;

  @Column({ name: 'location_state', type: 'varchar', length: 100, nullable: true })
  locationState: string;

  @Column({ name: 'location_country', type: 'varchar', length: 100, nullable: true })
  locationCountry: string;

  @Column({ name: 'current_company', type: 'varchar', length: 255, nullable: true })
  currentCompany: string;

  @Column({ name: 'current_title', type: 'varchar', length: 255, nullable: true })
  currentTitle: string;

  @Column({ name: 'linkedin_url', type: 'text', nullable: true })
  linkedinUrl: string;

  @Column({ name: 'github_url', type: 'text', nullable: true })
  githubUrl: string;

  @Column({ name: 'portfolio_url', type: 'text', nullable: true })
  portfolioUrl: string;

  @Column({ name: 'resume_urls', type: 'text', array: true, default: [] })
  resumeUrls: string[];

  @Index('idx_candidates_tags', { synchronize: false })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ name: 'source_type', type: 'varchar', length: 50, nullable: true })
  sourceType: string;

  @Column({ name: 'source_details', type: 'jsonb', default: {} })
  sourceDetails: Record<string, any>;

  @Column({ name: 'gdpr_consent', type: 'boolean', default: false })
  gdprConsent: boolean;

  @Column({ name: 'gdpr_consent_date', type: 'timestamp', nullable: true })
  gdprConsentDate: Date;

  @Column({ name: 'gdpr_consent_type', type: 'varchar', length: 100, nullable: true })
  gdprConsentType: string;

  @Column({ name: 'anonymized', type: 'boolean', default: false })
  anonymized: boolean;

  @Column({ name: 'gdpr_deleted_at', type: 'timestamp', nullable: true })
  gdprDeletedAt: Date;

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
