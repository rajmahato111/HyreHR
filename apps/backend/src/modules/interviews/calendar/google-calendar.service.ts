import { Injectable, Logger } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees: string[];
  meetingLink?: string;
}

export interface CalendarCredentials {
  accessToken: string;
  refreshToken: string;
  expiryDate?: number;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  /**
   * Generate OAuth URL for user authorization
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<CalendarCredentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      throw new Error('Failed to authenticate with Google Calendar');
    }
  }

  /**
   * Set credentials for the OAuth client
   */
  private setCredentials(credentials: CalendarCredentials): void {
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiryDate,
    });
  }

  /**
   * Get calendar client with credentials
   */
  private getCalendarClient(
    credentials: CalendarCredentials,
  ): calendar_v3.Calendar {
    this.setCredentials(credentials);
    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Fetch availability (free/busy) for a user
   */
  async getAvailability(
    credentials: CalendarCredentials,
    startDate: Date,
    endDate: Date,
    calendarId: string = 'primary',
  ): Promise<TimeSlot[]> {
    try {
      const calendar = this.getCalendarClient(credentials);

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: calendarId }],
        },
      });

      const busySlots =
        response.data.calendars?.[calendarId]?.busy?.map((slot) => ({
          start: new Date(slot.start),
          end: new Date(slot.end),
        })) || [];

      return this.calculateFreeSlots(busySlots, startDate, endDate);
    } catch (error) {
      this.logger.error('Failed to fetch availability', error);
      throw new Error('Failed to fetch calendar availability');
    }
  }

  /**
   * Calculate free time slots from busy slots
   */
  private calculateFreeSlots(
    busySlots: TimeSlot[],
    startDate: Date,
    endDate: Date,
  ): TimeSlot[] {
    if (busySlots.length === 0) {
      return [{ start: startDate, end: endDate }];
    }

    // Sort busy slots by start time
    const sortedBusy = busySlots.sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    const freeSlots: TimeSlot[] = [];
    let currentTime = startDate;

    for (const busySlot of sortedBusy) {
      // If there's a gap before this busy slot
      if (currentTime < busySlot.start) {
        freeSlots.push({
          start: currentTime,
          end: busySlot.start,
        });
      }
      // Move current time to end of busy slot
      currentTime =
        busySlot.end > currentTime ? busySlot.end : currentTime;
    }

    // Add final free slot if there's time remaining
    if (currentTime < endDate) {
      freeSlots.push({
        start: currentTime,
        end: endDate,
      });
    }

    return freeSlots;
  }

  /**
   * Create a calendar event
   */
  async createEvent(
    credentials: CalendarCredentials,
    event: {
      summary: string;
      description?: string;
      start: Date;
      end: Date;
      attendees: string[];
      timezone: string;
      location?: string;
      conferenceData?: boolean;
    },
    calendarId: string = 'primary',
  ): Promise<CalendarEvent> {
    try {
      const calendar = this.getCalendarClient(credentials);

      const eventData: calendar_v3.Schema$Event = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: event.timezone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: event.timezone,
        },
        attendees: event.attendees.map((email) => ({ email })),
        location: event.location,
      };

      // Add conference data if requested (Google Meet)
      if (event.conferenceData) {
        eventData.conferenceData = {
          createRequest: {
            requestId: `${Date.now()}-${Math.random()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        };
      }

      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
        conferenceDataVersion: event.conferenceData ? 1 : 0,
        sendUpdates: 'all',
      });

      return {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        start: new Date(response.data.start.dateTime),
        end: new Date(response.data.end.dateTime),
        attendees:
          response.data.attendees?.map((a) => a.email).filter(Boolean) || [],
        meetingLink: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri,
      };
    } catch (error) {
      this.logger.error('Failed to create calendar event', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    credentials: CalendarCredentials,
    eventId: string,
    updates: {
      summary?: string;
      description?: string;
      start?: Date;
      end?: Date;
      attendees?: string[];
      timezone?: string;
      location?: string;
    },
    calendarId: string = 'primary',
  ): Promise<CalendarEvent> {
    try {
      const calendar = this.getCalendarClient(credentials);

      // First, get the existing event
      const existingEvent = await calendar.events.get({
        calendarId,
        eventId,
      });

      const eventData: calendar_v3.Schema$Event = {
        ...existingEvent.data,
        summary: updates.summary || existingEvent.data.summary,
        description: updates.description || existingEvent.data.description,
        location: updates.location || existingEvent.data.location,
      };

      if (updates.start && updates.end && updates.timezone) {
        eventData.start = {
          dateTime: updates.start.toISOString(),
          timeZone: updates.timezone,
        };
        eventData.end = {
          dateTime: updates.end.toISOString(),
          timeZone: updates.timezone,
        };
      }

      if (updates.attendees) {
        eventData.attendees = updates.attendees.map((email) => ({ email }));
      }

      const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventData,
        sendUpdates: 'all',
      });

      return {
        id: response.data.id,
        summary: response.data.summary,
        description: response.data.description,
        start: new Date(response.data.start.dateTime),
        end: new Date(response.data.end.dateTime),
        attendees:
          response.data.attendees?.map((a) => a.email).filter(Boolean) || [],
        meetingLink: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri,
      };
    } catch (error) {
      this.logger.error('Failed to update calendar event', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    credentials: CalendarCredentials,
    eventId: string,
    calendarId: string = 'primary',
  ): Promise<void> {
    try {
      const calendar = this.getCalendarClient(credentials);

      await calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });

      this.logger.log(`Deleted calendar event: ${eventId}`);
    } catch (error) {
      this.logger.error('Failed to delete calendar event', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Check for conflicts in a time range
   */
  async hasConflicts(
    credentials: CalendarCredentials,
    start: Date,
    end: Date,
    calendarId: string = 'primary',
  ): Promise<boolean> {
    try {
      const calendar = this.getCalendarClient(credentials);

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          items: [{ id: calendarId }],
        },
      });

      const busySlots = response.data.calendars?.[calendarId]?.busy || [];
      return busySlots.length > 0;
    } catch (error) {
      this.logger.error('Failed to check for conflicts', error);
      throw new Error('Failed to check for calendar conflicts');
    }
  }

  /**
   * Get events in a date range
   */
  async getEvents(
    credentials: CalendarCredentials,
    startDate: Date,
    endDate: Date,
    calendarId: string = 'primary',
  ): Promise<CalendarEvent[]> {
    try {
      const calendar = this.getCalendarClient(credentials);

      const response = await calendar.events.list({
        calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (
        response.data.items?.map((event) => ({
          id: event.id,
          summary: event.summary,
          description: event.description,
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          attendees:
            event.attendees?.map((a) => a.email).filter(Boolean) || [],
          meetingLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri,
        })) || []
      );
    } catch (error) {
      this.logger.error('Failed to fetch events', error);
      throw new Error('Failed to fetch calendar events');
    }
  }
}
