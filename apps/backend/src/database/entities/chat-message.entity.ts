import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { ChatConversation } from './chat-conversation.entity';

export enum ChatMessageRole {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
}

export enum ChatMessageType {
    TEXT = 'text',
    JOB_DRAFT = 'job_draft',
    DATA_QUERY = 'data_query',
    ERROR = 'error',
}

@Entity('chat_messages')
export class ChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index('idx_chat_messages_conversation')
    @Column({ name: 'conversation_id', type: 'uuid' })
    conversationId: string;

    @ManyToOne(() => ChatConversation, (conversation) => conversation.messages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'conversation_id' })
    conversation: ChatConversation;

    @Column({ type: 'enum', enum: ChatMessageRole })
    role: ChatMessageRole;

    @Column({ type: 'enum', enum: ChatMessageType, default: ChatMessageType.TEXT })
    type: ChatMessageType;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Index('idx_chat_messages_created')
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
