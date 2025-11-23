import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviews';
import { InterviewFeedback, Decision } from '../../types/interview';

interface InterviewFeedbackListProps {
  interviewId: string;
  onEditFeedback?: (feedbackId: string) => void;
}

export const InterviewFeedbackList: React.FC<InterviewFeedbackListProps> = ({
  interviewId,
  onEditFeedback,
}) => {
  const [feedback, setFeedback] = useState<InterviewFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [interviewId]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await interviewService.getFeedback(interviewId);
      setFeedback(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision?: Decision): string => {
    switch (decision) {
      case 'strong_yes':
        return 'bg-green-100 text-green-800';
      case 'yes':
        return 'bg-blue-100 text-blue-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      case 'no':
        return 'bg-orange-100 text-orange-800';
      case 'strong_no':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDecisionLabel = (decision?: Decision): string => {
    if (!decision) return 'Not Set';
    return decision
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRatingStars = (rating?: number): string => {
    if (!rating) return '☆☆☆☆☆';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          No feedback submitted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((fb) => (
        <div key={fb.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {fb.interviewer?.firstName} {fb.interviewer?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{fb.interviewer?.email}</p>
            </div>
            <div className="text-right">
              {fb.submittedAt ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Submitted
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                  Draft
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Overall Rating */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Overall Rating</p>
              <p className="text-2xl">{getRatingStars(fb.overallRating)}</p>
              <p className="text-sm text-gray-500">
                {fb.overallRating || 0} / 5
              </p>
            </div>

            {/* Decision */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Recommendation</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDecisionColor(
                  fb.decision
                )}`}
              >
                {getDecisionLabel(fb.decision)}
              </span>
            </div>
          </div>

          {/* Scorecard Attributes */}
          {fb.scorecard && fb.attributeRatings.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-semibold mb-3">{fb.scorecard.name}</h4>
              <div className="space-y-2">
                {fb.attributeRatings.map((rating) => {
                  const attribute = fb.scorecard?.attributes.find(
                    (a) => a.id === rating.attributeId
                  );
                  if (!attribute) return null;

                  return (
                    <div key={rating.attributeId} className="flex justify-between">
                      <span className="text-sm text-gray-700">
                        {attribute.name}:
                      </span>
                      <span className="text-sm font-medium">
                        {attribute.type === 'rating' && `${rating.value}/5`}
                        {attribute.type === 'yes_no' &&
                          (rating.value ? 'Yes' : 'No')}
                        {attribute.type === 'text' && rating.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths */}
          {fb.strengths && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Strengths
              </h4>
              <p className="text-gray-800 whitespace-pre-wrap">{fb.strengths}</p>
            </div>
          )}

          {/* Concerns */}
          {fb.concerns && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Concerns
              </h4>
              <p className="text-gray-800 whitespace-pre-wrap">{fb.concerns}</p>
            </div>
          )}

          {/* Notes */}
          {fb.notes && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">
                Additional Notes
              </h4>
              <p className="text-gray-800 whitespace-pre-wrap">{fb.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-sm text-gray-500 pt-4 border-t">
            <p>
              Created: {new Date(fb.createdAt).toLocaleString()}
            </p>
            {fb.submittedAt && (
              <p>
                Submitted: {new Date(fb.submittedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Edit Button */}
          {!fb.submittedAt && onEditFeedback && (
            <div className="mt-4">
              <button
                onClick={() => onEditFeedback(fb.id)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Draft
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
