import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInterviewTranscriptTable1700000000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'interview_transcripts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'interview_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'processing'",
          },
          {
            name: 'speakers',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'segments',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'full_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'key_points',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'sentiment_analysis',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'red_flags',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'green_flags',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'suggested_feedback',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'processing_started_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'processing_completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
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

    await queryRunner.createForeignKey(
      'interview_transcripts',
      new TableForeignKey({
        columnNames: ['interview_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'interviews',
        onDelete: 'CASCADE',
      }),
    );

    // Create index for faster lookups
    await queryRunner.query(
      `CREATE INDEX idx_interview_transcripts_interview ON interview_transcripts(interview_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_interview_transcripts_status ON interview_transcripts(status)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('interview_transcripts');
  }
}
