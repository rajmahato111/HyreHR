import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSLATables1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sla_rules table
    await queryRunner.createTable(
      new Table({
        name: 'sla_rules',
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
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'threshold_hours',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'alert_recipients',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'escalation_recipients',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'escalation_hours',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'job_ids',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'department_ids',
            type: 'jsonb',
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

    // Create foreign key for organization
    await queryRunner.createForeignKey(
      'sla_rules',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_sla_rules_org ON sla_rules(organization_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_sla_rules_type ON sla_rules(type)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_sla_rules_active ON sla_rules(active)`,
    );

    // Create sla_violations table
    await queryRunner.createTable(
      new Table({
        name: 'sla_violations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'sla_rule_id',
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
            name: 'violated_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'expected_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'actual_hours',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'open'",
          },
          {
            name: 'acknowledged_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'acknowledged_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'resolved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'escalated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'escalated_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
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

    // Create foreign key for sla_rule
    await queryRunner.createForeignKey(
      'sla_violations',
      new TableForeignKey({
        columnNames: ['sla_rule_id'],
        referencedTableName: 'sla_rules',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_sla_violations_rule ON sla_violations(sla_rule_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_sla_violations_entity ON sla_violations(entity_type, entity_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_sla_violations_status ON sla_violations(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_sla_violations_violated_at ON sla_violations(violated_at)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sla_violations');
    await queryRunner.dropTable('sla_rules');
  }
}
