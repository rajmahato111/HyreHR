import { MigrationInterface, QueryRunner } from 'typeorm';

export class PerformanceOptimization1700000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Composite indexes for common queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_applications_job_stage_status 
      ON applications(job_id, stage_id, status) 
      WHERE archived = FALSE;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_applications_candidate_status 
      ON applications(candidate_id, status);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_status 
      ON interviews(scheduled_at, status) 
      WHERE status = 'scheduled';
    `);

    // Partial indexes for active records
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_active_jobs 
      ON jobs(organization_id, status) 
      WHERE status = 'open';
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_active_applications 
      ON applications(job_id, stage_id) 
      WHERE status = 'active' AND archived = FALSE;
    `);

    // GIN indexes for JSONB and array columns
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_tags 
      ON candidates USING GIN(tags);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_custom_fields 
      ON jobs USING GIN(custom_fields);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_custom_fields 
      ON candidates USING GIN(custom_fields);
    `);

    // Full-text search indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_search 
      ON candidates USING GIN(
        to_tsvector('english', 
          coalesce(first_name, '') || ' ' || 
          coalesce(last_name, '') || ' ' || 
          coalesce(current_title, '') || ' ' || 
          coalesce(current_company, '')
        )
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_search 
      ON jobs USING GIN(
        to_tsvector('english', 
          coalesce(title, '') || ' ' || 
          coalesce(description, '')
        )
      );
    `);

    // Indexes for foreign key lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_applications_stage 
      ON applications(stage_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_interviews_application 
      ON interviews(application_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_communications_candidate 
      ON communications(candidate_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_communications_application 
      ON communications(application_id);
    `);

    // Indexes for date range queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_applications_applied_at 
      ON applications(applied_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_created_at 
      ON jobs(created_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_created_at 
      ON candidates(created_at DESC);
    `);

    // Materialized view for job metrics
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_job_metrics AS
      SELECT 
        j.id as job_id,
        j.organization_id,
        j.title,
        j.status,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'hired' THEN a.id END) as hires,
        COUNT(DISTINCT CASE WHEN a.status = 'rejected' THEN a.id END) as rejections,
        AVG(CASE 
          WHEN a.hired_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (a.hired_at - a.applied_at))/86400 
        END) as avg_time_to_hire_days,
        COUNT(DISTINCT i.id) as total_interviews,
        j.created_at,
        j.opened_at,
        j.closed_at
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      LEFT JOIN interviews i ON a.id = i.application_id
      GROUP BY j.id, j.organization_id, j.title, j.status, j.created_at, j.opened_at, j.closed_at;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_job_metrics_job_id 
      ON mv_job_metrics(job_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_mv_job_metrics_org 
      ON mv_job_metrics(organization_id);
    `);

    // Materialized view for pipeline metrics
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pipeline_metrics AS
      SELECT 
        ps.id as stage_id,
        ps.organization_id,
        ps.job_id,
        ps.name as stage_name,
        ps.order_index,
        COUNT(DISTINCT a.id) as candidate_count,
        AVG(EXTRACT(EPOCH FROM (COALESCE(a.stage_entered_at, NOW()) - a.applied_at))/86400) as avg_days_in_stage,
        COUNT(DISTINCT CASE 
          WHEN ah.to_stage_id IS NOT NULL 
          THEN a.id 
        END) as moved_to_next_stage,
        COUNT(DISTINCT CASE 
          WHEN a.status = 'rejected' 
          THEN a.id 
        END) as rejected_count
      FROM pipeline_stages ps
      LEFT JOIN applications a ON ps.id = a.stage_id AND a.archived = FALSE
      LEFT JOIN application_history ah ON a.id = ah.application_id AND ah.from_stage_id = ps.id
      GROUP BY ps.id, ps.organization_id, ps.job_id, ps.name, ps.order_index;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_pipeline_metrics_stage_id 
      ON mv_pipeline_metrics(stage_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_mv_pipeline_metrics_job 
      ON mv_pipeline_metrics(job_id);
    `);

    // Materialized view for candidate engagement metrics
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS mv_candidate_engagement AS
      SELECT 
        c.id as candidate_id,
        c.organization_id,
        COUNT(DISTINCT a.id) as application_count,
        COUNT(DISTINCT i.id) as interview_count,
        COUNT(DISTINCT comm.id) as communication_count,
        MAX(comm.created_at) as last_communication_at,
        MAX(a.applied_at) as last_application_at,
        c.created_at
      FROM candidates c
      LEFT JOIN applications a ON c.id = a.candidate_id
      LEFT JOIN interviews i ON a.id = i.application_id
      LEFT JOIN communications comm ON c.id = comm.candidate_id
      GROUP BY c.id, c.organization_id, c.created_at;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_candidate_engagement_candidate_id 
      ON mv_candidate_engagement(candidate_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_mv_candidate_engagement_org 
      ON mv_candidate_engagement(organization_id);
    `);

    // Create function to refresh materialized views
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_materialized_views()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_metrics;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pipeline_metrics;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_candidate_engagement;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Analyze tables for query planner
    await queryRunner.query(`ANALYZE jobs;`);
    await queryRunner.query(`ANALYZE candidates;`);
    await queryRunner.query(`ANALYZE applications;`);
    await queryRunner.query(`ANALYZE interviews;`);
    await queryRunner.query(`ANALYZE communications;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS refresh_materialized_views();`);

    // Drop materialized views
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_candidate_engagement;`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_pipeline_metrics;`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_job_metrics;`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_candidates_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_jobs_created_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_applications_applied_at;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_communications_application;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_communications_candidate;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_application;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_applications_stage;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_jobs_search;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_candidates_search;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_candidates_custom_fields;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_jobs_custom_fields;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_candidates_tags;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_active_applications;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_active_jobs;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_scheduled_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_applications_candidate_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_applications_job_stage_status;`);
  }
}
