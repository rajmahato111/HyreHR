import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMFAToUsers1700000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add MFA columns to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'mfa_enabled',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'mfa_secret',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'mfa_backup_codes',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'mfa_enrolled_at',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'mfa_enrolled_at');
    await queryRunner.dropColumn('users', 'mfa_backup_codes');
    await queryRunner.dropColumn('users', 'mfa_secret');
    await queryRunner.dropColumn('users', 'mfa_enabled');
  }
}
