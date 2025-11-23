import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { schedulingService } from '../services/scheduling';
import {
  SchedulingLinkInfo,
  TimeSlot,
  ScheduledInterview,
} from '../types/scheduling';

const CandidateSchedulingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<SchedulingLinkInfo | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookedInterview, setBookedInterview] =
    useState<ScheduledInterview | null>(null);
  const [rescheduleUrl, setRescheduleUrl] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    if (token) {
      loadSchedulingInfo();
    }
  }, [token]);

  useEffect(() => {
    if (linkInfo && timezone) {
      loadAvailableSlots();
    }
  }, [linkInfo, timezone]);

  const loadSchedulingInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await schedulingService.getSchedulingLinkInfo(token!);
      setLinkInfo(info);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load scheduling information. The link may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setError(null);
      const availableSlots = await schedulingService.getAvailableSlots(
        token!,
        timezone
      );
      setSlots(availableSlots);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load available time slots'
      );
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;

    try {
      setBooking(true);
      setError(null);
      const result = await schedulingService.bookSlot(
        token!,
        selectedSlot.start,
        timezone
      );
      setBookedInterview(result.interview);
      setRescheduleUrl(result.rescheduleUrl);
      setBooked(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to book the time slot. It may no longer be available.'
      );
    } finally {
      setBooking(false);
    }
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    const grouped: { [date: string]: TimeSlot[] } = {};

    slots.forEach((slot) => {
      const date = new Date(slot.start).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !linkInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Unable to Load Scheduling Link
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (booked && bookedInterview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Interview Scheduled Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your interview for {linkInfo?.job.title} has been scheduled.
            </p>

            <div className="mt-8 bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Interview Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(bookedInterview.scheduledAt).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {bookedInterview.durationMinutes} minutes
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">
                    {bookedInterview.locationType}
                  </dd>
                </div>
                {bookedInterview.meetingLink && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Meeting Link
                    </dt>
                    <dd className="mt-1 text-sm">
                      <a
                        href={bookedInterview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {bookedInterview.meetingLink}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-6 text-sm text-gray-600 space-y-2">
              <p>
                A calendar invitation has been sent to your email address. Please
                check your inbox for the meeting details.
              </p>
              {rescheduleUrl && (
                <p>
                  Need to reschedule?{' '}
                  <a
                    href={rescheduleUrl}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Click here to reschedule or cancel
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(slots);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule Your Interview
          </h1>
          <div className="mt-4 space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Position:</span> {linkInfo?.job.title}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Duration:</span>{' '}
              {linkInfo?.durationMinutes} minutes
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Type:</span>{' '}
              <span className="capitalize">{linkInfo?.locationType}</span>
            </p>
          </div>

          {/* Timezone Selector */}
          <div className="mt-4">
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700"
            >
              Your Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Australia/Sydney">Sydney (AEDT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Available Slots */}
        {slots.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No Available Time Slots
            </h3>
            <p className="mt-2 text-gray-600">
              There are currently no available time slots. Please check back later
              or contact the recruiter.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select a Time Slot
            </h2>

            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    {date}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {dateSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                          selectedSlot === slot
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {new Date(slot.start).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedSlot && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Selected Time:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(selectedSlot.start).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZoneName: 'short',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={handleBookSlot}
                    disabled={booking}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateSchedulingPage;
