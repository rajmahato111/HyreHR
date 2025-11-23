import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviews';
import { Interview, InterviewStatus } from '../../types/interview';

type ViewMode = 'day' | 'week' | 'month';

interface InterviewCalendarProps {
  onInterviewClick?: (interview: Interview) => void;
  userId?: string; // If provided, show only this user's interviews
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  onInterviewClick,
  userId,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterviews();
  }, [currentDate, viewMode, userId]);

  const loadInterviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange();
      const data = await interviewService.getInterviewsByDateRange(
        startDate.toISOString(),
        endDate.toISOString()
      );

      // Filter by user if specified
      const filteredData = userId
        ? data.filter((interview) =>
            interview.participants.some((p) => p.userId === userId)
          )
        : data;

      setInterviews(filteredData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (): { startDate: Date; endDate: Date } => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate: start, endDate: end };
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: InterviewStatus): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDateHeader = (): string => {
    switch (viewMode) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'week':
        const { startDate, endDate } = getDateRange();
        return `${startDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${endDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`;
      case 'month':
        return currentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });
    }
  };

  const renderDayView = () => {
    const dayInterviews = interviews.filter((interview) => {
      const interviewDate = new Date(interview.scheduledAt);
      return interviewDate.toDateString() === currentDate.toDateString();
    });

    const sortedInterviews = dayInterviews.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    return (
      <div className="space-y-2">
        {sortedInterviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No interviews scheduled for this day
          </p>
        ) : (
          sortedInterviews.map((interview) => (
            <div
              key={interview.id}
              onClick={() => onInterviewClick?.(interview)}
              className={`p-4 border-l-4 rounded-md cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(
                interview.status
              )}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    - {interview.durationMinutes} min
                  </p>
                  <p className="text-sm">
                    {interview.application?.candidate?.firstName}{' '}
                    {interview.application?.candidate?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {interview.application?.job?.title}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                  {interview.locationType}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const { startDate } = getDateRange();
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      return day;
    });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayInterviews = interviews.filter((interview) => {
            const interviewDate = new Date(interview.scheduledAt);
            return interviewDate.toDateString() === day.toDateString();
          });

          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.toISOString()}
              className={`border rounded-md p-2 min-h-[200px] ${
                isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
            >
              <div className="font-semibold text-sm mb-2">
                {day.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className="space-y-1">
                {dayInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => onInterviewClick?.(interview)}
                    className={`text-xs p-2 rounded cursor-pointer hover:shadow ${getStatusColor(
                      interview.status
                    )}`}
                  >
                    <p className="font-medium">
                      {new Date(interview.scheduledAt).toLocaleTimeString(
                        'en-US',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                    <p className="truncate">
                      {interview.application?.candidate?.firstName}{' '}
                      {interview.application?.candidate?.lastName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const { startDate } = getDateRange();
    const firstDay = new Date(startDate);
    firstDay.setDate(1);
    const startDayOfWeek = firstDay.getDay();

    const daysInMonth = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth() + 1,
      0
    ).getDate();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(firstDay);
      day.setDate(i);
      days.push(day);
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-sm py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="border rounded p-2 bg-gray-50" />;
            }

            const dayInterviews = interviews.filter((interview) => {
              const interviewDate = new Date(interview.scheduledAt);
              return interviewDate.toDateString() === day.toDateString();
            });

            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`border rounded p-2 min-h-[100px] ${
                  isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
              >
                <div className="font-semibold text-sm mb-1">{day.getDate()}</div>
                <div className="space-y-1">
                  {dayInterviews.slice(0, 3).map((interview) => (
                    <div
                      key={interview.id}
                      onClick={() => onInterviewClick?.(interview)}
                      className={`text-xs p-1 rounded cursor-pointer hover:shadow ${getStatusColor(
                        interview.status
                      )}`}
                    >
                      <p className="truncate">
                        {new Date(interview.scheduledAt).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                  ))}
                  {dayInterviews.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{dayInterviews.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Interview Calendar</h2>
          <button
            onClick={navigateToday}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Selector */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm capitalize ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={navigatePrevious}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ← Previous
        </button>
        <h3 className="text-lg font-semibold">{formatDateHeader()}</h3>
        <button
          onClick={navigateNext}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Next →
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interviews...</p>
        </div>
      ) : (
        <>
          {/* Calendar View */}
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">Status Legend:</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                <span className="text-sm">Scheduled</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                <span className="text-sm">Cancelled</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded mr-2"></div>
                <span className="text-sm">No Show</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
