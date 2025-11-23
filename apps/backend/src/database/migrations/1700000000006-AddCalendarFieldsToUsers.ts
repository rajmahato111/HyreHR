import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCalendarFieldsToUsers1700000000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'calendar_provider',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'calendar_credentials',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'working_hours',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'working_hours');
    await queryRunner.dropColumn('users', 'calendar_credentials');
    await queryRunner.dropColumn('users', 'calendar_provider');
  }
}
