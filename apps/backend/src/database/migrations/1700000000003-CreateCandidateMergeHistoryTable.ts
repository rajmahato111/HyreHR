import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCandidateMergeHistoryTable1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'candidate_merge_history',
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
            name: 'source_candidate_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'target_candidate_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'merged_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'source_data',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'target_data_before',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'field_resolutions',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'merged_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'candidate_merge_history',
      new TableIndex({
        name: 'idx_merge_history_org',
        columnNames: ['organization_id'],
      }),
    );

    await queryRunner.createIndex(
      'candidate_merge_history',
      new TableIndex({
        name: 'idx_merge_history_source',
        columnNames: ['source_candidate_id'],
      }),
    );

    await queryRunner.createIndex(
      'candidate_merge_history',
      new TableIndex({
        name: 'idx_merge_history_target',
        columnNames: ['target_candidate_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'candidate_merge_history',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'candidate_merge_history',
      new TableForeignKey({
        columnNames: ['target_candidate_id'],
        referencedTableName: 'candidates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'candidate_merge_history',
      new TableForeignKey({
        columnNames: ['merged_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidate_merge_history');
  }
}
