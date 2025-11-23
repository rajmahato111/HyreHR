import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulingLink } from '../../database/entities/scheduling-link.entity';
import { Application } from '../../database/entities/application.entity';
import { Interview, InterviewStatus } from '../../database/entities/interview.entity';
import { CreateSchedulingLinkDto } from './dto/scheduling-link.dto';
import { CalendarService } from './calendar/calendar.service';
import { TimezoneService } from './calendar/timezone.service';
import { randomBytes } from 'crypto';

export interface TimeSlot {
  start: Date;
  end: Date;
  startFormatted: string;
  endFormatted: string;
}

@Injectable()
export class SchedulingLinkService {
  constructor(
    @InjectRepository(SchedulingLink)
    private schedulingLinkRepository: Repository<SchedulingLink>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    private calendarService: CalendarService,
    private timezoneService: TimezoneService,
  ) { }

  async createSchedulingLink(
    userId: string,
    dto: CreateSchedulingLinkDto,
  ): Promise<SchedulingLink> {
    // Verify application exists
    const application = await this.applicationRepository.findOne({
      where: { id: dto.applicationId },
      relations: ['candidate', 'job'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Validate date range
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Generate unique token
    const token = this.generateToken();

    // Create scheduling link
    const schedulingLink = this.schedulingLinkRepository.create({
      token,
      applicationId: dto.applicationId,
      interviewStageId: dto.interviewStageId,
      interviewerIds: dto.interviewerIds,
      durationMinutes: dto.durationMinutes,
      locationType: dto.locationType,
      meetingLink: dto.meetingLink,
      startDate,
      endDate,
      bufferMinutes: dto.bufferMinutes || 0,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      createdBy: userId,
    });

    return this.schedulingLinkRepository.save(schedulingLink);
  }

  async getSchedulingLink(token: string): Promise<SchedulingLink> {
    const link = await this.schedulingLinkRepository.findOne({
      where: { token },
      relations: [
        'application',
        'application.candidate',
        'application.job',
        'interviewStage',
      ],
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    // Check if link is expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new BadRequestException('Scheduling link has expired');
    }

    // Check if link is already used
    if (link.used) {
      throw new BadRequestException('Scheduling link has already been used');
    }

    return link;
  }

  async getAvailableSlots(
    token: string,
    targetTimezone?: string,
  ): Promise<TimeSlot[]> {
    const link = await this.getSchedulingLink(token);

    // Get availability for all interviewers
    const availability = await this.calendarService.findCommonAvailability(
      link.interviewerIds,
      link.startDate,
      link.endDate,
      link.durationMinutes,
    );

    // Convert to time slots with buffer
    const slots: TimeSlot[] = [];

    for (const slot of availability) {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      // Generate slots within this availability window
      let currentStart = slotStart;

      while (currentStart < slotEnd) {
        const currentEnd = new Date(
          currentStart.getTime() + link.durationMinutes * 60000,
        );

        if (currentEnd <= slotEnd) {
          // Check if there's enough time for buffer
          const nextSlotStart = new Date(
            currentEnd.getTime() + link.bufferMinutes * 60000,
          );

          if (nextSlotStart <= slotEnd || currentEnd === slotEnd) {
            // Format times in target timezone
            const tz = targetTimezone || 'UTC';
            const startFormatted =
              this.timezoneService.formatInTimezone(currentStart, tz);
            const endFormatted =
              this.timezoneService.formatInTimezone(currentEnd, tz);

            slots.push({
              start: currentStart,
              end: currentEnd,
              startFormatted,
              endFormatted,
            });
          }
        }

        // Move to next slot (including buffer)
        currentStart = new Date(
          currentStart.getTime() +
          (link.durationMinutes + link.bufferMinutes) * 60000,
        );
      }
    }

    return slots;
  }

  async bookSlot(
    token: string,
    scheduledAt: Date,
    timezone?: string,
  ): Promise<Interview> {
    const link = await this.getSchedulingLink(token);

    // Verify the selected time is within the allowed range
    if (scheduledAt < link.startDate || scheduledAt > link.endDate) {
      throw new BadRequestException(
        'Selected time is outside the allowed date range',
      );
    }

    // Verify the selected time is in the future
    if (scheduledAt < new Date()) {
      throw new BadRequestException('Cannot schedule interview in the past');
    }

    // Check if the slot is still available
    const endTime = new Date(
      scheduledAt.getTime() + link.durationMinutes * 60000,
    );

    const hasConflicts =
      await this.calendarService.hasConflictsForMultipleUsers(
        link.interviewerIds,
        scheduledAt,
        endTime,
      );

    if (hasConflicts) {
      throw new BadRequestException(
        'Selected time slot is no longer available',
      );
    }

    // Create the interview
    const interview = this.interviewRepository.create({
      applicationId: link.applicationId,
      interviewStageId: link.interviewStageId,
      scheduledAt,
      durationMinutes: link.durationMinutes,
      locationType: link.locationType,
      meetingLink: link.meetingLink,
      status: InterviewStatus.SCHEDULED,
    });

    const savedInterview = await this.interviewRepository.save(interview);

    // Create calendar events for all interviewers
    await this.calendarService.createInterviewEventForParticipants(
      savedInterview.id,
      link.application.candidate,
      link.application.job,
      link.interviewerIds,
      scheduledAt,
      link.durationMinutes,
      link.locationType,
      link.meetingLink,
    );

    // Mark the scheduling link as used
    link.used = true;
    link.interviewId = savedInterview.id;
    await this.schedulingLinkRepository.save(link);

    return savedInterview;
  }

  async getSchedulingLinksByApplication(
    applicationId: string,
  ): Promise<SchedulingLink[]> {
    return this.schedulingLinkRepository.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteSchedulingLink(
    linkId: string,
    userId: string,
  ): Promise<void> {
    const link = await this.schedulingLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    if (link.createdBy !== userId) {
      throw new UnauthorizedException(
        'You can only delete links you created',
      );
    }

    if (link.used) {
      throw new BadRequestException('Cannot delete a used scheduling link');
    }

    await this.schedulingLinkRepository.remove(link);
  }

  async getRescheduleLink(rescheduleToken: string): Promise<SchedulingLink> {
    const link = await this.schedulingLinkRepository.findOne({
      where: { rescheduleToken },
      relations: [
        'application',
        'application.candidate',
        'application.job',
        'interview',
      ],
    });

    if (!link) {
      throw new NotFoundException('Reschedule link not found');
    }

    if (!link.allowReschedule) {
      throw new BadRequestException('Rescheduling is not allowed for this interview');
    }

    if (!link.used || !link.interviewId) {
      throw new BadRequestException('No interview to reschedule');
    }

    // Check if interview is in the past
    if (link.interview && link.interview.scheduledAt < new Date()) {
      throw new BadRequestException('Cannot reschedule past interviews');
    }

    return link;
  }

  async rescheduleInterview(
    rescheduleToken: string,
    newScheduledAt: Date,
    timezone?: string,
  ): Promise<Interview> {
    const link = await this.getRescheduleLink(rescheduleToken);

    if (!link.interview) {
      throw new NotFoundException('Interview not found');
    }

    // Verify the new time is within the allowed range
    if (newScheduledAt < link.startDate || newScheduledAt > link.endDate) {
      throw new BadRequestException(
        'Selected time is outside the allowed date range',
      );
    }

    // Verify the new time is in the future
    if (newScheduledAt < new Date()) {
      throw new BadRequestException('Cannot reschedule to a past time');
    }

    // Check if the new slot is available
    const endTime = new Date(
      newScheduledAt.getTime() + link.durationMinutes * 60000,
    );

    const hasConflicts =
      await this.calendarService.hasConflictsForMultipleUsers(
        link.interviewerIds,
        newScheduledAt,
        endTime,
      );

    if (hasConflicts) {
      throw new BadRequestException(
        'Selected time slot is not available',
      );
    }

    // Update the interview
    link.interview.scheduledAt = newScheduledAt;
    const updatedInterview = await this.interviewRepository.save(
      link.interview,
    );

    // Update calendar events for all interviewers
    await this.calendarService.createInterviewEventForParticipants(
      updatedInterview.id,
      link.application.candidate,
      link.application.job,
      link.interviewerIds,
      newScheduledAt,
      link.durationMinutes,
      link.locationType,
      link.meetingLink,
    );

    return updatedInterview;
  }

  async cancelInterview(rescheduleToken: string): Promise<void> {
    const link = await this.getRescheduleLink(rescheduleToken);

    if (!link.interview) {
      throw new NotFoundException('Interview not found');
    }

    // Check if interview is in the past
    if (link.interview.scheduledAt < new Date()) {
      throw new BadRequestException('Cannot cancel past interviews');
    }

    // Update interview status to cancelled
    link.interview.status = InterviewStatus.CANCELLED;
    await this.interviewRepository.save(link.interview);

    // Delete calendar events for all interviewers
    // Note: This would require storing calendar event IDs, which we'll skip for now
    // In production, you'd want to track and delete the calendar events

    // Mark the link as unused so it can be used again
    link.used = false;
    link.interviewId = null;
    await this.schedulingLinkRepository.save(link);
  }

  async generateRescheduleToken(linkId: string): Promise<string> {
    const link = await this.schedulingLinkRepository.findOne({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Scheduling link not found');
    }

    if (!link.used || !link.interviewId) {
      throw new BadRequestException('No interview scheduled yet');
    }

    // Generate reschedule token if not already exists
    if (!link.rescheduleToken) {
      link.rescheduleToken = this.generateToken();
      await this.schedulingLinkRepository.save(link);
    }

    return link.rescheduleToken;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }
}
