import React, { useEffect, useState } from 'react';
import {
  SurveyAnalytics,
  OrganizationSurveyAnalytics,
  SentimentScore,
} from '../../types/survey';
import { surveysService } from '../../services/surveys';

interface SurveyResponseDashboardProps {
  surveyId?: string;
}

export const SurveyResponseDashboard: React.FC<
  SurveyResponseDashboardProps
> = ({ surveyId }) => {
  const [analytics, setAnalytics] = useState<
    SurveyAnalytics | OrganizationSurveyAnalytics | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [surveyId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = surveyId
        ? await surveysService.getSurveyAnalytics(surveyId)
        : await surveysService.getOrganizationAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getNPSColor = (nps: number): string => {
    if (nps >= 50) return 'text-green-600';
    if (nps >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: SentimentScore): string => {
    const colors = {
      [SentimentScore.VERY_POSITIVE]: 'bg-green-100 text-green-800',
      [SentimentScore.POSITIVE]: 'bg-green-50 text-green-700',
      [SentimentScore.NEUTRAL]: 'bg-gray-100 text-gray-800',
      [SentimentScore.NEGATIVE]: 'bg-red-50 text-red-700',
      [SentimentScore.VERY_NEGATIVE]: 'bg-red-100 text-red-800',
    };
    return colors[sentiment];
  };

  const getSentimentLabel = (sentiment: string): string => {
    return sentiment
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
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

  if (!analytics) {
    return null;
  }

  const isSurveyAnalytics = 'completionRate' in analytics;
  const nps = isSurveyAnalytics
    ? (analytics as SurveyAnalytics).nps
    : (analytics as OrganizationSurveyAnalytics).overallNPS;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Responses</div>
          <div className="text-3xl font-bold">{analytics.totalResponses}</div>
        </div>

        {isSurveyAnalytics && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
            <div className="text-3xl font-bold">
              {(analytics as SurveyAnalytics).completionRate}%
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Net Promoter Score</div>
          <div className={`text-3xl font-bold ${getNPSColor(nps)}`}>{nps}</div>
          <div className="text-xs text-gray-500 mt-1">
            {nps >= 50 && 'Excellent'}
            {nps >= 0 && nps < 50 && 'Good'}
            {nps < 0 && 'Needs Improvement'}
          </div>
        </div>

        {isSurveyAnalytics && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">
              Avg Response Time
            </div>
            <div className="text-3xl font-bold">
              {(analytics as SurveyAnalytics).avgResponseTime}
            </div>
            <div className="text-xs text-gray-500 mt-1">minutes</div>
          </div>
        )}
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
        <div className="space-y-3">
          {Object.entries(analytics.sentimentDistribution).map(
            ([sentiment, count]) => {
              const percentage =
                analytics.totalResponses > 0
                  ? Math.round((count / analytics.totalResponses) * 100)
                  : 0;

              return (
                <div key={sentiment}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      {getSentimentLabel(sentiment)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        sentiment.includes('positive')
                          ? 'bg-green-500'
                          : sentiment.includes('negative')
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* NPS by Trigger (Organization view) */}
      {!isSurveyAnalytics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">NPS by Survey Type</h3>
          <div className="space-y-3">
            {Object.entries(
              (analytics as OrganizationSurveyAnalytics).npsByTrigger,
            ).map(([trigger, score]) => (
              <div key={trigger} className="flex justify-between items-center">
                <span className="text-sm">
                  {trigger
                    .split('_')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </span>
                <span className={`text-lg font-semibold ${getNPSColor(score)}`}>
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Responses (Survey view) */}
      {isSurveyAnalytics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Responses</h3>
          <div className="space-y-3">
            {(analytics as SurveyAnalytics).responses
              .slice(0, 10)
              .map((response) => (
                <div
                  key={response.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">
                      {new Date(response.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {response.npsScore !== undefined && (
                      <span className="text-sm font-medium">
                        NPS: {response.npsScore}
                      </span>
                    )}
                    {response.sentiment && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(
                          response.sentiment,
                        )}`}
                      >
                        {getSentimentLabel(response.sentiment)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Surveys List (Organization view) */}
      {!isSurveyAnalytics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Surveys</h3>
          <div className="space-y-3">
            {(analytics as OrganizationSurveyAnalytics).surveys.map(
              (survey) => (
                <div
                  key={survey.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <div>
                    <div className="font-medium">{survey.name}</div>
                    <div className="text-sm text-gray-500">
                      {survey.triggerType
                        .split('_')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {survey.responseCount} responses
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};
