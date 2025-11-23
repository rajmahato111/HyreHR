import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('career_sites')
export class CareerSite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: true })
  published: boolean;

  @Column({ type: 'jsonb', default: {} })
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    headerImage?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  content: {
    heroTitle?: string;
    heroSubtitle?: string;
    aboutCompany?: string;
    benefits?: string[];
    values?: string[];
    testimonials?: Array<{
      id: string;
      name: string;
      role: string;
      photo?: string;
      quote: string;
      order: number;
    }>;
    customSections?: Array<{
      id: string;
      type: string;
      title: string;
      content: any;
      order: number;
    }>;
  };

  @Column({ type: 'jsonb', default: {} })
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  settings: {
    showJobCount?: boolean;
    enableFilters?: boolean;
    enableSearch?: boolean;
    jobsPerPage?: number;
    requireLogin?: boolean;
    enableApplicationTracking?: boolean;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
