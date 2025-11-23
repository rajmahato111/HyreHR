import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobsTable1700000000001 implements MigrationInterface {
  name = 'CreateJobsTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "job_status_enum" AS ENUM (
        'draft',
        'open',
        'on_hold',
        'closed',
        'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "employment_type_enum" AS ENUM (
        'full_time',
        'part_time',
        'contract',
        'internship'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "seniority_level_enum" AS ENUM (
        'entry',
        'junior',
        'mid',
        'senior',
        'lead',
        'principal',
        'executive'
      )
    `);

    // Create jobs table
    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "department_id" UUID REFERENCES "departments"("id"),
        "owner_id" UUID REFERENCES "users"("id"),
        "status" job_status_enum NOT NULL DEFAULT 'draft',
        "employment_type" employment_type_enum NOT NULL,
        "seniority_level" seniority_level_enum,
        "remote_ok" BOOLEAN DEFAULT FALSE,
        "salary_min" DECIMAL(12,2),
        "salary_max" DECIMAL(12,2),
        "salary_currency" VARCHAR(3) DEFAULT 'USD',
        "requisition_id" VARCHAR(100),
        "confidential" BOOLEAN DEFAULT FALSE,
        "interview_plan_id" UUID,
        "custom_fields" JSONB DEFAULT '{}',
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "opened_at" TIMESTAMP,
        "closed_at" TIMESTAMP
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_jobs_org" ON "jobs" ("organization_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_jobs_department" ON "jobs" ("department_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_jobs_status" ON "jobs" ("status")
    `);

    // Create job_locations join table
    await queryRunner.query(`
      CREATE TABLE "job_locations" (
        "job_id" UUID REFERENCES "jobs"("id") ON DELETE CASCADE,
        "location_id" UUID REFERENCES "locations"("id") ON DELETE CASCADE,
        PRIMARY KEY ("job_id", "location_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_job_locations_job" ON "job_locations" ("job_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_job_locations_location" ON "job_locations" ("location_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "job_locations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "seniority_level_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "employment_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "job_status_enum"`);
  }
}
