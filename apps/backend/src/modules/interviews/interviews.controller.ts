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
  Request,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import {
  CreateScorecardDto,
  UpdateScorecardDto,
  CreateInterviewPlanDto,
  UpdateInterviewPlanDto,
  CreateInterviewStageDto,
  UpdateInterviewStageDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateInterviewFeedbackDto,
  UpdateInterviewFeedbackDto,
  CreateSchedulingLinkDto,
  GetAvailableSlotsDto,
  BookSlotDto,
  RescheduleInterviewDto,
  CancelInterviewDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CalendarService } from './calendar/calendar.service';
import { SchedulingLinkService } from './scheduling-link.service';
import { TranscriptionService } from './transcription.service';
import { CalendarAuthDto, GetAuthUrlDto } from './dto/calendar-auth.dto';
import {
  GetAvailabilityDto,
  FindCommonAvailabilityDto,
  UpdateWorkingHoursDto,
  UpdateTimezoneDto,
  CheckConflictsDto,
} from './dto/availability.dto';
import {
  StartTranscriptionDto,
  UpdateTranscriptionDto,
} from './dto/transcription.dto';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(
    private readonly interviewsService: InterviewsService,
    private readonly calendarService: CalendarService,
    private readonly schedulingLinkService: SchedulingLinkService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  // Scorecard endpoints
  @Post('scorecards')
  createScorecard(@Request() req, @Body() createScorecardDto: CreateScorecardDto) {
    return this.interviewsService.createScorecard(
      req.user.organizationId,
      createScorecardDto,
    );
  }

  @Get('scorecards')
  findAllScorecards(@Request() req) {
    return this.interviewsService.findAllScorecards(req.user.organizationId);
  }

  @Get('scorecards/:id')
  findOneScorecard(@Request() req, @Param('id') id: string) {
    return this.interviewsService.findOneScorecard(id, req.user.organizationId);
  }

  @Put('scorecards/:id')
  updateScorecard(
    @Request() req,
    @Param('id') id: string,
    @Body() updateScorecardDto: UpdateScorecardDto,
  ) {
    return this.interviewsService.updateScorecard(
      id,
      req.user.organizationId,
      updateScorecardDto,
    );
  }

  @Delete('scorecards/:id')
  removeScorecard(@Request() req, @Param('id') id: string) {
    return this.interviewsService.removeScorecard(id, req.user.organizationId);
  }

  // Interview Plan endpoints
  @Post('plans')
  createInterviewPlan(
    @Request() req,
    @Body() createInterviewPlanDto: CreateInterviewPlanDto,
  ) {
    return this.interviewsService.createInterviewPlan(
      req.user.organizationId,
      createInterviewPlanDto,
    );
  }

  @Get('plans')
  findAllInterviewPlans(@Request() req) {
    return this.interviewsService.findAllInterviewPlans(req.user.organizationId);
  }

  @Get('plans/:id')
  findOneInterviewPlan(@Request() req, @Param('id') id: string) {
    return this.interviewsService.findOneInterviewPlan(
      id,
      req.user.organizationId,
    );
  }

  @Put('plans/:id')
  updateInterviewPlan(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInterviewPlanDto: UpdateInterviewPlanDto,
  ) {
    return this.interviewsService.updateInterviewPlan(
      id,
      req.user.organizationId,
      updateInterviewPlanDto,
    );
  }

  @Delete('plans/:id')
  removeInterviewPlan(@Request() req, @Param('id') id: string) {
    return this.interviewsService.removeInterviewPlan(
      id,
      req.user.organizationId,
    );
  }

  // Interview Stage endpoints
  @Post('stages')
  createInterviewStage(
    @Request() req,
    @Body() createInterviewStageDto: CreateInterviewStageDto,
  ) {
    return this.interviewsService.createInterviewStage(
      req.user.organizationId,
      createInterviewStageDto,
    );
  }

  @Get('stages')
  findAllInterviewStages(
    @Request() req,
    @Query('interviewPlanId') interviewPlanId: string,
  ) {
    return this.interviewsService.findAllInterviewStages(
      interviewPlanId,
      req.user.organizationId,
    );
  }

  @Get('stages/:id')
  findOneInterviewStage(@Request() req, @Param('id') id: string) {
    return this.interviewsService.findOneInterviewStage(
      id,
      req.user.organizationId,
    );
  }

  @Put('stages/:id')
  updateInterviewStage(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInterviewStageDto: UpdateInterviewStageDto,
  ) {
    return this.interviewsService.updateInterviewStage(
      id,
      req.user.organizationId,
      updateInterviewStageDto,
    );
  }

  @Delete('stages/:id')
  removeInterviewStage(@Request() req, @Param('id') id: string) {
    return this.interviewsService.removeInterviewStage(
      id,
      req.user.organizationId,
    );
  }

  // Interview endpoints
  @Post()
  createInterview(
    @Request() req,
    @Body() createInterviewDto: CreateInterviewDto,
  ) {
    return this.interviewsService.createInterview(
      req.user.organizationId,
      createInterviewDto,
    );
  }

  @Get()
  findAllInterviews(
    @Request() req,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.interviewsService.findAllInterviews(
      req.user.organizationId,
      applicationId,
    );
  }

  @Get(':id')
  findOneInterview(@Request() req, @Param('id') id: string) {
    return this.interviewsService.findOneInterview(id, req.user.organizationId);
  }

  @Put(':id')
  updateInterview(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return this.interviewsService.updateInterview(
      id,
      req.user.organizationId,
      updateInterviewDto,
    );
  }

  @Delete(':id')
  removeInterview(@Request() req, @Param('id') id: string) {
    return this.interviewsService.removeInterview(id, req.user.organizationId);
  }

  // Interview Feedback endpoints
  @Post('feedback')
  createInterviewFeedback(
    @Request() req,
    @Body() createFeedbackDto: CreateInterviewFeedbackDto,
  ) {
    return this.interviewsService.createInterviewFeedback(
      req.user.organizationId,
      req.user.id,
      createFeedbackDto,
    );
  }

  @Get('feedback')
  findAllInterviewFeedback(
    @Request() req,
    @Query('interviewId') interviewId: string,
  ) {
    return this.interviewsService.findAllInterviewFeedback(
      interviewId,
      req.user.organizationId,
    );
  }

  @Get('feedback/:id')
  findOneInterviewFeedback(@Request() req, @Param('id') id: string) {
    return this.interviewsService.findOneInterviewFeedback(
      id,
      req.user.organizationId,
    );
  }

  @Put('feedback/:id')
  updateInterviewFeedback(
    @Request() req,
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateInterviewFeedbackDto,
  ) {
    return this.interviewsService.updateInterviewFeedback(
      id,
      req.user.organizationId,
      req.user.id,
      updateFeedbackDto,
    );
  }

  @Post('feedback/:id/submit')
  submitInterviewFeedback(@Request() req, @Param('id') id: string) {
    return this.interviewsService.submitInterviewFeedback(
      id,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Delete('feedback/:id')
  removeInterviewFeedback(@Request() req, @Param('id') id: string) {
    return this.interviewsService.removeInterviewFeedback(
      id,
      req.user.organizationId,
      req.user.id,
    );
  }

  // Interview status management endpoints
  @Post(':id/cancel')
  cancelInterview(@Request() req, @Param('id') id: string) {
    return this.interviewsService.cancelInterview(id, req.user.organizationId);
  }

  @Post(':id/complete')
  completeInterview(@Request() req, @Param('id') id: string) {
    return this.interviewsService.completeInterview(id, req.user.organizationId);
  }

  @Post(':id/no-show')
  markNoShow(@Request() req, @Param('id') id: string) {
    return this.interviewsService.markNoShow(id, req.user.organizationId);
  }

  // Get upcoming interviews for current user
  @Get('upcoming/me')
  getMyUpcomingInterviews(@Request() req) {
    return this.interviewsService.getUpcomingInterviewsForUser(
      req.user.id,
      req.user.organizationId,
    );
  }

  // Get interviews by date range
  @Get('by-date-range')
  getInterviewsByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.interviewsService.getInterviewsByDateRange(
      req.user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Feedback reminder endpoints
  @Get('needing-feedback')
  getInterviewsNeedingFeedback(@Request() req) {
    return this.interviewsService.getInterviewsNeedingFeedback(
      req.user.organizationId,
    );
  }

  @Get('pending-feedback/interviewers')
  getInterviewersWithPendingFeedback(@Request() req) {
    return this.interviewsService.getInterviewersWithPendingFeedback(
      req.user.organizationId,
    );
  }

  // Feedback analytics endpoints
  @Get('analytics/feedback')
  getFeedbackAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.interviewsService.getFeedbackAnalytics(
      req.user.organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('analytics/feedback/application/:applicationId')
  getFeedbackSummaryForApplication(
    @Request() req,
    @Param('applicationId') applicationId: string,
  ) {
    return this.interviewsService.getFeedbackSummaryForApplication(
      applicationId,
      req.user.organizationId,
    );
  }

  // Calendar Integration endpoints
  @Get('calendar/auth-url')
  getCalendarAuthUrl(@Query() query: GetAuthUrlDto) {
    return {
      authUrl: this.calendarService.getAuthUrl(query.provider),
    };
  }

  @Post('calendar/connect')
  async connectCalendar(@Request() req, @Body() authDto: CalendarAuthDto) {
    const credentials = await this.calendarService.exchangeCodeForTokens(
      authDto.provider,
      authDto.code,
    );

    await this.calendarService.saveUserCalendarCredentials(
      req.user.id,
      authDto.provider,
      credentials,
    );

    return {
      message: 'Calendar connected successfully',
      provider: authDto.provider,
    };
  }

  @Delete('calendar/disconnect')
  async disconnectCalendar(@Request() req) {
    await this.calendarService.disconnectCalendar(req.user.id);
    return {
      message: 'Calendar disconnected successfully',
    };
  }

  @Get('calendar/availability')
  async getMyAvailability(@Request() req, @Query() query: GetAvailabilityDto) {
    const availability = await this.calendarService.getUserAvailability(
      req.user.id,
      new Date(query.startDate),
      new Date(query.endDate),
    );

    return {
      userId: req.user.id,
      availability,
    };
  }

  @Post('calendar/availability/common')
  async findCommonAvailability(
    @Request() req,
    @Body() dto: FindCommonAvailabilityDto,
  ) {
    const availability = await this.calendarService.findCommonAvailability(
      dto.userIds,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.durationMinutes,
    );

    return {
      userIds: dto.userIds,
      durationMinutes: dto.durationMinutes,
      availability,
    };
  }

  @Post('calendar/availability/slots')
  async generateAvailableSlots(
    @Request() req,
    @Body() dto: FindCommonAvailabilityDto,
  ) {
    const slots = await this.calendarService.generateAvailableSlots(
      dto.userIds,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.durationMinutes,
      dto.targetTimezone,
    );

    return {
      userIds: dto.userIds,
      durationMinutes: dto.durationMinutes,
      targetTimezone: dto.targetTimezone,
      slots,
    };
  }

  @Post('calendar/conflicts/check')
  async checkConflicts(@Request() req, @Body() dto: CheckConflictsDto) {
    const userIds = dto.userIds || [req.user.id];

    const conflicts =
      await this.calendarService.getConflictsForMultipleUsers(
        userIds,
        new Date(dto.start),
        new Date(dto.end),
      );

    return {
      start: dto.start,
      end: dto.end,
      conflicts,
    };
  }

  @Get('calendar/events')
  async getMyCalendarEvents(
    @Request() req,
    @Query() query: GetAvailabilityDto,
  ) {
    const events = await this.calendarService.getUserEvents(
      req.user.id,
      new Date(query.startDate),
      new Date(query.endDate),
    );

    return {
      userId: req.user.id,
      events,
    };
  }

  @Put('calendar/working-hours')
  async updateWorkingHours(
    @Request() req,
    @Body() dto: UpdateWorkingHoursDto,
  ) {
    await this.calendarService.updateUserWorkingHours(
      req.user.id,
      dto.workingHours,
    );

    return {
      message: 'Working hours updated successfully',
      workingHours: dto.workingHours,
    };
  }

  @Put('calendar/timezone')
  async updateTimezone(@Request() req, @Body() dto: UpdateTimezoneDto) {
    await this.calendarService.updateUserTimezone(req.user.id, dto.timezone);

    return {
      message: 'Timezone updated successfully',
      timezone: dto.timezone,
    };
  }

  // Scheduling Link endpoints
  @Post('scheduling-links')
  async createSchedulingLink(
    @Request() req,
    @Body() dto: CreateSchedulingLinkDto,
  ) {
    const link = await this.schedulingLinkService.createSchedulingLink(
      req.user.id,
      dto,
    );

    return {
      ...link,
      url: `${process.env.FRONTEND_URL}/schedule/${link.token}`,
    };
  }

  @Get('scheduling-links/application/:applicationId')
  async getSchedulingLinksByApplication(
    @Request() req,
    @Param('applicationId') applicationId: string,
  ) {
    return this.schedulingLinkService.getSchedulingLinksByApplication(
      applicationId,
    );
  }

  @Delete('scheduling-links/:id')
  async deleteSchedulingLink(@Request() req, @Param('id') id: string) {
    await this.schedulingLinkService.deleteSchedulingLink(id, req.user.id);
    return { message: 'Scheduling link deleted successfully' };
  }

  // Public scheduling endpoints (no auth required)
  @Public()
  @Get('schedule/:token')
  async getSchedulingLinkInfo(@Param('token') token: string) {
    const link = await this.schedulingLinkService.getSchedulingLink(token);

    return {
      applicationId: link.applicationId,
      candidate: {
        firstName: link.application.candidate.firstName,
        lastName: link.application.candidate.lastName,
      },
      job: {
        title: link.application.job.title,
      },
      durationMinutes: link.durationMinutes,
      locationType: link.locationType,
      startDate: link.startDate,
      endDate: link.endDate,
    };
  }

  @Public()
  @Get('schedule/:token/slots')
  async getAvailableSlots(@Param('token') token: string, @Query() query: GetAvailableSlotsDto) {
    const slots = await this.schedulingLinkService.getAvailableSlots(
      token,
      query.timezone,
    );

    return { slots };
  }

  @Public()
  @Post('schedule/:token/book')
  async bookSlot(@Param('token') token: string, @Body() dto: BookSlotDto) {
    const interview = await this.schedulingLinkService.bookSlot(
      token,
      new Date(dto.scheduledAt),
      dto.timezone,
    );

    // Generate reschedule token
    const link = await this.schedulingLinkService.getSchedulingLink(token);
    const rescheduleToken = await this.schedulingLinkService.generateRescheduleToken(
      link.id,
    );

    return {
      message: 'Interview scheduled successfully',
      interview: {
        id: interview.id,
        scheduledAt: interview.scheduledAt,
        durationMinutes: interview.durationMinutes,
        locationType: interview.locationType,
        meetingLink: interview.meetingLink,
      },
      rescheduleUrl: `${process.env.FRONTEND_URL}/reschedule/${rescheduleToken}`,
    };
  }

  // Reschedule endpoints (public - no auth)
  @Public()
  @Get('reschedule/:rescheduleToken')
  async getRescheduleInfo(@Param('rescheduleToken') rescheduleToken: string) {
    const link = await this.schedulingLinkService.getRescheduleLink(
      rescheduleToken,
    );

    return {
      interview: {
        id: link.interview.id,
        scheduledAt: link.interview.scheduledAt,
        durationMinutes: link.interview.durationMinutes,
        locationType: link.interview.locationType,
        meetingLink: link.interview.meetingLink,
      },
      candidate: {
        firstName: link.application.candidate.firstName,
        lastName: link.application.candidate.lastName,
      },
      job: {
        title: link.application.job.title,
      },
      allowedDateRange: {
        startDate: link.startDate,
        endDate: link.endDate,
      },
    };
  }

  @Public()
  @Get('reschedule/:rescheduleToken/slots')
  async getRescheduleSlots(
    @Param('rescheduleToken') rescheduleToken: string,
    @Query() query: GetAvailableSlotsDto,
  ) {
    const link = await this.schedulingLinkService.getRescheduleLink(
      rescheduleToken,
    );

    const slots = await this.schedulingLinkService.getAvailableSlots(
      link.token,
      query.timezone,
    );

    return { slots };
  }

  @Public()
  @Post('reschedule/:rescheduleToken')
  async rescheduleInterview(
    @Param('rescheduleToken') rescheduleToken: string,
    @Body() dto: RescheduleInterviewDto,
  ) {
    const interview = await this.schedulingLinkService.rescheduleInterview(
      rescheduleToken,
      new Date(dto.scheduledAt),
      dto.timezone,
    );

    return {
      message: 'Interview rescheduled successfully',
      interview: {
        id: interview.id,
        scheduledAt: interview.scheduledAt,
        durationMinutes: interview.durationMinutes,
        locationType: interview.locationType,
        meetingLink: interview.meetingLink,
      },
    };
  }

  @Public()
  @Post('reschedule/:rescheduleToken/cancel')
  async cancelInterviewByToken(
    @Param('rescheduleToken') rescheduleToken: string,
  ) {
    await this.schedulingLinkService.cancelInterview(rescheduleToken);

    return {
      message: 'Interview cancelled successfully',
    };
  }

  // Transcription endpoints
  @Post(':id/transcription/start')
  async startTranscription(
    @Request() req,
    @Param('id') interviewId: string,
    @Body() dto: StartTranscriptionDto,
  ) {
    const transcript = await this.transcriptionService.startTranscription(
      interviewId,
      dto.audioUrl,
    );

    return {
      message: 'Transcription started',
      transcript: {
        id: transcript.id,
        interviewId: transcript.interviewId,
        status: transcript.status,
      },
    };
  }

  @Get(':id/transcription')
  async getTranscription(@Request() req, @Param('id') interviewId: string) {
    const transcript = await this.transcriptionService.getTranscriptByInterviewId(
      interviewId,
    );

    if (!transcript) {
      return {
        message: 'No transcription found for this interview',
        transcript: null,
      };
    }

    return {
      transcript: {
        id: transcript.id,
        interviewId: transcript.interviewId,
        status: transcript.status,
        speakers: transcript.speakers,
        segments: transcript.segments,
        fullText: transcript.fullText,
        keyPoints: transcript.keyPoints,
        sentimentAnalysis: transcript.sentimentAnalysis,
        redFlags: transcript.redFlags,
        greenFlags: transcript.greenFlags,
        summary: transcript.summary,
        suggestedFeedback: transcript.suggestedFeedback,
        createdAt: transcript.createdAt,
        updatedAt: transcript.updatedAt,
      },
    };
  }

  @Put('transcription/:transcriptId/segments')
  async updateTranscriptSegments(
    @Request() req,
    @Param('transcriptId') transcriptId: string,
    @Body() dto: UpdateTranscriptionDto,
  ) {
    if (!dto.segments) {
      throw new Error('Segments are required');
    }

    const transcript = await this.transcriptionService.updateTranscriptSegments(
      transcriptId,
      dto.segments as any,
    );

    return {
      message: 'Transcript segments updated',
      transcript: {
        id: transcript.id,
        status: transcript.status,
        segments: transcript.segments,
      },
    };
  }

  @Delete('transcription/:transcriptId')
  async deleteTranscription(
    @Request() req,
    @Param('transcriptId') transcriptId: string,
  ) {
    await this.transcriptionService.deleteTranscript(transcriptId);

    return {
      message: 'Transcription deleted successfully',
    };
  }
}
