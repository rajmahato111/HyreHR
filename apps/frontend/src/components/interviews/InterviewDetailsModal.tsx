import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviews';
import { Interview, InterviewStatus, LocationType } from '../../types/interview';

interface InterviewDetailsModalProps {
  interviewId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (interview: Interview) => void;
  onViewFeedback?: (interview: Interview) => void;
}

export const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  interviewId,
  isOpen,
  onClose,
  onEdit,
  onViewFeedback,
}) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && interviewId) {
      loadInterview();
    }
  }, [isOpen, interviewId]);

  const loadInterview = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await interviewService.getInterview(interviewId);
      setInterview(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interview details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!interview || !confirm('Are you sure you want to cancel this interview?')) {
      return;
    }

    setActionLoading(true);
    try {
      await interviewService.cancelInterview(interview.id);
      await loadInterview(); // Reload to get updated status
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel interview');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!interview) return;

    setActionLoading(true);
    try {
      await interviewService.completeInterview(interview.id);
      await loadInterview(); // Reload to get updated status
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark interview as complete');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!interview || !confirm('Mark this interview as no-show?')) {
      return;
    }

    setActionLoading(true);
    try {
      await interviewService.markNoShow(interview.id);
      await loadInterview(); // Reload to get updated status
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as no-show');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: InterviewStatus): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationIcon = (type: LocationType): string => {
    switch (type) {
      case 'phone':
        return '📞';
      case 'video':
        return '🎥';
      case 'onsite':
        return '🏢';
      default:
        return '📍';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Interview Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          ) : interview ? (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    interview.status
                  )}`}
                >
                  {interview.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Candidate & Job */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Candidate</h3>
                <p className="text-xl">
                  {interview.application?.candidate?.firstName}{' '}
                  {interview.application?.candidate?.lastName}
                </p>
                <p className="text-gray-600">
                  {interview.application?.candidate?.email}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Position: {interview.application?.job?.title}
                </p>
              </div>

              {/* Date & Time */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Schedule</h3>
                <p className="text-lg">
                  {new Date(interview.scheduledAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-600">
                  {new Date(interview.scheduledAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  ({interview.durationMinutes} minutes)
                </p>
              </div>

              {/* Interview Stage */}
              {interview.interviewStage && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Interview Stage</h3>
                  <p>{interview.interviewStage.name}</p>
                  <p className="text-sm text-gray-500">
                    {interview.interviewStage.type}
                  </p>
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">
                    {getLocationIcon(interview.locationType)}
                  </span>
                  <div>
                    <p className="capitalize">{interview.locationType}</p>
                    {interview.locationType === 'video' && interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Join Meeting
                      </a>
                    )}
                    {interview.locationType === 'phone' &&
                      interview.locationDetails && (
                        <p className="text-sm text-gray-600">
                          {interview.locationDetails}
                        </p>
                      )}
                    {interview.locationType === 'onsite' &&
                      interview.locationDetails && (
                        <p className="text-sm text-gray-600">
                          {interview.locationDetails}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Participants</h3>
                <div className="space-y-2">
                  {interview.participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium">
                          {participant.user?.firstName} {participant.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {participant.user?.email}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 capitalize">
                        {participant.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Summary */}
              {interview.feedback && interview.feedback.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                  <p className="text-gray-600">
                    {interview.feedback.filter((f) => f.submittedAt).length} of{' '}
                    {interview.feedback.length} feedback submitted
                  </p>
                  {onViewFeedback && (
                    <button
                      onClick={() => onViewFeedback(interview)}
                      className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                      View All Feedback
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {interview.status === 'scheduled' && (
                  <>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(interview)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Edit Interview
                      </button>
                    )}
                    <button
                      onClick={handleComplete}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={handleMarkNoShow}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      Mark No-Show
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Cancel Interview
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
