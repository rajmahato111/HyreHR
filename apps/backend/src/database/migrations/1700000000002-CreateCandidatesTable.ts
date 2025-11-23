import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCandidatesTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'candidates',
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
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'location_city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'location_state',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'location_country',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'current_company',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'current_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'linkedin_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'github_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'portfolio_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isArray: true,
            default: 'ARRAY[]::text[]',
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
            name: 'gdpr_consent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'gdpr_consent_date',
            type: 'timestamp',
            isNullable: true,
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

    // Create indexes
    await queryRunner.createIndex(
      'candidates',
      new TableIndex({
        name: 'idx_candidates_org',
        columnNames: ['organization_id'],
      }),
    );

    await queryRunner.createIndex(
      'candidates',
      new TableIndex({
        name: 'idx_candidates_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'candidates',
      new TableIndex({
        name: 'idx_candidates_tags',
        columnNames: ['tags'],
        isUnique: false,
      }),
    );

    // Create unique constraint
    await queryRunner.createIndex(
      'candidates',
      new TableIndex({
        name: 'uq_candidates_org_email',
        columnNames: ['organization_id', 'email'],
        isUnique: true,
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'candidates',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidates');
  }
}
