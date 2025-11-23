import api from './api';
import {
  SchedulingLink,
  SchedulingLinkInfo,
  TimeSlot,
  ScheduledInterview,
} from '../types/scheduling';

export interface CreateSchedulingLinkData {
  applicationId: string;
  interviewStageId?: string;
  interviewerIds: string[];
  durationMinutes: number;
  locationType: 'phone' | 'video' | 'onsite';
  meetingLink?: string;
  startDate: string;
  endDate: string;
  bufferMinutes?: number;
  expiresAt?: string;
}

export const schedulingService = {
  // Create a scheduling link (authenticated)
  async createSchedulingLink(
    data: CreateSchedulingLinkData
  ): Promise<SchedulingLink> {
    const response = await api.post('/interviews/scheduling-links', data);
    return response.data;
  },

  // Get scheduling links for an application (authenticated)
  async getSchedulingLinksByApplication(
    applicationId: string
  ): Promise<SchedulingLink[]> {
    const response = await api.get(
      `/interviews/scheduling-links/application/${applicationId}`
    );
    return response.data;
  },

  // Delete a scheduling link (authenticated)
  async deleteSchedulingLink(linkId: string): Promise<void> {
    await api.delete(`/interviews/scheduling-links/${linkId}`);
  },

  // Get scheduling link info (public - no auth)
  async getSchedulingLinkInfo(token: string): Promise<SchedulingLinkInfo> {
    const response = await api.get(`/interviews/schedule/${token}`);
    return response.data;
  },

  // Get available time slots (public - no auth)
  async getAvailableSlots(
    token: string,
    timezone?: string
  ): Promise<TimeSlot[]> {
    const params = timezone ? { timezone } : {};
    const response = await api.get(`/interviews/schedule/${token}/slots`, {
      params,
    });
    return response.data.slots;
  },

  // Book a time slot (public - no auth)
  async bookSlot(
    token: string,
    scheduledAt: string,
    timezone?: string
  ): Promise<{
    message: string;
    interview: ScheduledInterview;
    rescheduleUrl: string;
  }> {
    const response = await api.post(`/interviews/schedule/${token}/book`, {
      token,
      scheduledAt,
      timezone,
    });
    return response.data;
  },

  // Get reschedule info (public - no auth)
  async getRescheduleInfo(rescheduleToken: string): Promise<{
    interview: ScheduledInterview;
    candidate: { firstName: string; lastName: string };
    job: { title: string };
    allowedDateRange: { startDate: string; endDate: string };
  }> {
    const response = await api.get(`/interviews/reschedule/${rescheduleToken}`);
    return response.data;
  },

  // Get available slots for rescheduling (public - no auth)
  async getRescheduleSlots(
    rescheduleToken: string,
    timezone?: string
  ): Promise<TimeSlot[]> {
    const params = timezone ? { timezone } : {};
    const response = await api.get(
      `/interviews/reschedule/${rescheduleToken}/slots`,
      { params }
    );
    return response.data.slots;
  },

  // Reschedule interview (public - no auth)
  async rescheduleInterview(
    rescheduleToken: string,
    scheduledAt: string,
    timezone?: string
  ): Promise<{ message: string; interview: ScheduledInterview }> {
    const response = await api.post(
      `/interviews/reschedule/${rescheduleToken}`,
      {
        rescheduleToken,
        scheduledAt,
        timezone,
      }
    );
    return response.data;
  },

  // Cancel interview (public - no auth)
  async cancelInterview(
    rescheduleToken: string
  ): Promise<{ message: string }> {
    const response = await api.post(
      `/interviews/reschedule/${rescheduleToken}/cancel`
    );
    return response.data;
  },
};
