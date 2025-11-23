import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleCalendarService, TimeSlot, CalendarEvent, CalendarCredentials } from './google-calendar.service';
import { MicrosoftCalendarService } from './microsoft-calendar.service';
import { TimezoneService, WorkingHours } from './timezone.service';
import { User } from '../../../database/entities/user.entity';

export enum CalendarProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

export interface UserCalendarConfig {
  userId: string;
  provider: CalendarProvider;
  credentials: CalendarCredentials;
  timezone: string;
  workingHours: WorkingHours[];
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly microsoftCalendarService: MicrosoftCalendarService,
    private readonly timezoneService: TimezoneService,
  ) { }

  /**
   * Get OAuth authorization URL for a provider
   */
  getAuthUrl(provider: CalendarProvider): string {
    switch (provider) {
      case CalendarProvider.GOOGLE:
        return this.googleCalendarService.getAuthUrl();
      case CalendarProvider.MICROSOFT:
        return this.microsoftCalendarService.getAuthUrl();
      default:
        throw new BadRequestException('Invalid calendar provider');
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    provider: CalendarProvider,
    code: string,
  ): Promise<CalendarCredentials> {
    switch (provider) {
      case CalendarProvider.GOOGLE:
        return this.googleCalendarService.getTokensFromCode(code);
      case CalendarProvider.MICROSOFT:
        return this.microsoftCalendarService.getTokensFromCode(code);
      default:
        throw new BadRequestException('Invalid calendar provider');
    }
  }

  /**
   * Get user's calendar availability
   */
  async getUserAvailability(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TimeSlot[]> {
    const user = await this.getUserWithCalendarConfig(userId);

    if (!user.calendarProvider || !user.calendarCredentials) {
      throw new BadRequestException('User has not connected a calendar');
    }

    const credentials = user.calendarCredentials as CalendarCredentials;
    let freeSlots: TimeSlot[];

    switch (user.calendarProvider) {
      case CalendarProvider.GOOGLE:
        freeSlots = await this.googleCalendarService.getAvailability(
          credentials,
          startDate,
          endDate,
        );
        break;
      case CalendarProvider.MICROSOFT:
        freeSlots = await this.microsoftCalendarService.getAvailability(
          credentials,
          startDate,
          endDate,
        );
        break;
      default:
        throw new BadRequestException('Invalid calendar provider');
    }

    // Filter by working hours
    const workingHours = (user.workingHours as WorkingHours[]) ||
      this.timezoneService.getDefaultWorkingHours();

    return this.timezoneService.filterByWorkingHours(
      freeSlots,
      workingHours,
      user.timezone || 'UTC',
    );
  }

  /**
   * Find common availability for multiple users
   */
  async findCommonAvailability(
    userIds: string[],
    startDate: Date,
    endDate: Date,
    durationMinutes: number,
  ): Promise<TimeSlot[]> {
    const userAvailabilities = await Promise.all(
      userIds.map(async (userId) => {
        const user = await this.getUserWithCalendarConfig(userId);
        const freeSlots = await this.getUserAvailability(
          userId,
          startDate,
          endDate,
        );

        return {
          userId,
          freeSlots,
          timezone: user.timezone || 'UTC',
          workingHours: (user.workingHours as WorkingHours[]) ||
            this.timezoneService.getDefaultWorkingHours(),
        };
      }),
    );

    return this.timezoneService.findCommonAvailability(
      userAvailabilities,
      durationMinutes,
    );
  }

  /**
   * Create a calendar event for an interview
   */
  async createInterviewEvent(
    userId: string,
    event: {
      summary: string;
      description?: string;
      start: Date;
      end: Date;
      attendees: string[];
      location?: string;
      includeVideoConference?: boolean;
    },
  ): Promise<CalendarEvent> {
    const user = await this.getUserWithCalendarConfig(userId);

    if (!user.calendarProvider || !user.calendarCredentials) {
      throw new BadRequestException('User has not connected a calendar');
    }

    const credentials = user.calendarCredentials as CalendarCredentials;
    const timezone = user.timezone || 'UTC';

    switch (user.calendarProvider) {
      case CalendarProvider.GOOGLE:
        return this.googleCalendarService.createEvent(credentials, {
          ...event,
          timezone,
          conferenceData: event.includeVideoConference,
        });
      case CalendarProvider.MICROSOFT:
        return this.microsoftCalendarService.createEvent(credentials, {
          ...event,
          timezone,
          isOnlineMeeting: event.includeVideoConference,
        });
      default:
        throw new BadRequestException('Invalid calendar provider');
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateInterviewEvent(
    userId: string,
    eventId: string,
    updates: {
      summary?: string;
      description?: string;
      start?: Date;
      end?: Date;
      attendees?: string[];
      location?: string;
    },
  ): Promise<CalendarEvent> {
    const user = await this.getUserWithCalendarConfig(userId);

    if (!user.calendarProvider || !user.calendarCredentials) {
      throw new BadRequestException('User has not connected a calendar');
    }

    const credentials = user.calendarCredentials as CalendarCredentials;
    const timezone = user.timezone || 'UTC';

    switch (user.calendarProvider) {
      case CalendarProvider.GOOGLE:
        return this.googleCalendarService.updateEvent(
          credentials,
          eventId,
          { ...updates, timezone },
        );
      case CalendarProvider.MICROSOFT:
        return this.microsoftCalendarService.updateEvent(
          credentials,
          eventId,
          { ...updates, timezone },
        );
      default:
        throw new BadRequestException('Invalid calendar provider');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteInterviewEvent(userId: string, eventId: string): Promise<void> {
    const user = await this.getUserWithCalendarConfig(userId);

    if (!user.calendarProvider || !user.calendarCredentials) {
      throw new BadRequestException('User has not connected a calendar');
    }

    const credentials = user.calendarCredentials as CalendarCredentials;

    switch (user.calendarProvider) {
      case CalendarProvider.GOOGLE:
        return this.googleCalendarService.deleteEvent(credentials, eventId);
      case CalendarProvider.MICROSOFT:
        return this.microsoftCalendarService.deleteEvent(credentials, eventId);
      default:
        throw new BadRequestException('Invalid calendar provider');
    }
  }

  /**
   * Check if a time slot has conflicts for a user
   */
  async hasConflicts(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<boolean> {
    const user = await this.getUserWithCalendarConfig(userId);

    if (!user.calendarProvider || !user.calendarCredentials) {
      return false; // No calendar connected, no conflicts
    }

    const credentials = user.calendarCredentials as CalendarCredentials;

    switch (user.calendarProvider) {
      case CalendarProvider.GOOGLE:
        return this.googleCalendarService.hasConflicts(
          credentials,
          start,
          end,
        );
      case CalendarProvider.MICROSOFT:
        return this.microsoftCalendarService.hasConflicts(
          credentials,
          start,
          end,
        );
      default:
        return false;
    }
  }

  /**
   * Check if a time slot has conflicts for multiple users
   */
  async hasConflictsForMultipleUsers(
    userIds: string[],
    start: Date,
    end: Date,
  ): Promise<boolean> {
    const conflicts = await Promise.all(
      userIds.map(async (userId) => this.hasConflicts(userId, start, end)),
    );

    return conflicts.some((hasConflict) => hasConflict);
  }

  /**
   * Check conflicts for multiple users with details
   */
  async getConflictsForMultipleUsers(
    userIds: string[],
    start: Date,
    end: Date,
  ): Promise<{ userId: string; hasConflict: boolean }[]> {
    return Promise.all(
      userIds.map(async (userId) => ({
        userId,
        hasConflict: await this.hasConflicts(userId, start, end),
      })),
    );
  }

  /**
   * Get user's calendar events in a date range
   */
  async getUserEvents(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEvent[]> {
    const user = await this.getUserWithCalendarConfig(userId);

    if (!user.calendarProvider || !user.calendarCredentials) {
      return [];
    }

    const credentials = user.calendarCredentials as CalendarCredentials;

    switch (user.calendarProvider) {
      case CalendarProvider.GOOGLE:
        return this.googleCalendarService.getEvents(
          credentials,
          startDate,
          endDate,
        );
      case CalendarProvider.MICROSOFT:
        return this.microsoftCalendarService.getEvents(
          credentials,
          startDate,
          endDate,
        );
      default:
        return [];
    }
  }

  /**
   * Save user's calendar credentials
   */
  async saveUserCalendarCredentials(
    userId: string,
    provider: CalendarProvider,
    credentials: CalendarCredentials,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      calendarProvider: provider,
      calendarCredentials: credentials as any,
    });

    this.logger.log(`Saved calendar credentials for user ${userId}`);
  }

  /**
   * Update user's working hours
   */
  async updateUserWorkingHours(
    userId: string,
    workingHours: WorkingHours[],
  ): Promise<void> {
    await this.userRepository.update(userId, {
      workingHours: workingHours as any,
    });

    this.logger.log(`Updated working hours for user ${userId}`);
  }

  /**
   * Update user's timezone
   */
  async updateUserTimezone(userId: string, timezone: string): Promise<void> {
    if (!this.timezoneService.isValidTimezone(timezone)) {
      throw new BadRequestException('Invalid timezone');
    }

    await this.userRepository.update(userId, {
      timezone,
    });

    this.logger.log(`Updated timezone for user ${userId} to ${timezone}`);
  }

  /**
   * Get user with calendar configuration
   */
  private async getUserWithCalendarConfig(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Generate available time slots for scheduling
   */
  async generateAvailableSlots(
    userIds: string[],
    startDate: Date,
    endDate: Date,
    durationMinutes: number,
    targetTimezone?: string,
  ): Promise<TimeSlot[]> {
    // Find common availability
    const commonSlots = await this.findCommonAvailability(
      userIds,
      startDate,
      endDate,
      durationMinutes,
    );

    // Generate specific time slots of the requested duration
    const availableSlots: TimeSlot[] = [];

    for (const slot of commonSlots) {
      const slotDuration =
        (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);

      if (slotDuration >= durationMinutes) {
        // Generate slots within this free period
        let currentStart = slot.start;

        while (
          currentStart.getTime() + durationMinutes * 60 * 1000 <=
          slot.end.getTime()
        ) {
          const currentEnd = new Date(
            currentStart.getTime() + durationMinutes * 60 * 1000,
          );

          availableSlots.push({
            start: currentStart,
            end: currentEnd,
          });

          // Move to next slot (30-minute intervals)
          currentStart = new Date(currentStart.getTime() + 30 * 60 * 1000);
        }
      }
    }

    // Convert to target timezone if specified
    if (targetTimezone) {
      return this.timezoneService.convertTimeSlotsToTimezone(
        availableSlots,
        targetTimezone,
      );
    }

    return availableSlots;
  }

  /**
   * Disconnect user's calendar
   */
  async disconnectCalendar(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      calendarProvider: null,
      calendarCredentials: null,
    });

    this.logger.log(`Disconnected calendar for user ${userId}`);
  }

  /**
   * Create interview event for multiple participants
   */
  async createInterviewEventForParticipants(
    interviewId: string,
    candidate: any,
    job: any,
    interviewerIds: string[],
    scheduledAt: Date,
    durationMinutes: number,
    locationType: string,
    meetingLink?: string,
  ): Promise<void> {
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);

    // Get interviewer emails
    const interviewers = await this.userRepository.find({
      where: interviewerIds.map((id) => ({ id })),
    });

    const attendees = [
      candidate.email,
      ...interviewers.map((i) => i.email),
    ];

    const summary = `Interview: ${candidate.firstName} ${candidate.lastName} - ${job.title}`;
    const description = `Interview for ${job.title} position\n\nCandidate: ${candidate.firstName} ${candidate.lastName}\nType: ${locationType}${meetingLink ? `\n\nMeeting Link: ${meetingLink}` : ''}`;

    // Create event for each interviewer
    for (const interviewer of interviewers) {
      try {
        await this.createInterviewEvent(interviewer.id, {
          summary,
          description,
          start: scheduledAt,
          end: endTime,
          attendees,
          location: locationType === 'video' ? 'Video Call' : meetingLink,
          includeVideoConference: locationType === 'video' && !meetingLink,
        });
      } catch (error) {
        this.logger.error(
          `Failed to create calendar event for interviewer ${interviewer.id}: ${error.message}`,
        );
      }
    }
  }
}
