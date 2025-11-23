import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCareerSiteTables1700000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create career_sites table
    await queryRunner.createTable(
      new Table({
        name: 'career_sites',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'published',
            type: 'boolean',
            default: true,
          },
          {
            name: 'branding',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'content',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'seo',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'career_sites',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create application_forms table
    await queryRunner.createTable(
      new Table({
        name: 'application_forms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'fields',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'screening_questions',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'include_resume',
            type: 'boolean',
            default: true,
          },
          {
            name: 'include_cover_letter',
            type: 'boolean',
            default: false,
          },
          {
            name: 'include_eeo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'eeo_config',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'application_forms',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'application_forms',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create candidate_portal_users table
    await queryRunner.createTable(
      new Table({
        name: 'candidate_portal_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'candidate_id',
            type: 'uuid',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_login',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'reset_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'reset_token_expires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verification_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'candidate_portal_users',
      new TableForeignKey({
        columnNames: ['candidate_id'],
        referencedTableName: 'candidates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_career_sites_org ON career_sites(organization_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_career_sites_slug ON career_sites(slug)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_application_forms_org ON application_forms(organization_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_application_forms_job ON application_forms(job_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_candidate_portal_users_email ON candidate_portal_users(email)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidate_portal_users');
    await queryRunner.dropTable('application_forms');
    await queryRunner.dropTable('career_sites');
  }
}
