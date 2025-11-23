import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface UserWorkingHoursConfig {
  userId: string;
  timezone: string;
  workingHours: WorkingHours[];
}

export interface TimeSlotWithTimezone {
  start: Date;
  end: Date;
  timezone: string;
  displayStart: string;
  displayEnd: string;
}

@Injectable()
export class TimezoneService {
  /**
   * Convert a date from one timezone to another
   */
  convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
    return moment.tz(date, fromTimezone).tz(toTimezone).toDate();
  }

  /**
   * Format a date in a specific timezone
   */
  formatInTimezone(
    date: Date,
    timezone: string,
    format: string = 'YYYY-MM-DD HH:mm:ss',
  ): string {
    return moment.tz(date, timezone).format(format);
  }

  /**
   * Get current time in a specific timezone
   */
  nowInTimezone(timezone: string): Date {
    return moment.tz(timezone).toDate();
  }

  /**
   * Check if a timezone is valid
   */
  isValidTimezone(timezone: string): boolean {
    return moment.tz.zone(timezone) !== null;
  }

  /**
   * Get all available timezones
   */
  getAllTimezones(): string[] {
    return moment.tz.names();
  }

  /**
   * Get timezone offset in minutes
   */
  getTimezoneOffset(timezone: string, date?: Date): number {
    const targetDate = date || new Date();
    return moment.tz(targetDate, timezone).utcOffset();
  }

  /**
   * Convert time slots to a specific timezone with display strings
   */
  convertTimeSlotsToTimezone(
    slots: Array<{ start: Date; end: Date }>,
    targetTimezone: string,
  ): TimeSlotWithTimezone[] {
    return slots.map((slot) => ({
      start: slot.start,
      end: slot.end,
      timezone: targetTimezone,
      displayStart: this.formatInTimezone(
        slot.start,
        targetTimezone,
        'MMM DD, YYYY h:mm A z',
      ),
      displayEnd: this.formatInTimezone(
        slot.end,
        targetTimezone,
        'h:mm A z',
      ),
    }));
  }

  /**
   * Check if a time falls within working hours
   */
  isWithinWorkingHours(
    date: Date,
    workingHours: WorkingHours[],
    timezone: string,
  ): boolean {
    const momentDate = moment.tz(date, timezone);
    const dayOfWeek = momentDate.day();
    const timeString = momentDate.format('HH:mm');

    const dayWorkingHours = workingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek,
    );

    if (!dayWorkingHours) {
      return false;
    }

    return (
      timeString >= dayWorkingHours.startTime &&
      timeString <= dayWorkingHours.endTime
    );
  }

  /**
   * Filter time slots to only include working hours
   */
  filterByWorkingHours(
    slots: Array<{ start: Date; end: Date }>,
    workingHours: WorkingHours[],
    timezone: string,
  ): Array<{ start: Date; end: Date }> {
    const filteredSlots: Array<{ start: Date; end: Date }> = [];

    for (const slot of slots) {
      const slotStart = moment.tz(slot.start, timezone);
      const slotEnd = moment.tz(slot.end, timezone);
      const dayOfWeek = slotStart.day();

      const dayWorkingHours = workingHours.find(
        (wh) => wh.dayOfWeek === dayOfWeek,
      );

      if (!dayWorkingHours) {
        continue;
      }

      // Parse working hours for this day
      const [startHour, startMinute] = dayWorkingHours.startTime
        .split(':')
        .map(Number);
      const [endHour, endMinute] = dayWorkingHours.endTime
        .split(':')
        .map(Number);

      const workStart = slotStart
        .clone()
        .hour(startHour)
        .minute(startMinute)
        .second(0);
      const workEnd = slotEnd
        .clone()
        .hour(endHour)
        .minute(endMinute)
        .second(0);

      // Calculate intersection of slot and working hours
      const intersectionStart = moment.max(slotStart, workStart);
      const intersectionEnd = moment.min(slotEnd, workEnd);

      if (intersectionStart.isBefore(intersectionEnd)) {
        filteredSlots.push({
          start: intersectionStart.toDate(),
          end: intersectionEnd.toDate(),
        });
      }
    }

    return filteredSlots;
  }

  /**
   * Generate time slots of specific duration within a date range
   */
  generateTimeSlots(
    startDate: Date,
    endDate: Date,
    durationMinutes: number,
    timezone: string,
    workingHours?: WorkingHours[],
  ): Array<{ start: Date; end: Date }> {
    const slots: Array<{ start: Date; end: Date }> = [];
    let current = moment.tz(startDate, timezone);
    const end = moment.tz(endDate, timezone);

    while (current.clone().add(durationMinutes, 'minutes').isBefore(end)) {
      const slotStart = current.toDate();
      const slotEnd = current.clone().add(durationMinutes, 'minutes').toDate();

      // Check if within working hours if provided
      if (
        !workingHours ||
        this.isWithinWorkingHours(slotStart, workingHours, timezone)
      ) {
        slots.push({
          start: slotStart,
          end: slotEnd,
        });
      }

      // Move to next slot (add duration)
      current.add(durationMinutes, 'minutes');
    }

    return slots;
  }

  /**
   * Get default working hours (Monday-Friday, 9 AM - 5 PM)
   */
  getDefaultWorkingHours(): WorkingHours[] {
    return [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
    ];
  }

  /**
   * Calculate available time slots considering multiple users' availability
   */
  findCommonAvailability(
    userAvailabilities: Array<{
      userId: string;
      freeSlots: Array<{ start: Date; end: Date }>;
      timezone: string;
      workingHours: WorkingHours[];
    }>,
    durationMinutes: number,
  ): Array<{ start: Date; end: Date }> {
    if (userAvailabilities.length === 0) {
      return [];
    }

    // Convert all slots to UTC for comparison
    const normalizedAvailabilities = userAvailabilities.map((user) => {
      const filteredSlots = this.filterByWorkingHours(
        user.freeSlots,
        user.workingHours,
        user.timezone,
      );

      return filteredSlots.map((slot) => ({
        start: moment.tz(slot.start, user.timezone).utc().toDate(),
        end: moment.tz(slot.end, user.timezone).utc().toDate(),
      }));
    });

    // Find intersection of all users' availability
    let commonSlots = normalizedAvailabilities[0];

    for (let i = 1; i < normalizedAvailabilities.length; i++) {
      commonSlots = this.intersectTimeSlots(
        commonSlots,
        normalizedAvailabilities[i],
      );
    }

    // Filter slots that are long enough for the meeting duration
    return commonSlots.filter((slot) => {
      const duration = (moment as any)(slot.end).diff((moment as any)(slot.start), 'minutes');
      return duration >= durationMinutes;
    });
  }

  /**
   * Find intersection of two sets of time slots
   */
  private intersectTimeSlots(
    slots1: Array<{ start: Date; end: Date }>,
    slots2: Array<{ start: Date; end: Date }>,
  ): Array<{ start: Date; end: Date }> {
    const intersections: Array<{ start: Date; end: Date }> = [];

    for (const slot1 of slots1) {
      for (const slot2 of slots2) {
        const start1 = (moment as any)(slot1.start);
        const end1 = (moment as any)(slot1.end);
        const start2 = (moment as any)(slot2.start);
        const end2 = (moment as any)(slot2.end);

        // Check if slots overlap
        if (start1.isBefore(end2) && start2.isBefore(end1)) {
          const intersectionStart = moment.max(start1, start2);
          const intersectionEnd = moment.min(end1, end2);

          intersections.push({
            start: intersectionStart.toDate(),
            end: intersectionEnd.toDate(),
          });
        }
      }
    }

    return intersections;
  }

  /**
   * Get timezone abbreviation (e.g., PST, EST)
   */
  getTimezoneAbbreviation(timezone: string, date?: Date): string {
    const targetDate = date || new Date();
    return moment.tz(targetDate, timezone).format('z');
  }

  /**
   * Parse time string in a specific timezone
   */
  parseTimeInTimezone(
    timeString: string,
    timezone: string,
    format: string = 'YYYY-MM-DD HH:mm',
  ): Date {
    return moment.tz(timeString, format, timezone).toDate();
  }

  /**
   * Check if daylight saving time is active
   */
  isDST(timezone: string, date?: Date): boolean {
    const targetDate = date || new Date();
    return moment.tz(targetDate, timezone).isDST();
  }

  /**
   * Get user-friendly timezone display name
   */
  getTimezoneDisplayName(timezone: string): string {
    const offset = this.getTimezoneOffset(timezone);
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    const abbr = this.getTimezoneAbbreviation(timezone);

    return `${timezone} (UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}) ${abbr}`;
  }
}
