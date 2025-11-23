import { Controller, Post, Body, UseGuards, Get, Param, Delete, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIEmailService } from './ai-email.service';
import { AIChatbotService } from './ai-chatbot.service';
import {
  GenerateOutreachEmailDto,
  GenerateResponseEmailDto,
  GenerateRejectionEmailDto,
  SendMessageDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../database/entities/candidate.entity';
import { Job } from '../../database/entities/job.entity';
import { Application } from '../../database/entities/application.entity';
import { Communication } from '../../database/entities/communication.entity';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private readonly aiEmailService: AIEmailService,
    private readonly aiChatbotService: AIChatbotService,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Communication)
    private readonly communicationRepository: Repository<Communication>,
  ) { }

  @Post('email/outreach')
  async generateOutreachEmail(@Body() dto: GenerateOutreachEmailDto) {
    // Fetch candidate and job
    const candidate = await this.candidateRepository.findOne({
      where: { id: dto.candidateId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const job = await this.jobRepository.findOne({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Generate email
    const generatedEmail = await this.aiEmailService.generateOutreachEmail({
      candidate,
      job,
      tone: dto.tone,
      additionalContext: dto.additionalContext,
      recruiterName: dto.recruiterName,
      companyName: dto.companyName,
    });

    return {
      success: true,
      data: generatedEmail,
    };
  }

  @Post('email/response')
  async generateResponseEmail(@Body() dto: GenerateResponseEmailDto) {
    let candidateHistory = '';

    // Build candidate history if IDs provided
    if (dto.candidateId) {
      const candidate = await this.candidateRepository.findOne({
        where: { id: dto.candidateId },
      });

      if (candidate) {
        candidateHistory += `Candidate: ${candidate.firstName} ${candidate.lastName}\n`;
        candidateHistory += `Current Role: ${candidate.currentTitle || 'N/A'}\n`;
      }
    }

    if (dto.applicationId) {
      const application = await this.applicationRepository.findOne({
        where: { id: dto.applicationId },
        relations: ['job', 'stage'],
      });

      if (application) {
        candidateHistory += `Applied for: ${application.job.title}\n`;
        candidateHistory += `Current Stage: ${application.stage.name}\n`;
        candidateHistory += `Applied on: ${application.appliedAt.toLocaleDateString()}\n`;
      }

      // Get recent communications
      const recentComms = await this.communicationRepository.find({
        where: { applicationId: dto.applicationId },
        order: { createdAt: 'DESC' },
        take: 3,
      });

      if (recentComms.length > 0) {
        candidateHistory += '\nRecent Communications:\n';
        recentComms.forEach((comm) => {
          candidateHistory += `- ${comm.type} on ${comm.createdAt.toLocaleDateString()}: ${comm.subject}\n`;
        });
      }
    }

    // Generate response
    const generatedEmail = await this.aiEmailService.generateResponseDraft({
      candidateEmail: dto.candidateEmail,
      candidateHistory,
      tone: dto.tone,
      context: dto.context,
    });

    return {
      success: true,
      data: generatedEmail,
    };
  }

  @Post('email/rejection')
  async generateRejectionEmail(@Body() dto: GenerateRejectionEmailDto) {
    // Fetch application with candidate and job
    const application = await this.applicationRepository.findOne({
      where: { id: dto.applicationId },
      relations: ['candidate', 'job'],
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Generate rejection email
    const generatedEmail = await this.aiEmailService.generateRejectionEmail({
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      jobTitle: application.job.title,
      rejectionReason: dto.rejectionReason,
      constructiveFeedback: dto.constructiveFeedback,
      tone: dto.tone,
    });

    return {
      success: true,
      data: generatedEmail,
    };
  }

  @Get('email/tones')
  getAvailableTones() {
    return {
      success: true,
      data: [
        {
          value: 'professional',
          label: 'Professional',
          description: 'Formal and professional tone',
        },
        {
          value: 'friendly',
          label: 'Friendly',
          description: 'Warm and friendly while maintaining professionalism',
        },
        {
          value: 'casual',
          label: 'Casual',
          description: 'Casual and conversational tone',
        },
      ],
    };
  }

  // Chatbot endpoints
  @Post('chat/message')
  async sendChatMessage(@Body() dto: SendMessageDto, @Request() req) {
    const userId = req.user.id;
    const result = await this.aiChatbotService.sendMessage(dto.message, {
      conversationId: dto.conversationId,
      userId,
    });

    return {
      success: true,
      data: {
        conversation: {
          id: result.conversation.id,
          title: result.conversation.title,
        },
        message: {
          id: result.response.id,
          role: result.response.role,
          type: result.response.type,
          content: result.response.content,
          metadata: result.response.metadata,
          createdAt: result.response.createdAt,
        },
      },
    };
  }

  @Get('chat/conversations')
  async getConversations(@Request() req) {
    const userId = req.user.userId;
    const conversations = await this.aiChatbotService.getConversations(userId);

    return {
      success: true,
      data: conversations.map((conv) => ({
        id: conv.id,
        title: conv.title,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      })),
    };
  }

  @Get('chat/conversations/:id')
  async getConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    const conversation = await this.aiChatbotService.getConversation(id, userId);

    return {
      success: true,
      data: {
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          type: msg.type,
          content: msg.content,
          metadata: msg.metadata,
          createdAt: msg.createdAt,
        })),
        createdAt: conversation.createdAt,
      },
    };
  }

  @Delete('chat/conversations/:id')
  async deleteConversation(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    await this.aiChatbotService.deleteConversation(id, userId);

    return {
      success: true,
      message: 'Conversation deleted successfully',
    };
  }
}
