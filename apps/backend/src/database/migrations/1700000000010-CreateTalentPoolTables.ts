import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTalentPoolTables1700000000010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create talent_pools table
    await queryRunner.query(`
      CREATE TABLE talent_pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL DEFAULT 'static',
        criteria JSONB,
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        tags TEXT[] DEFAULT '{}',
        member_count INTEGER DEFAULT 0,
        engagement_rate DECIMAL(5,2),
        last_synced_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_talent_pools_org ON talent_pools(organization_id);
      CREATE INDEX idx_talent_pools_owner ON talent_pools(owner_id);
      CREATE INDEX idx_talent_pools_type ON talent_pools(type);
    `);

    // Create talent_pool_members junction table
    await queryRunner.query(`
      CREATE TABLE talent_pool_members (
        pool_id UUID REFERENCES talent_pools(id) ON DELETE CASCADE,
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (pool_id, candidate_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_pool_members_pool ON talent_pool_members(pool_id);
      CREATE INDEX idx_pool_members_candidate ON talent_pool_members(candidate_id);
    `);

    // Create email_sequences table
    await queryRunner.query(`
      CREATE TABLE email_sequences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        steps JSONB NOT NULL,
        created_by UUID NOT NULL REFERENCES users(id),
        total_enrolled INTEGER DEFAULT 0,
        total_completed INTEGER DEFAULT 0,
        total_replied INTEGER DEFAULT 0,
        open_rate DECIMAL(5,2),
        reply_rate DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_email_sequences_org ON email_sequences(organization_id);
      CREATE INDEX idx_email_sequences_status ON email_sequences(status);
      CREATE INDEX idx_email_sequences_creator ON email_sequences(created_by);
    `);

    // Create sequence_enrollments table
    await queryRunner.query(`
      CREATE TABLE sequence_enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
        candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
        pool_id UUID REFERENCES talent_pools(id) ON DELETE SET NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        current_step INTEGER DEFAULT 0,
        next_send_at TIMESTAMP,
        enrolled_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        replied_at TIMESTAMP,
        response_sentiment VARCHAR(50),
        emails_sent INTEGER DEFAULT 0,
        emails_opened INTEGER DEFAULT 0,
        emails_clicked INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enrollments_sequence ON sequence_enrollments(sequence_id);
      CREATE INDEX idx_enrollments_candidate ON sequence_enrollments(candidate_id);
      CREATE INDEX idx_enrollments_pool ON sequence_enrollments(pool_id);
      CREATE INDEX idx_enrollments_status ON sequence_enrollments(status);
      CREATE INDEX idx_enrollments_next_send ON sequence_enrollments(next_send_at) WHERE status = 'active';
    `);

    // Create saved_searches table
    await queryRunner.query(`
      CREATE TABLE saved_searches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        criteria JSONB NOT NULL,
        is_shared BOOLEAN DEFAULT FALSE,
        last_used_at TIMESTAMP,
        use_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_saved_searches_org ON saved_searches(organization_id);
      CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
      CREATE INDEX idx_saved_searches_shared ON saved_searches(is_shared) WHERE is_shared = TRUE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS saved_searches CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sequence_enrollments CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS email_sequences CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS talent_pool_members CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS talent_pools CASCADE;`);
  }
}
