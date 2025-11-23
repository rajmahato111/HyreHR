import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { ChatConversation } from '../../database/entities/chat-conversation.entity';
import {
    ChatMessage,
    ChatMessageRole,
    ChatMessageType,
} from '../../database/entities/chat-message.entity';
import { Job } from '../../database/entities/job.entity';
import { Candidate } from '../../database/entities/candidate.entity';
import { Application } from '../../database/entities/application.entity';

interface ChatContext {
    conversationId?: string;
    userId: string;
}

interface JobDraftData {
    title: string;
    department?: string;
    location?: string;
    description?: string;
    requirements?: string[];
    responsibilities?: string[];
    benefits?: string[];
    salaryRange?: { min: number; max: number };
    employmentType?: string;
}

@Injectable()
export class AIChatbotService {
    private readonly logger = new Logger(AIChatbotService.name);
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor(
        @InjectRepository(ChatConversation)
        private conversationRepository: Repository<ChatConversation>,
        @InjectRepository(ChatMessage)
        private messageRepository: Repository<ChatMessage>,
        @InjectRepository(Job)
        private jobRepository: Repository<Job>,
        @InjectRepository(Candidate)
        private candidateRepository: Repository<Candidate>,
        @InjectRepository(Application)
        private applicationRepository: Repository<Application>,
    ) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.warn(
                'GEMINI_API_KEY not configured. AI chatbot will not work.',
            );
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    }

    /**
     * Send a message to the chatbot and get AI response
     */
    async sendMessage(
        message: string,
        context: ChatContext,
    ): Promise<{ conversation: ChatConversation; response: ChatMessage }> {
        this.logger.log(`Processing message for user ${context.userId}`);

        // Get or create conversation
        let conversation: ChatConversation;
        if (context.conversationId) {
            conversation = await this.conversationRepository.findOne({
                where: { id: context.conversationId, userId: context.userId },
                relations: ['messages'],
            });

            if (!conversation) {
                throw new Error('Conversation not found');
            }
        } else {
            // Create new conversation
            conversation = this.conversationRepository.create({
                userId: context.userId,
                title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            });
            conversation = await this.conversationRepository.save(conversation);
        }

        // Save user message
        const userMessage = this.messageRepository.create({
            conversationId: conversation.id,
            role: ChatMessageRole.USER,
            type: ChatMessageType.TEXT,
            content: message,
        });
        await this.messageRepository.save(userMessage);

        // Get conversation history (last 10 messages)
        const history = await this.messageRepository.find({
            where: { conversationId: conversation.id },
            order: { createdAt: 'DESC' },
            take: 10,
        });

        // Process with Gemini
        const result = await this.processMessage(message, history.reverse(), context.userId);

        // Save assistant message
        const assistantMessage = this.messageRepository.create({
            conversationId: conversation.id,
            role: ChatMessageRole.ASSISTANT,
            type: result.intent,
            content: result.response,
            metadata: result.metadata,
        });
        await this.messageRepository.save(assistantMessage);

        // Update conversation last message time
        conversation.lastMessageAt = new Date();
        await this.conversationRepository.save(conversation);

        return {
            conversation,
            response: assistantMessage,
        };
    }

    /**
     * Process message and determine intent
     */
    private async processMessage(
        message: string,
        history: ChatMessage[],
        userId: string,
    ): Promise<{
        intent: ChatMessageType;
        response: string;
        metadata?: Record<string, any>;
    }> {
        try {
            // Define tools (functions)
            const tools = [
                {
                    functionDeclarations: [
                        {
                            name: 'create_job_draft',
                            description: 'Create a job posting draft with structured information',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    title: { type: 'STRING', description: 'Job title' },
                                    department: { type: 'STRING', description: 'Department name' },
                                    location: { type: 'STRING', description: 'Job location' },
                                    description: { type: 'STRING', description: 'Job description' },
                                    requirements: {
                                        type: 'ARRAY',
                                        items: { type: 'STRING' },
                                        description: 'List of requirements',
                                    },
                                    responsibilities: {
                                        type: 'ARRAY',
                                        items: { type: 'STRING' },
                                        description: 'List of responsibilities',
                                    },
                                    benefits: {
                                        type: 'ARRAY',
                                        items: { type: 'STRING' },
                                        description: 'List of benefits',
                                    },
                                    employmentType: {
                                        type: 'STRING',
                                        description: 'Employment type (full-time, part-time, contract)',
                                    },
                                },
                                required: ['title', 'description'],
                            },
                        },
                        {
                            name: 'query_jobs',
                            description: 'Query jobs from the database',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    status: {
                                        type: 'STRING',
                                        description: 'Job status filter (open, closed, draft)',
                                    },
                                    limit: {
                                        type: 'NUMBER',
                                        description: 'Number of results to return',
                                    },
                                },
                            },
                        },
                        {
                            name: 'query_candidates',
                            description: 'Query candidates from the database',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    limit: {
                                        type: 'NUMBER',
                                        description: 'Number of results to return',
                                    },
                                },
                            },
                        },
                        {
                            name: 'query_applications',
                            description: 'Query applications from the database',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    status: {
                                        type: 'STRING',
                                        description: 'Application status filter',
                                    },
                                    limit: {
                                        type: 'NUMBER',
                                        description: 'Number of results to return',
                                    },
                                },
                            },
                        },
                    ],
                },
            ];

            // Initialize model with tools
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
                tools: tools as any,
            });

            // Start chat session
            const chat = model.startChat({
                history: history.map((msg) => ({
                    role: msg.role === ChatMessageRole.USER ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            });

            // Send message
            const result = await chat.sendMessage(message);
            const response = result.response;
            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                const functionName = call.name;
                const functionArgs = call.args;

                this.logger.log(`AI called function: ${functionName}`);

                switch (functionName) {
                    case 'create_job_draft':
                        return await this.handleJobDraftCreation(functionArgs as unknown as JobDraftData);

                    case 'query_jobs':
                        return await this.handleJobsQuery(functionArgs as any);

                    case 'query_candidates':
                        return await this.handleCandidatesQuery(functionArgs as any);

                    case 'query_applications':
                        return await this.handleApplicationsQuery(functionArgs as any);

                    default:
                        return {
                            intent: ChatMessageType.TEXT,
                            response: response.text() || 'I can help you with that.',
                        };
                }
            }

            // Regular text response
            return {
                intent: ChatMessageType.TEXT,
                response: response.text() || 'I can help you with that.',
            };
        } catch (error) {
            this.logger.error('Failed to process message', error);
            return {
                intent: ChatMessageType.ERROR,
                response:
                    'I apologize, but I encountered an error processing your request. Please try again.',
            };
        }
    }

    /**
     * Handle job draft creation
     */
    private async handleJobDraftCreation(
        data: JobDraftData,
    ): Promise<{
        intent: ChatMessageType;
        response: string;
        metadata: Record<string, any>;
    }> {
        this.logger.log('Creating job draft');

        const jobDraft = {
            title: data.title,
            department: data.department || 'Not specified',
            location: data.location || 'Remote',
            description: data.description,
            requirements: data.requirements || [],
            responsibilities: data.responsibilities || [],
            benefits: data.benefits || [],
            employmentType: data.employmentType || 'Full-time',
            salaryRange: data.salaryRange,
        };

        const response = `I've created a job post draft for **${data.title}**. Here's what I've prepared:

**Department:** ${jobDraft.department}
**Location:** ${jobDraft.location}
**Employment Type:** ${jobDraft.employmentType}

**Description:**
${jobDraft.description}

${jobDraft.requirements.length > 0 ? `**Requirements:**\n${jobDraft.requirements.map((r) => `• ${r}`).join('\n')}` : ''}

${jobDraft.responsibilities.length > 0 ? `**Responsibilities:**\n${jobDraft.responsibilities.map((r) => `• ${r}`).join('\n')}` : ''}

${jobDraft.benefits.length > 0 ? `**Benefits:**\n${jobDraft.benefits.map((b) => `• ${b}`).join('\n')}` : ''}

Would you like me to make any changes to this draft?`;

        return {
            intent: ChatMessageType.JOB_DRAFT,
            response,
            metadata: { jobDraft },
        };
    }

    /**
     * Handle jobs query
     */
    private async handleJobsQuery(params: {
        status?: string;
        limit?: number;
    }): Promise<{
        intent: ChatMessageType;
        response: string;
        metadata: Record<string, any>;
    }> {
        this.logger.log('Querying jobs');

        const queryBuilder = this.jobRepository.createQueryBuilder('job');

        if (params.status) {
            queryBuilder.where('job.status = :status', { status: params.status });
        }

        queryBuilder.take(params.limit || 10).orderBy('job.createdAt', 'DESC');

        const jobs = await queryBuilder.getMany();
        const count = await queryBuilder.getCount();

        const response = `I found **${count}** job${count !== 1 ? 's' : ''}${params.status ? ` with status "${params.status}"` : ''}:

${jobs.map((job) => `• **${job.title}** - ${job.locations?.[0]?.name || 'Remote'} (${job.status})`).join('\n')}

${count > (params.limit || 10) ? `\n_Showing first ${params.limit || 10} results_` : ''}`;

        return {
            intent: ChatMessageType.DATA_QUERY,
            response,
            metadata: { jobs: jobs.map((j) => ({ id: j.id, title: j.title })) },
        };
    }

    /**
     * Handle candidates query
     */
    private async handleCandidatesQuery(params: {
        limit?: number;
    }): Promise<{
        intent: ChatMessageType;
        response: string;
        metadata: Record<string, any>;
    }> {
        this.logger.log('Querying candidates');

        const candidates = await this.candidateRepository.find({
            take: params.limit || 10,
            order: { createdAt: 'DESC' },
        });

        const count = await this.candidateRepository.count();

        const response = `I found **${count}** candidate${count !== 1 ? 's' : ''} in the system:

${candidates.map((c) => `• **${c.firstName} ${c.lastName}** - ${c.email}${c.currentTitle ? ` (${c.currentTitle})` : ''}`).join('\n')}

${count > (params.limit || 10) ? `\n_Showing first ${params.limit || 10} results_` : ''}`;

        return {
            intent: ChatMessageType.DATA_QUERY,
            response,
            metadata: {
                candidates: candidates.map((c) => ({
                    id: c.id,
                    name: `${c.firstName} ${c.lastName}`,
                })),
            },
        };
    }

    /**
     * Handle applications query
     */
    private async handleApplicationsQuery(params: {
        status?: string;
        limit?: number;
    }): Promise<{
        intent: ChatMessageType;
        response: string;
        metadata: Record<string, any>;
    }> {
        this.logger.log('Querying applications');

        const queryBuilder = this.applicationRepository
            .createQueryBuilder('application')
            .leftJoinAndSelect('application.candidate', 'candidate')
            .leftJoinAndSelect('application.job', 'job');

        if (params.status) {
            queryBuilder.where('application.status = :status', {
                status: params.status,
            });
        }

        queryBuilder
            .take(params.limit || 10)
            .orderBy('application.appliedAt', 'DESC');

        const applications = await queryBuilder.getMany();
        const count = await queryBuilder.getCount();

        const response = `I found **${count}** application${count !== 1 ? 's' : ''}${params.status ? ` with status "${params.status}"` : ''}:

${applications.map((app) => `• **${app.candidate.firstName} ${app.candidate.lastName}** applied for **${app.job.title}** on ${app.appliedAt.toLocaleDateString()}`).join('\n')}

${count > (params.limit || 10) ? `\n_Showing first ${params.limit || 10} results_` : ''}`;

        return {
            intent: ChatMessageType.DATA_QUERY,
            response,
            metadata: {
                applications: applications.map((a) => ({
                    id: a.id,
                    candidate: `${a.candidate.firstName} ${a.candidate.lastName}`,
                    job: a.job.title,
                })),
            },
        };
    }

    /**
     * Get user's conversations
     */
    async getConversations(userId: string): Promise<ChatConversation[]> {
        return this.conversationRepository.find({
            where: { userId },
            order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
            take: 20,
        });
    }

    /**
     * Get conversation with messages
     */
    async getConversation(
        conversationId: string,
        userId: string,
    ): Promise<ChatConversation> {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId, userId },
            relations: ['messages'],
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        return conversation;
    }

    /**
     * Delete conversation
     */
    async deleteConversation(
        conversationId: string,
        userId: string,
    ): Promise<void> {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId, userId },
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        await this.conversationRepository.remove(conversation);
    }
}
