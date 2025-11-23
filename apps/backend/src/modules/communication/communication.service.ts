import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Communication,
  CommunicationType,
  CommunicationDirection,
  CommunicationStatus,
  EmailTemplate,
  Candidate,
  Application,
} from '../../database/entities';
import { GmailService } from './providers/gmail.service';
import { OutlookService } from './providers/outlook.service';
import { EmailTrackingService } from './email-tracking.service';
import {
  SendEmailDto,
  CreateNoteDto,
  FilterCommunicationDto,
} from './dto';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(
    @InjectRepository(Communication)
    private communicationRepository: Repository<Communication>,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private gmailService: GmailService,
    private outlookService: OutlookService,
    private emailTrackingService: EmailTrackingService,
  ) {}

  /**
   * Send an email
   */
  async sendEmail(
    dto: SendEmailDto,
    userId: string,
    organizationId: string,
    userEmail: string,
  ): Promise<Communication> {
    try {
      let emailBody = dto.body;
      let emailSubject = dto.subject;

      // If template is specified, apply it
      if (dto.templateId) {
        const template = await this.emailTemplateRepository.findOne({
          where: { id: dto.templateId, organizationId },
        });

        if (template) {
          emailSubject = this.applyTemplateVariables(
            template.subject,
            dto.templateVariables || {},
          );
          emailBody = this.applyTemplateVariables(
            template.body,
            dto.templateVariables || {},
          );
        }
      }

      // Create communication record
      const communication = this.communicationRepository.create({
        candidateId: dto.candidateId,
        applicationId: dto.applicationId,
        type: CommunicationType.EMAIL,
        direction: CommunicationDirection.OUTBOUND,
        fromEmail: userEmail,
        toEmails: dto.toEmails,
        ccEmails: dto.ccEmails || [],
        bccEmails: dto.bccEmails || [],
        subject: emailSubject,
        body: emailBody,
        templateId: dto.templateId,
        userId,
        status: CommunicationStatus.DRAFT,
        attachments: dto.attachments || [],
      });

      await this.communicationRepository.save(communication);

      // Inject tracking
      const trackedBody = this.emailTrackingService.injectTrackedLinks(
        emailBody,
        communication.id,
      );
      const finalBody = this.emailTrackingService.injectTrackingPixel(
        trackedBody,
        communication.id,
      );

      // Send via email provider (Gmail or Outlook based on user preference)
      // For now, we'll use Gmail as default
      const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
      
      let trackingInfo;
      if (emailProvider === 'gmail') {
        trackingInfo = await this.gmailService.sendEmail({
          to: dto.toEmails,
          cc: dto.ccEmails,
          bcc: dto.bccEmails,
          subject: emailSubject,
          body: finalBody,
          attachments: dto.attachments,
        });
      } else if (emailProvider === 'outlook') {
        trackingInfo = await this.outlookService.sendEmail({
          to: dto.toEmails,
          cc: dto.ccEmails,
          bcc: dto.bccEmails,
          subject: emailSubject,
          body: finalBody,
          attachments: dto.attachments,
        });
      }

      // Update communication with tracking info
      communication.status = CommunicationStatus.SENT;
      communication.sentAt = new Date();
      communication.externalId = trackingInfo?.messageId;
      communication.threadId = trackingInfo?.threadId;
      
      await this.communicationRepository.save(communication);

      this.logger.log(`Email sent successfully: ${communication.id}`);
      return communication;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a note
   */
  async createNote(
    dto: CreateNoteDto,
    userId: string,
  ): Promise<Communication> {
    const communication = this.communicationRepository.create({
      candidateId: dto.candidateId,
      applicationId: dto.applicationId,
      type: CommunicationType.NOTE,
      direction: CommunicationDirection.INTERNAL,
      body: dto.body,
      userId,
      status: CommunicationStatus.SENT,
      metadata: {
        mentions: dto.mentions || [],
      },
    });

    await this.communicationRepository.save(communication);

    this.logger.log(`Note created: ${communication.id}`);
    return communication;
  }

  /**
   * Get communications with filters
   */
  async getCommunications(
    filters: FilterCommunicationDto,
    organizationId: string,
  ): Promise<Communication[]> {
    const query = this.communicationRepository
      .createQueryBuilder('comm')
      .leftJoinAndSelect('comm.candidate', 'candidate')
      .leftJoinAndSelect('comm.application', 'application')
      .leftJoinAndSelect('comm.user', 'user')
      .leftJoinAndSelect('comm.template', 'template');

    // Filter by candidate
    if (filters.candidateId) {
      query.andWhere('comm.candidateId = :candidateId', {
        candidateId: filters.candidateId,
      });
    }

    // Filter by application
    if (filters.applicationId) {
      query.andWhere('comm.applicationId = :applicationId', {
        applicationId: filters.applicationId,
      });
    }

    // Filter by type
    if (filters.type) {
      query.andWhere('comm.type = :type', { type: filters.type });
    }

    // Filter by direction
    if (filters.direction) {
      query.andWhere('comm.direction = :direction', {
        direction: filters.direction,
      });
    }

    // Filter by date range
    if (filters.startDate) {
      query.andWhere('comm.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('comm.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Ensure organization access
    query.andWhere(
      '(candidate.organizationId = :organizationId OR application.id IN (SELECT id FROM applications WHERE job_id IN (SELECT id FROM jobs WHERE organization_id = :organizationId)))',
      { organizationId },
    );

    query.orderBy('comm.createdAt', 'DESC');

    return query.getMany();
  }

  /**
   * Get communication by ID
   */
  async getCommunicationById(
    id: string,
    organizationId: string,
  ): Promise<Communication> {
    const communication = await this.communicationRepository.findOne({
      where: { id },
      relations: ['candidate', 'application', 'user', 'template'],
    });

    if (!communication) {
      throw new NotFoundException('Communication not found');
    }

    return communication;
  }

  /**
   * Get activity feed for a candidate
   */
  async getCandidateActivityFeed(
    candidateId: string,
    organizationId: string,
  ): Promise<Communication[]> {
    // Verify candidate belongs to organization
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, organizationId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.communicationRepository.find({
      where: { candidateId },
      relations: ['user', 'template'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Sync emails from provider
   */
  async syncEmails(
    userId: string,
    organizationId: string,
    provider: 'gmail' | 'outlook',
  ): Promise<number> {
    try {
      let emails = [];

      if (provider === 'gmail') {
        emails = await this.gmailService.fetchEmails(50);
      } else if (provider === 'outlook') {
        emails = await this.outlookService.fetchEmails(50);
      }

      let syncedCount = 0;

      for (const email of emails) {
        // Check if email already exists
        const existing = await this.communicationRepository.findOne({
          where: { externalId: email.id },
        });

        if (existing) {
          continue;
        }

        // Try to match email to a candidate
        const candidate = await this.candidateRepository.findOne({
          where: { email: email.from, organizationId },
        });

        // Create communication record
        const communication = this.communicationRepository.create({
          candidateId: candidate?.id,
          type: CommunicationType.EMAIL,
          direction: CommunicationDirection.INBOUND,
          fromEmail: email.from,
          toEmails: [email.to],
          ccEmails: email.cc ? [email.cc] : [],
          subject: email.subject,
          body: email.body,
          status: CommunicationStatus.DELIVERED,
          sentAt: new Date(email.date),
          deliveredAt: new Date(email.date),
          externalId: email.id,
          threadId: email.threadId,
          inReplyTo: email.inReplyTo,
        });

        await this.communicationRepository.save(communication);
        syncedCount++;
      }

      this.logger.log(`Synced ${syncedCount} emails from ${provider}`);
      return syncedCount;
    } catch (error) {
      this.logger.error(`Failed to sync emails: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply template variables to text
   */
  private applyTemplateVariables(
    text: string,
    variables: Record<string, any>,
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Get email thread
   */
  async getEmailThread(
    threadId: string,
    provider: 'gmail' | 'outlook',
  ): Promise<any> {
    try {
      if (provider === 'gmail') {
        return await this.gmailService.getThread(threadId);
      } else if (provider === 'outlook') {
        return await this.outlookService.getThread(threadId);
      }
    } catch (error) {
      this.logger.error(`Failed to get email thread: ${error.message}`);
      throw error;
    }
  }
}
