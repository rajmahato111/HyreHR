import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { TimeSlot, CalendarEvent, CalendarCredentials } from './google-calendar.service';

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface MicrosoftEvent {
  id: string;
  subject: string;
  body?: {
    content: string;
    contentType: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    emailAddress: {
      address: string;
    };
  }>;
  location?: {
    displayName: string;
  };
  onlineMeeting?: {
    joinUrl: string;
  };
}

@Injectable()
export class MicrosoftCalendarService {
  private readonly logger = new Logger(MicrosoftCalendarService.name);
  private readonly graphApiUrl = 'https://graph.microsoft.com/v1.0';
  private readonly authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0';

  /**
   * Generate OAuth URL for user authorization
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      response_type: 'code',
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
      response_mode: 'query',
      scope: 'offline_access Calendars.ReadWrite Calendars.Read.Shared OnlineMeetings.ReadWrite',
      prompt: 'consent',
    });

    return `${this.authUrl}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<CalendarCredentials> {
    try {
      const response = await axios.post<MicrosoftTokenResponse>(
        `${this.authUrl}/token`,
        new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET,
          code,
          redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiryDate: Date.now() + response.data.expires_in * 1000,
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      throw new Error('Failed to authenticate with Microsoft Calendar');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<CalendarCredentials> {
    try {
      const response = await axios.post<MicrosoftTokenResponse>(
        `${this.authUrl}/token`,
        new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiryDate: Date.now() + response.data.expires_in * 1000,
      };
    } catch (error) {
      this.logger.error('Failed to refresh access token', error);
      throw new Error('Failed to refresh Microsoft Calendar token');
    }
  }

  /**
   * Get axios instance with authorization header
   */
  private getClient(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.graphApiUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch availability (free/busy) for a user
   */
  async getAvailability(
    credentials: CalendarCredentials,
    startDate: Date,
    endDate: Date,
    userEmail?: string,
  ): Promise<TimeSlot[]> {
    try {
      const client = this.getClient(credentials.accessToken);

      const response = await client.post('/me/calendar/getSchedule', {
        schedules: [userEmail || 'me'],
        startTime: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        endTime: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
        availabilityViewInterval: 30,
      });

      const scheduleItems = response.data.value[0]?.scheduleItems || [];
      const busySlots: TimeSlot[] = scheduleItems
        .filter((item: any) => item.status === 'busy' || item.status === 'tentative')
        .map((item: any) => ({
          start: new Date(item.start.dateTime),
          end: new Date(item.end.dateTime),
        }));

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

    const sortedBusy = busySlots.sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    const freeSlots: TimeSlot[] = [];
    let currentTime = startDate;

    for (const busySlot of sortedBusy) {
      if (currentTime < busySlot.start) {
        freeSlots.push({
          start: currentTime,
          end: busySlot.start,
        });
      }
      currentTime = busySlot.end > currentTime ? busySlot.end : currentTime;
    }

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
      isOnlineMeeting?: boolean;
    },
  ): Promise<CalendarEvent> {
    try {
      const client = this.getClient(credentials.accessToken);

      const eventData: any = {
        subject: event.summary,
        body: {
          contentType: 'HTML',
          content: event.description || '',
        },
        start: {
          dateTime: event.start.toISOString(),
          timeZone: event.timezone,
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: event.timezone,
        },
        attendees: event.attendees.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        })),
      };

      if (event.location) {
        eventData.location = {
          displayName: event.location,
        };
      }

      if (event.isOnlineMeeting) {
        eventData.isOnlineMeeting = true;
        eventData.onlineMeetingProvider = 'teamsForBusiness';
      }

      const response = await client.post<MicrosoftEvent>(
        '/me/calendar/events',
        eventData,
      );

      return {
        id: response.data.id,
        summary: response.data.subject,
        description: response.data.body?.content,
        start: new Date(response.data.start.dateTime),
        end: new Date(response.data.end.dateTime),
        attendees: response.data.attendees.map((a) => a.emailAddress.address),
        meetingLink: response.data.onlineMeeting?.joinUrl,
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
  ): Promise<CalendarEvent> {
    try {
      const client = this.getClient(credentials.accessToken);

      const eventData: any = {};

      if (updates.summary) {
        eventData.subject = updates.summary;
      }

      if (updates.description) {
        eventData.body = {
          contentType: 'HTML',
          content: updates.description,
        };
      }

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
        eventData.attendees = updates.attendees.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        }));
      }

      if (updates.location) {
        eventData.location = {
          displayName: updates.location,
        };
      }

      const response = await client.patch<MicrosoftEvent>(
        `/me/calendar/events/${eventId}`,
        eventData,
      );

      return {
        id: response.data.id,
        summary: response.data.subject,
        description: response.data.body?.content,
        start: new Date(response.data.start.dateTime),
        end: new Date(response.data.end.dateTime),
        attendees: response.data.attendees.map((a) => a.emailAddress.address),
        meetingLink: response.data.onlineMeeting?.joinUrl,
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
  ): Promise<void> {
    try {
      const client = this.getClient(credentials.accessToken);

      await client.delete(`/me/calendar/events/${eventId}`);

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
    userEmail?: string,
  ): Promise<boolean> {
    try {
      const client = this.getClient(credentials.accessToken);

      const response = await client.post('/me/calendar/getSchedule', {
        schedules: [userEmail || 'me'],
        startTime: {
          dateTime: start.toISOString(),
          timeZone: 'UTC',
        },
        endTime: {
          dateTime: end.toISOString(),
          timeZone: 'UTC',
        },
        availabilityViewInterval: 30,
      });

      const scheduleItems = response.data.value[0]?.scheduleItems || [];
      const conflicts = scheduleItems.filter(
        (item: any) => item.status === 'busy' || item.status === 'tentative',
      );

      return conflicts.length > 0;
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
  ): Promise<CalendarEvent[]> {
    try {
      const client = this.getClient(credentials.accessToken);

      const params = new URLSearchParams({
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        $orderby: 'start/dateTime',
      });

      const response = await client.get<{ value: MicrosoftEvent[] }>(
        `/me/calendar/calendarView?${params.toString()}`,
      );

      return response.data.value.map((event) => ({
        id: event.id,
        summary: event.subject,
        description: event.body?.content,
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        attendees: event.attendees.map((a) => a.emailAddress.address),
        meetingLink: event.onlineMeeting?.joinUrl,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch events', error);
      throw new Error('Failed to fetch calendar events');
    }
  }
}
