import React, { useEffect, useState } from 'react';
import { Survey, SurveyTriggerType } from '../../types/survey';
import { surveysService } from '../../services/surveys';

interface SurveyListProps {
  onEdit: (survey: Survey) => void;
  onViewAnalytics: (survey: Survey) => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  onEdit,
  onViewAnalytics,
}) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await surveysService.getSurveys();
      setSurveys(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (survey: Survey) => {
    try {
      const updated = await surveysService.toggleSurveyActive(survey.id);
      setSurveys(surveys.map((s) => (s.id === survey.id ? updated : s)));
    } catch (err: any) {
      alert('Failed to toggle survey status');
    }
  };

  const handleDelete = async (survey: Survey) => {
    if (!confirm(`Are you sure you want to delete "${survey.name}"?`)) {
      return;
    }

    try {
      await surveysService.deleteSurvey(survey.id);
      setSurveys(surveys.filter((s) => s.id !== survey.id));
    } catch (err: any) {
      alert('Failed to delete survey');
    }
  };

  const getTriggerTypeLabel = (type: SurveyTriggerType): string => {
    const labels = {
      [SurveyTriggerType.POST_APPLICATION]: 'After Application',
      [SurveyTriggerType.POST_INTERVIEW]: 'After Interview',
      [SurveyTriggerType.POST_REJECTION]: 'After Rejection',
      [SurveyTriggerType.POST_OFFER]: 'After Offer',
      [SurveyTriggerType.MANUAL]: 'Manual',
    };
    return labels[type];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading surveys...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {surveys.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No surveys created yet</p>
          <p className="text-sm text-gray-400">
            Create your first survey to start collecting candidate feedback
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{survey.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        survey.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {survey.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {survey.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {survey.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {getTriggerTypeLabel(survey.triggerType)}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {survey.questions.length} question
                      {survey.questions.length !== 1 ? 's' : ''}
                    </span>
                    {survey.sendDelayHours > 0 && (
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Delay: {survey.sendDelayHours}h
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewAnalytics(survey)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => handleToggleActive(survey)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    {survey.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => onEdit(survey)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(survey)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
