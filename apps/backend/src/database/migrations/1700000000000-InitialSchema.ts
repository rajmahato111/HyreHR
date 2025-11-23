import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "settings" JSONB DEFAULT '{}',
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_organizations_slug" ON "organizations" ("slug")
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM (
        'admin',
        'recruiter',
        'hiring_manager',
        'interviewer',
        'coordinator',
        'executive'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "email" VARCHAR(255) NOT NULL,
        "password_hash" VARCHAR(255),
        "first_name" VARCHAR(100),
        "last_name" VARCHAR(100),
        "role" user_role_enum NOT NULL,
        "permissions" JSONB DEFAULT '[]',
        "avatar_url" TEXT,
        "timezone" VARCHAR(50) DEFAULT 'UTC',
        "locale" VARCHAR(10) DEFAULT 'en',
        "active" BOOLEAN DEFAULT TRUE,
        "last_login" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        UNIQUE("organization_id", "email")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_users_org" ON "users" ("organization_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_users_email" ON "users" ("email")
    `);

    // Create departments table
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "parent_id" UUID REFERENCES "departments"("id"),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_departments_org" ON "departments" ("organization_id")
    `);

    // Create locations table
    await queryRunner.query(`
      CREATE TABLE "locations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "city" VARCHAR(100),
        "state" VARCHAR(100),
        "country" VARCHAR(100),
        "remote" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_locations_org" ON "locations" ("organization_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "locations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);
  }
}
