import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInterviewTables1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create scorecards table
    await queryRunner.query(`
      CREATE TABLE scorecards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        attributes JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_scorecards_org ON scorecards(organization_id);
    `);

    // Create interview_plans table
    await queryRunner.query(`
      CREATE TABLE interview_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_interview_plans_org ON interview_plans(organization_id);
      CREATE INDEX idx_interview_plans_job ON interview_plans(job_id);
    `);

    // Create interview_stages table
    await queryRunner.query(`
      CREATE TABLE interview_stages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        interview_plan_id UUID NOT NULL REFERENCES interview_plans(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        instructions TEXT,
        scorecard_id UUID REFERENCES scorecards(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_interview_stages_plan ON interview_stages(interview_plan_id);
      CREATE INDEX idx_interview_stages_scorecard ON interview_stages(scorecard_id);
    `);

    // Create interviews table
    await queryRunner.query(`
      CREATE TABLE interviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        interview_stage_id UUID REFERENCES interview_stages(id),
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
        location_type VARCHAR(50),
        location_details TEXT,
        meeting_link TEXT,
        room_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_interviews_application ON interviews(application_id);
      CREATE INDEX idx_interviews_stage ON interviews(interview_stage_id);
      CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
      CREATE INDEX idx_interviews_status ON interviews(status);
    `);

    // Create interview_participants table
    await queryRunner.query(`
      CREATE TABLE interview_participants (
        interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        calendar_event_id VARCHAR(255),
        PRIMARY KEY (interview_id, user_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_interview_participants_interview ON interview_participants(interview_id);
      CREATE INDEX idx_interview_participants_user ON interview_participants(user_id);
    `);

    // Create interview_feedback table
    await queryRunner.query(`
      CREATE TABLE interview_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
        interviewer_id UUID NOT NULL REFERENCES users(id),
        scorecard_id UUID REFERENCES scorecards(id),
        overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
        decision VARCHAR(50),
        attribute_ratings JSONB DEFAULT '[]',
        strengths TEXT,
        concerns TEXT,
        notes TEXT,
        submitted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_interview_feedback_interview ON interview_feedback(interview_id);
      CREATE INDEX idx_interview_feedback_interviewer ON interview_feedback(interviewer_id);
      CREATE INDEX idx_interview_feedback_submitted ON interview_feedback(submitted_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS interview_feedback CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS interview_participants CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS interviews CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS interview_stages CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS interview_plans CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS scorecards CASCADE;`);
  }
}
