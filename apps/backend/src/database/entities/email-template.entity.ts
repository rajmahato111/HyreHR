import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum TemplateCategory {
  OUTREACH = 'outreach',
  INTERVIEW = 'interview',
  REJECTION = 'rejection',
  OFFER = 'offer',
  FOLLOW_UP = 'follow_up',
  GENERAL = 'general',
}

@Entity('email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500 })
  subject: string;

  @Column('text')
  body: string;

  @Column({
    type: 'enum',
    enum: TemplateCategory,
    nullable: true,
  })
  category: TemplateCategory;

  @Column('simple-array', { default: '' })
  variables: string[];

  @Column({ default: false })
  shared: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
