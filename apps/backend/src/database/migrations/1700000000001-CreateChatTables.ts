import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatTables1700000000001 implements MigrationInterface {
    name = 'CreateChatTables1700000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create chat_conversations table
        await queryRunner.query(`
      CREATE TABLE "chat_conversations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" VARCHAR(255),
        "last_message_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_chat_conversations_user" ON "chat_conversations" ("user_id")
    `);

        // Create enums for chat messages
        await queryRunner.query(`
      CREATE TYPE "chat_message_role_enum" AS ENUM (
        'user',
        'assistant',
        'system'
      )
    `);

        await queryRunner.query(`
      CREATE TYPE "chat_message_type_enum" AS ENUM (
        'text',
        'job_draft',
        'data_query',
        'error'
      )
    `);

        // Create chat_messages table
        await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversation_id" UUID NOT NULL REFERENCES "chat_conversations"("id") ON DELETE CASCADE,
        "role" chat_message_role_enum NOT NULL,
        "type" chat_message_type_enum DEFAULT 'text',
        "content" TEXT NOT NULL,
        "metadata" JSONB,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_chat_messages_conversation" ON "chat_messages" ("conversation_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "idx_chat_messages_created" ON "chat_messages" ("created_at")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables and enums in reverse order
        await queryRunner.query(`DROP TABLE IF EXISTS "chat_messages"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "chat_message_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "chat_message_role_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "chat_conversations"`);
    }
}
