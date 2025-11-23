import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  SurveyResponse,
  SurveyQuestionType,
  QuestionAnswer,
} from '../../types/survey';
import { surveysService } from '../../services/surveys';

export const PublicSurveyForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [surveyResponse, setSurveyResponse] = useState<SurveyResponse | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSurvey();
    }
  }, [token]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const data = await surveysService.getSurveyByToken(token!);
      setSurveyResponse(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Survey not found or has expired',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate required questions
      const requiredQuestions = surveyResponse?.survey?.questions.filter(
        (q) => q.required,
      );
      const missingAnswers = requiredQuestions?.filter(
        (q) => !answers[q.id] || answers[q.id] === '',
      );

      if (missingAnswers && missingAnswers.length > 0) {
        setError('Please answer all required questions');
        setSubmitting(false);
        return;
      }

      // Format answers
      const formattedAnswers: QuestionAnswer[] = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        }),
      );

      await surveysService.submitSurveyResponse(token!, formattedAnswers);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: any) => {
    const value = answers[question.id] || '';

    switch (question.type) {
      case SurveyQuestionType.NPS:
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [question.id]: score })}
                  className={`flex-1 py-2 border rounded ${
                    value === score
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        );

      case SurveyQuestionType.RATING:
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setAnswers({ ...answers, [question.id]: rating })}
                className={`text-3xl ${
                  value >= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        );

      case SurveyQuestionType.TEXT:
        return (
          <textarea
            value={value}
            onChange={(e) =>
              setAnswers({ ...answers, [question.id]: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Your answer..."
          />
        );

      case SurveyQuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, optIndex: number) => (
              <label key={optIndex} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) =>
                    setAnswers({ ...answers, [question.id]: e.target.value })
                  }
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case SurveyQuestionType.YES_NO:
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) =>
                  setAnswers({ ...answers, [question.id]: e.target.value })
                }
                className="mr-2"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value="no"
                checked={value === 'no'}
                onChange={(e) =>
                  setAnswers({ ...answers, [question.id]: e.target.value })
                }
                className="mr-2"
              />
              <span>No</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading survey...</div>
      </div>
    );
  }

  if (error && !surveyResponse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Survey Not Available
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-600">
            Your feedback has been submitted successfully. We appreciate you
            taking the time to share your thoughts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {surveyResponse?.survey?.name}
          </h1>
          {surveyResponse?.survey?.description && (
            <p className="text-gray-600 mb-6">
              {surveyResponse.survey.description}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {surveyResponse?.survey?.questions
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <label className="block">
                    <span className="text-lg font-medium text-gray-900">
                      {index + 1}. {question.question}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                  </label>
                  {renderQuestion(question)}
                </div>
              ))}

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
