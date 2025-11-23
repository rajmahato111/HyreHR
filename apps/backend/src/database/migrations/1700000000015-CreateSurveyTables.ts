import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSurveyTables1700000000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create surveys table
    await queryRunner.createTable(
      new Table({
        name: 'surveys',
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
            name: 'questions',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'send_delay_hours',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_by',
            type: 'uuid',
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
      }),
      true,
    );

    // Create survey_responses table
    await queryRunner.createTable(
      new Table({
        name: 'survey_responses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'survey_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'candidate_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'application_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'interview_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'answers',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'nps_score',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'sentiment',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'sentiment_analysis',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'response_token',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
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

    // Add foreign keys
    await queryRunner.createForeignKey(
      'surveys',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'surveys',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'survey_responses',
      new TableForeignKey({
        columnNames: ['survey_id'],
        referencedTableName: 'surveys',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'survey_responses',
      new TableForeignKey({
        columnNames: ['candidate_id'],
        referencedTableName: 'candidates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'survey_responses',
      new TableForeignKey({
        columnNames: ['application_id'],
        referencedTableName: 'applications',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'survey_responses',
      new TableForeignKey({
        columnNames: ['interview_id'],
        referencedTableName: 'interviews',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_surveys_org ON surveys(organization_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_surveys_trigger ON surveys(trigger_type)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_survey_responses_candidate ON survey_responses(candidate_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_survey_responses_status ON survey_responses(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_survey_responses_token ON survey_responses(response_token)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('survey_responses');
    await queryRunner.dropTable('surveys');
  }
}
