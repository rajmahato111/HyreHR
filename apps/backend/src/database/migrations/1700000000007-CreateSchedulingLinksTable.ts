import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSchedulingLinksTable1700000000007
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'scheduling_links',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'application_id',
            type: 'uuid',
          },
          {
            name: 'interview_stage_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'interviewer_ids',
            type: 'uuid',
            isArray: true,
          },
          {
            name: 'duration_minutes',
            type: 'integer',
          },
          {
            name: 'location_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'meeting_link',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
          },
          {
            name: 'end_date',
            type: 'date',
          },
          {
            name: 'buffer_minutes',
            type: 'integer',
            default: 0,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
          },
          {
            name: 'interview_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
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
            columnNames: ['application_id'],
            referencedTableName: 'applications',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['interview_stage_id'],
            referencedTableName: 'interview_stages',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['interview_id'],
            referencedTableName: 'interviews',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['created_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'scheduling_links',
      new TableIndex({
        name: 'idx_scheduling_links_token',
        columnNames: ['token'],
      }),
    );

    await queryRunner.createIndex(
      'scheduling_links',
      new TableIndex({
        name: 'idx_scheduling_links_application',
        columnNames: ['application_id'],
      }),
    );

    await queryRunner.createIndex(
      'scheduling_links',
      new TableIndex({
        name: 'idx_scheduling_links_used',
        columnNames: ['used'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('scheduling_links');
  }
}
