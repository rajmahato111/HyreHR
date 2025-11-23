import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCommunicationTables1700000000009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create email_templates table
    await queryRunner.createTable(
      new Table({
        name: 'email_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
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
            name: 'subject',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'body',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'variables',
            type: 'text',
            isNullable: false,
            default: "''",
          },
          {
            name: 'shared',
            type: 'boolean',
            default: false,
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

    // Create foreign keys for email_templates
    await queryRunner.createForeignKey(
      'email_templates',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'email_templates',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create communications table
    await queryRunner.createTable(
      new Table({
        name: 'communications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'candidate_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'application_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'direction',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'from_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'to_emails',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'cc_emails',
            type: 'text',
            isNullable: false,
            default: "''",
          },
          {
            name: 'bcc_emails',
            type: 'text',
            isNullable: false,
            default: "''",
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'template_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'delivered_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'opened_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'clicked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'attachments',
            type: 'text',
            isNullable: true,
            default: "''",
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'thread_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'in_reply_to',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '255',
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

    // Create foreign keys for communications
    await queryRunner.createForeignKey(
      'communications',
      new TableForeignKey({
        columnNames: ['candidate_id'],
        referencedTableName: 'candidates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'communications',
      new TableForeignKey({
        columnNames: ['application_id'],
        referencedTableName: 'applications',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'communications',
      new TableForeignKey({
        columnNames: ['template_id'],
        referencedTableName: 'email_templates',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'communications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_email_templates_org ON email_templates(organization_id);
      CREATE INDEX idx_email_templates_category ON email_templates(category);
      CREATE INDEX idx_communications_candidate ON communications(candidate_id);
      CREATE INDEX idx_communications_application ON communications(application_id);
      CREATE INDEX idx_communications_type ON communications(type);
      CREATE INDEX idx_communications_status ON communications(status);
      CREATE INDEX idx_communications_thread ON communications(thread_id);
      CREATE INDEX idx_communications_created ON communications(created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_communications_created;
      DROP INDEX IF EXISTS idx_communications_thread;
      DROP INDEX IF EXISTS idx_communications_status;
      DROP INDEX IF EXISTS idx_communications_type;
      DROP INDEX IF EXISTS idx_communications_application;
      DROP INDEX IF EXISTS idx_communications_candidate;
      DROP INDEX IF EXISTS idx_email_templates_category;
      DROP INDEX IF EXISTS idx_email_templates_org;
    `);

    // Drop tables
    await queryRunner.dropTable('communications', true);
    await queryRunner.dropTable('email_templates', true);
  }
}
