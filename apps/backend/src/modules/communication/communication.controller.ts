import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunicationService } from './communication.service';
import { EmailTemplateService } from './email-template.service';
import { ActivityFeedService } from './activity-feed.service';
import { EmailTrackingService } from './email-tracking.service';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  SendEmailDto,
  CreateNoteDto,
  FilterCommunicationDto,
} from './dto';
import { TemplateCategory } from '../../database/entities';

@Controller('communication')
@UseGuards(JwtAuthGuard)
export class CommunicationController {
  constructor(
    private communicationService: CommunicationService,
    private emailTemplateService: EmailTemplateService,
    private activityFeedService: ActivityFeedService,
    private emailTrackingService: EmailTrackingService,
  ) {}

  // ==================== Email Operations ====================

  @Post('emails/send')
  async sendEmail(@Body() dto: SendEmailDto, @Req() req: any) {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    const userEmail = req.user.email;

    return this.communicationService.sendEmail(
      dto,
      userId,
      organizationId,
      userEmail,
    );
  }

  @Post('emails/sync')
  async syncEmails(
    @Body() body: { provider: 'gmail' | 'outlook' },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const count = await this.communicationService.syncEmails(
      userId,
      organizationId,
      body.provider,
    );

    return {
      success: true,
      syncedCount: count,
    };
  }

  @Get('emails/thread/:threadId')
  async getEmailThread(
    @Param('threadId') threadId: string,
    @Query('provider') provider: 'gmail' | 'outlook',
  ) {
    return this.communicationService.getEmailThread(threadId, provider);
  }

  // ==================== Notes ====================

  @Post('notes')
  async createNote(@Body() dto: CreateNoteDto, @Req() req: any) {
    const userId = req.user.id;
    const note = await this.communicationService.createNote(dto, userId);

    // Process mentions
    if (dto.mentions && dto.mentions.length > 0) {
      await this.activityFeedService.processMentions(note.id, dto.mentions);
    }

    return note;
  }

  // ==================== Communications ====================

  @Get('communications')
  async getCommunications(
    @Query() filters: FilterCommunicationDto,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.communicationService.getCommunications(
      filters,
      organizationId,
    );
  }

  @Get('communications/:id')
  async getCommunicationById(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.communicationService.getCommunicationById(id, organizationId);
  }

  // ==================== Email Templates ====================

  @Post('templates')
  async createTemplate(
    @Body() dto: CreateEmailTemplateDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    return this.emailTemplateService.createTemplate(dto, userId, organizationId);
  }

  @Get('templates')
  async getTemplates(
    @Query('category') category: TemplateCategory,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.emailTemplateService.getTemplates(organizationId, category);
  }

  @Get('templates/by-category')
  async getTemplatesByCategory(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.emailTemplateService.getTemplatesByCategory(organizationId);
  }

  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.emailTemplateService.getTemplateById(id, organizationId);
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.emailTemplateService.updateTemplate(id, dto, organizationId);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    await this.emailTemplateService.deleteTemplate(id, organizationId);
    return { success: true };
  }

  @Post('templates/:id/duplicate')
  async duplicateTemplate(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    return this.emailTemplateService.duplicateTemplate(
      id,
      userId,
      organizationId,
    );
  }

  @Put('templates/:id/share')
  async shareTemplate(
    @Param('id') id: string,
    @Body() body: { shared: boolean },
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.emailTemplateService.shareTemplate(
      id,
      organizationId,
      body.shared,
    );
  }

  @Post('templates/:id/preview')
  async previewTemplate(
    @Param('id') id: string,
    @Body() body: { variables: Record<string, any> },
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    return this.emailTemplateService.previewTemplate(
      id,
      body.variables,
      organizationId,
    );
  }

  @Post('templates/default')
  async createDefaultTemplates(@Req() req: any) {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    return this.emailTemplateService.createDefaultTemplates(
      organizationId,
      userId,
    );
  }

  // ==================== Activity Feed ====================

  @Get('activity/candidate/:candidateId')
  async getCandidateActivityFeed(
    @Param('candidateId') candidateId: string,
    @Query('limit') limit: number = 50,
    @Req() req: any,
  ) {
    return this.activityFeedService.getCandidateActivityFeed(
      candidateId,
      limit,
    );
  }

  @Get('activity/application/:applicationId')
  async getApplicationActivityFeed(
    @Param('applicationId') applicationId: string,
  ) {
    return this.activityFeedService.getApplicationActivityFeed(applicationId);
  }

  @Get('activity/candidate/:candidateId/summary')
  async getActivitySummary(
    @Param('candidateId') candidateId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.activityFeedService.getActivitySummary(
      candidateId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // ==================== Email Tracking ====================

  @Get('track/open/:communicationId')
  async trackEmailOpen(
    @Param('communicationId') communicationId: string,
    @Res() res: Response,
  ) {
    await this.emailTrackingService.recordEmailOpen(communicationId);

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );

    res.writeHead(HttpStatus.OK, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    res.end(pixel);
  }

  @Get('track/click/:communicationId')
  async trackEmailClick(
    @Param('communicationId') communicationId: string,
    @Query('url') url: string,
    @Res() res: Response,
  ) {
    await this.emailTrackingService.recordEmailClick(communicationId, url);

    // Redirect to original URL
    res.redirect(HttpStatus.MOVED_PERMANENTLY, url);
  }

  @Get('track/stats/:communicationId')
  async getTrackingStats(@Param('communicationId') communicationId: string) {
    return this.emailTrackingService.getTrackingStats(communicationId);
  }

  @Post('track/stats/aggregate')
  async getAggregateStats(@Body() body: { communicationIds: string[] }) {
    return this.emailTrackingService.getAggregateStats(body.communicationIds);
  }
}
