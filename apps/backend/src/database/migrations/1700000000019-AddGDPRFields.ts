import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class AddGDPRFields1700000000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add GDPR fields to candidates table
    await queryRunner.addColumn(
      'candidates',
      new TableColumn({
        name: 'gdpr_consent_type',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'candidates',
      new TableColumn({
        name: 'anonymized',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'candidates',
      new TableColumn({
        name: 'gdpr_deleted_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Create data_retention_policies table
    await queryRunner.createTable(
      new Table({
        name: 'data_retention_policies',
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
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'retention_period_days',
            type: 'integer',
          },
          {
            name: 'auto_delete',
            type: 'boolean',
            default: false,
          },
          {
            name: 'notify_before_days',
            type: 'integer',
            default: 30,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['organization_id'],
            referencedTableName: 'organizations',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'idx_retention_policies_org',
            columnNames: ['organization_id'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop data_retention_policies table
    await queryRunner.dropTable('data_retention_policies');

    // Remove GDPR fields from candidates table
    await queryRunner.dropColumn('candidates', 'gdpr_deleted_at');
    await queryRunner.dropColumn('candidates', 'anonymized');
    await queryRunner.dropColumn('candidates', 'gdpr_consent_type');
  }
}
