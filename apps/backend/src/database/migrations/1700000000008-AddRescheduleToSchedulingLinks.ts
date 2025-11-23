import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddRescheduleToSchedulingLinks1700000000008
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'scheduling_links',
      new TableColumn({
        name: 'allow_reschedule',
        type: 'boolean',
        default: true,
      }),
    );

    await queryRunner.addColumn(
      'scheduling_links',
      new TableColumn({
        name: 'reschedule_token',
        type: 'varchar',
        length: '255',
        isNullable: true,
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'scheduling_links',
      new TableIndex({
        name: 'idx_scheduling_links_reschedule_token',
        columnNames: ['reschedule_token'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'scheduling_links',
      'idx_scheduling_links_reschedule_token',
    );
    await queryRunner.dropColumn('scheduling_links', 'reschedule_token');
    await queryRunner.dropColumn('scheduling_links', 'allow_reschedule');
  }
}
