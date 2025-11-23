export interface SchedulingLink {
  id: string;
  token: string;
  applicationId: string;
  durationMinutes: number;
  locationType: 'phone' | 'video' | 'onsite';
  startDate: string;
  endDate: string;
  used: boolean;
  expiresAt?: string;
  url: string;
}

export interface SchedulingLinkInfo {
  applicationId: string;
  candidate: {
    firstName: string;
    lastName: string;
  };
  job: {
    title: string;
  };
  durationMinutes: number;
  locationType: string;
  startDate: string;
  endDate: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  startFormatted: string;
  endFormatted: string;
}

export interface ScheduledInterview {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  locationType: string;
  meetingLink?: string;
}
