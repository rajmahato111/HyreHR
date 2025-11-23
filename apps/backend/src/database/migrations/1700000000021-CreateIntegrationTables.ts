import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateIntegrationTables1700000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create integrations table
    await queryRunner.createTable(
      new Table({
        name: 'integrations',
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
            name: 'provider',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'auth_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'config',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'credentials',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'webhook_urls',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'webhook_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'last_sync_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_health_check_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'health_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'last_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'last_error_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
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
      }),
      true,
    );

    // Create foreign key for organization
    await queryRunner.createForeignKey(
      'integrations',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_integrations_org ON integrations(organization_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_integrations_provider ON integrations(provider)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_integrations_status ON integrations(status)`,
    );

    // Create webhooks table
    await queryRunner.createTable(
      new Table({
        name: 'webhooks',
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
            name: 'integration_id',
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
            name: 'url',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'events',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'headers',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'retry_attempts',
            type: 'int',
            default: 3,
          },
          {
            name: 'timeout_ms',
            type: 'int',
            default: 30000,
          },
          {
            name: 'last_triggered_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_success_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_failure_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'success_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'failure_count',
            type: 'int',
            default: 0,
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
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'webhooks',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'webhooks',
      new TableForeignKey({
        columnNames: ['integration_id'],
        referencedTableName: 'integrations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_webhooks_org ON webhooks(organization_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_webhooks_integration ON webhooks(integration_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_webhooks_status ON webhooks(status)`,
    );

    // Create webhook_logs table
    await queryRunner.createTable(
      new Table({
        name: 'webhook_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'webhook_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'event',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'payload',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'response_status',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'response_body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'attempt_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'duration_ms',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'webhook_logs',
      new TableForeignKey({
        columnNames: ['webhook_id'],
        referencedTableName: 'webhooks',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_webhook_logs_status ON webhook_logs(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhook_logs');
    await queryRunner.dropTable('webhooks');
    await queryRunner.dropTable('integrations');
  }
}
