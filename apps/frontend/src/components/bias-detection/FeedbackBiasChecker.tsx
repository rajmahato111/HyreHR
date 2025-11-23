import React, { useState, useEffect } from 'react';
import { biasDetectionService } from '../../services/bias-detection';
import { FeedbackBiasCheck } from '../../types/bias-detection';

interface FeedbackBiasCheckerProps {
  feedbackText: {
    strengths?: string;
    concerns?: string;
    notes?: string;
  };
  onBiasDetected?: (check: FeedbackBiasCheck) => void;
}

export const FeedbackBiasChecker: React.FC<FeedbackBiasCheckerProps> = ({
  feedbackText,
  onBiasDetected,
}) => {
  const [biasCheck, setBiasCheck] = useState<FeedbackBiasCheck | null>(null);

  useEffect(() => {
    const checkBias = async () => {
      const combinedText = `${feedbackText.strengths || ''} ${feedbackText.concerns || ''} ${feedbackText.notes || ''}`.trim();
      
      if (!combinedText) {
        setBiasCheck(null);
        return;
      }

      try {
        const result = await biasDetectionService.checkFeedback(feedbackText);
        setBiasCheck(result);
        if (onBiasDetected && result.hasBias) {
          onBiasDetected(result);
        }
      } catch (error) {
        console.error('Failed to check bias:', error);
      }
    };

    // Debounce the bias check
    const timeoutId = setTimeout(checkBias, 500);
    return () => clearTimeout(timeoutId);
  }, [feedbackText, onBiasDetected]);

  if (!biasCheck || !biasCheck.hasBias) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      age: 'bg-red-100 text-red-800',
      gender: 'bg-purple-100 text-purple-800',
      gender_stereotype: 'bg-purple-100 text-purple-800',
      cultural: 'bg-orange-100 text-orange-800',
      appearance: 'bg-yellow-100 text-yellow-800',
      family_status: 'bg-pink-100 text-pink-800',
      disability: 'bg-red-100 text-red-800',
      subjective: 'bg-blue-100 text-blue-800',
      educational: 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      {biasCheck.shouldBlock && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Severe Bias Detected
              </h3>
              <p className="mt-1 text-sm text-red-700">
                This feedback contains severe bias and should be revised before
                submission.
              </p>
            </div>
          </div>
        </div>
      )}

      {biasCheck.shouldWarn && !biasCheck.shouldBlock && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Potential Bias Detected
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Please review the highlighted terms and consider revising your
                feedback.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bias Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Bias Score</span>
          <span
            className={`text-lg font-bold ${
              biasCheck.biasScore >= 75
                ? 'text-red-600'
                : biasCheck.biasScore >= 50
                ? 'text-orange-600'
                : biasCheck.biasScore >= 25
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {biasCheck.biasScore}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              biasCheck.biasScore >= 75
                ? 'bg-red-500'
                : biasCheck.biasScore >= 50
                ? 'bg-orange-500'
                : biasCheck.biasScore >= 25
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${biasCheck.biasScore}%` }}
          ></div>
        </div>
      </div>

      {/* Biased Terms */}
      {biasCheck.biasedTerms.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Potentially Biased Terms ({biasCheck.biasedTerms.length})
          </h4>
          <div className="space-y-3">
            {biasCheck.biasedTerms.map((term, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    "{term.term}"
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                      term.category
                    )}`}
                  >
                    {term.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Context:</span> {term.context}
                </div>
                <div className="text-xs text-blue-900 bg-blue-50 p-2 rounded border border-blue-200">
                  <span className="font-medium">Suggestion:</span>{' '}
                  {term.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {biasCheck.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {biasCheck.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start text-sm text-blue-800">
                <span className="text-blue-600 mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
