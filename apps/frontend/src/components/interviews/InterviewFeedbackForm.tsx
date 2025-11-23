import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviews';
import {
  InterviewFeedback,
  Scorecard,
  ScorecardAttribute,
  Decision,
} from '../../types/interview';

interface InterviewFeedbackFormProps {
  interviewId: string;
  feedbackId?: string;
  onSuccess?: (feedback: InterviewFeedback) => void;
  onCancel?: () => void;
}

export const InterviewFeedbackForm: React.FC<InterviewFeedbackFormProps> = ({
  interviewId,
  feedbackId,
  onSuccess,
  onCancel,
}) => {
  const [interview, setInterview] = useState<any>(null);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [formData, setFormData] = useState({
    scorecardId: '',
    overallRating: 0,
    decision: '' as Decision | '',
    attributeRatings: [] as Array<{ attributeId: string; value: any }>,
    strengths: '',
    concerns: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(true);

  useEffect(() => {
    loadData();
  }, [interviewId, feedbackId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Load interview details
      const interviewData = await interviewService.getInterview(interviewId);
      setInterview(interviewData);

      // If editing existing feedback, load it
      if (feedbackId) {
        const feedbackData = await interviewService.getFeedbackById(feedbackId);
        setFormData({
          scorecardId: feedbackData.scorecardId || '',
          overallRating: feedbackData.overallRating || 0,
          decision: feedbackData.decision || '',
          attributeRatings: feedbackData.attributeRatings || [],
          strengths: feedbackData.strengths || '',
          concerns: feedbackData.concerns || '',
          notes: feedbackData.notes || '',
        });
        setIsDraft(!feedbackData.submittedAt);

        if (feedbackData.scorecardId) {
          const scorecardData = await interviewService.getScorecard(
            feedbackData.scorecardId
          );
          setScorecard(scorecardData);
        }
      } else if (interviewData.interviewStage?.scorecardId) {
        // Load scorecard from interview stage
        const scorecardData = await interviewService.getScorecard(
          interviewData.interviewStage.scorecardId
        );
        setScorecard(scorecardData);
        setFormData((prev) => ({
          ...prev,
          scorecardId: scorecardData.id,
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAttributeRatingChange = (attributeId: string, value: any) => {
    setFormData((prev) => {
      const existingIndex = prev.attributeRatings.findIndex(
        (r) => r.attributeId === attributeId
      );

      const newRatings = [...prev.attributeRatings];
      if (existingIndex >= 0) {
        newRatings[existingIndex] = { attributeId, value };
      } else {
        newRatings.push({ attributeId, value });
      }

      return { ...prev, attributeRatings: newRatings };
    });
  };

  const getAttributeValue = (attributeId: string): any => {
    const rating = formData.attributeRatings.find(
      (r) => r.attributeId === attributeId
    );
    return rating?.value;
  };

  const renderAttributeInput = (attribute: ScorecardAttribute) => {
    const value = getAttributeValue(attribute.id);

    switch (attribute.type) {
      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAttributeRatingChange(attribute.id, rating)}
                className={`w-10 h-10 rounded-full border-2 ${
                  value === rating
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={value === true}
                onChange={() => handleAttributeRatingChange(attribute.id, true)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={value === false}
                onChange={() => handleAttributeRatingChange(attribute.id, false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) =>
              handleAttributeRatingChange(attribute.id, e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    if (!scorecard) return true; // No scorecard, basic validation only

    // Check required attributes
    for (const attribute of scorecard.attributes) {
      if (attribute.required) {
        const value = getAttributeValue(attribute.id);
        if (value === undefined || value === null || value === '') {
          setError(`Please provide a response for: ${attribute.name}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      if (feedbackId) {
        const feedback = await interviewService.updateFeedback(feedbackId, formData);
        onSuccess?.(feedback);
      } else {
        const feedback = await interviewService.createFeedback({
          interviewId,
          ...formData,
        });
        onSuccess?.(feedback);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let feedback: InterviewFeedback;

      if (feedbackId) {
        // Update existing feedback
        feedback = await interviewService.updateFeedback(feedbackId, formData);
        // Submit it
        feedback = await interviewService.submitFeedback(feedbackId);
      } else {
        // Create new feedback
        feedback = await interviewService.createFeedback({
          interviewId,
          ...formData,
        });
        // Submit it
        feedback = await interviewService.submitFeedback(feedback.id);
      }

      onSuccess?.(feedback);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-2">Interview Feedback</h2>
      {interview && (
        <p className="text-gray-600 mb-6">
          {interview.application?.candidate?.firstName}{' '}
          {interview.application?.candidate?.lastName} -{' '}
          {interview.application?.job?.title}
        </p>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setFormData({ ...formData, overallRating: rating })}
                className={`w-12 h-12 rounded-full border-2 text-lg font-semibold ${
                  formData.overallRating === rating
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            1 = Poor, 5 = Excellent
          </p>
        </div>

        {/* Decision */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hiring Recommendation *
          </label>
          <div className="space-y-2">
            {[
              { value: 'strong_yes', label: 'Strong Yes', color: 'green' },
              { value: 'yes', label: 'Yes', color: 'blue' },
              { value: 'neutral', label: 'Neutral', color: 'gray' },
              { value: 'no', label: 'No', color: 'orange' },
              { value: 'strong_no', label: 'Strong No', color: 'red' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={formData.decision === option.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      decision: e.target.value as Decision,
                    })
                  }
                  className="mr-3"
                />
                <span className="font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scorecard Attributes */}
        {scorecard && scorecard.attributes.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              {scorecard.name} Evaluation
            </h3>
            <div className="space-y-6">
              {scorecard.attributes.map((attribute) => (
                <div key={attribute.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {attribute.name}
                    {attribute.required && ' *'}
                  </label>
                  {attribute.description && (
                    <p className="text-sm text-gray-500 mb-2">
                      {attribute.description}
                    </p>
                  )}
                  {renderAttributeInput(attribute)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strengths
          </label>
          <textarea
            value={formData.strengths}
            onChange={(e) =>
              setFormData({ ...formData, strengths: e.target.value })
            }
            rows={4}
            placeholder="What did the candidate do well?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Concerns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Concerns
          </label>
          <textarea
            value={formData.concerns}
            onChange={(e) =>
              setFormData({ ...formData, concerns: e.target.value })
            }
            rows={4}
            placeholder="What are your concerns about this candidate?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            placeholder="Any other observations or comments?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            {isDraft && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save Draft
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !formData.overallRating || !formData.decision}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};
