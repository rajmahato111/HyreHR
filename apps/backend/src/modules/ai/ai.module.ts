import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIEmailService } from './ai-email.service';
import { AIChatbotService } from './ai-chatbot.service';
import { Candidate } from '../../database/entities/candidate.entity';
import { Job } from '../../database/entities/job.entity';
import { Application } from '../../database/entities/application.entity';
import { Communication } from '../../database/entities/communication.entity';
import { ChatConversation } from '../../database/entities/chat-conversation.entity';
import { ChatMessage } from '../../database/entities/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Candidate,
      Job,
      Application,
      Communication,
      ChatConversation,
      ChatMessage,
    ]),
  ],
  controllers: [AIController],
  providers: [AIEmailService, AIChatbotService],
  exports: [AIEmailService, AIChatbotService],
})
export class AIModule { }
