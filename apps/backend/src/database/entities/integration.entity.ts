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

export enum IntegrationProvider {
  GOOGLE_CALENDAR = 'google_calendar',
  MICROSOFT_CALENDAR = 'microsoft_calendar',
  BAMBOOHR = 'bamboohr',
  WORKDAY = 'workday',
  RIPPLING = 'rippling',
  DOCUSIGN = 'docusign',
  HELLOSIGN = 'hellosign',
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  GLASSDOOR = 'glassdoor',
  SLACK = 'slack',
  TEAMS = 'teams',
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  CUSTOM = 'custom',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
}

export enum AuthType {
  OAUTH2 = 'oauth2',
  API_KEY = 'api_key',
  BASIC = 'basic',
  JWT = 'jwt',
  SAML = 'saml',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: IntegrationProvider,
  })
  provider: IntegrationProvider;

  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING,
  })
  status: IntegrationStatus;

  // @Column({
  //   type: 'enum',
  //   enum: AuthType,
  // })
  // authType: AuthType;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>;

  @Column({ type: 'jsonb', default: {}, select: false })
  credentials: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  webhookUrls: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  webhookSecret: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastHealthCheckAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  healthStatus: string;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @Column({ type: 'timestamp', nullable: true })
  lastErrorAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
