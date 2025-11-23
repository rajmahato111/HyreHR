import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWorkflowTables1700000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create workflows table
    await queryRunner.createTable(
      new Table({
        name: 'workflows',
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
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'trigger_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'trigger_config',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'conditions',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'actions',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
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

    // Create workflow_executions table
    await queryRunner.createTable(
      new Table({
        name: 'workflow_executions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'workflow_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'trigger_data',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'steps',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
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

    // Add foreign keys
    await queryRunner.createForeignKey(
      'workflows',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'workflows',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'workflow_executions',
      new TableForeignKey({
        columnNames: ['workflow_id'],
        referencedTableName: 'workflows',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_workflows_org ON workflows(organization_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_workflows_trigger_type ON workflows(trigger_type)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_workflows_active ON workflows(active)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_workflow_executions_status ON workflow_executions(status)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workflow_executions');
    await queryRunner.dropTable('workflows');
  }
}
