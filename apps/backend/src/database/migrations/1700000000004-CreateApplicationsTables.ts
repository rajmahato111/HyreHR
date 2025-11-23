import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateApplicationsTables1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create rejection_reasons table
    await queryRunner.createTable(
      new Table({
        name: 'rejection_reasons',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
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
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'rejection_reasons',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create pipeline_stages table
    await queryRunner.createTable(
      new Table({
        name: 'pipeline_stages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
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
            length: '100',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'order_index',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'pipeline_stages',
      new TableIndex({
        name: 'idx_stages_org',
        columnNames: ['organization_id'],
      }),
    );

    await queryRunner.createIndex(
      'pipeline_stages',
      new TableIndex({
        name: 'idx_stages_job',
        columnNames: ['job_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'pipeline_stages',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'pipeline_stages',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create applications table
    await queryRunner.createTable(
      new Table({
        name: 'applications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'candidate_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'stage_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'source_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'source_details',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'applied_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'stage_entered_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'rejected_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejection_reason_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'hired_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rating',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'archived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'custom_fields',
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

    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'idx_applications_candidate',
        columnNames: ['candidate_id'],
      }),
    );

    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'idx_applications_job',
        columnNames: ['job_id'],
      }),
    );

    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'idx_applications_stage',
        columnNames: ['stage_id'],
      }),
    );

    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'idx_applications_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'idx_applications_job_stage_status',
        columnNames: ['job_id', 'stage_id', 'status'],
      }),
    );

    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['candidate_id'],
        referencedTableName: 'candidates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['stage_id'],
        referencedTableName: 'pipeline_stages',
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['rejection_reason_id'],
        referencedTableName: 'rejection_reasons',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create application_history table
    await queryRunner.createTable(
      new Table({
        name: 'application_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'application_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'from_stage_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'to_stage_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'automated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'application_history',
      new TableIndex({
        name: 'idx_app_history_application',
        columnNames: ['application_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'application_history',
      new TableForeignKey({
        columnNames: ['application_id'],
        referencedTableName: 'applications',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'application_history',
      new TableForeignKey({
        columnNames: ['from_stage_id'],
        referencedTableName: 'pipeline_stages',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'application_history',
      new TableForeignKey({
        columnNames: ['to_stage_id'],
        referencedTableName: 'pipeline_stages',
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createForeignKey(
      'application_history',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Add check constraint for rating
    await queryRunner.query(`
      ALTER TABLE applications 
      ADD CONSTRAINT chk_applications_rating 
      CHECK (rating >= 1 AND rating <= 5)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('application_history');
    await queryRunner.dropTable('applications');
    await queryRunner.dropTable('pipeline_stages');
    await queryRunner.dropTable('rejection_reasons');
  }
}
