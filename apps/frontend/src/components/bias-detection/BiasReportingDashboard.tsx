import React, { useState, useEffect } from 'react';
import { biasDetectionService } from '../../services/bias-detection';
import {
  BiasReport,
  BiasAlert,
  BiasAlertSeverity,
  BiasAlertType,
} from '../../types/bias-detection';

interface BiasReportingDashboardProps {
  organizationId: string;
  jobId?: string;
}

export const BiasReportingDashboard: React.FC<BiasReportingDashboardProps> = ({
  organizationId,
  jobId,
}) => {
  const [report, setReport] = useState<BiasReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReport();
  }, [jobId, dateRange]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await biasDetectionService.generateReport({
        jobId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setReport(data);
    } catch (error) {
      console.error('Failed to load bias report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: BiasAlertSeverity) => {
    switch (severity) {
      case BiasAlertSeverity.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-300';
      case BiasAlertSeverity.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case BiasAlertSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case BiasAlertSeverity.LOW:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAlertTypeLabel = (type: BiasAlertType) => {
    switch (type) {
      case BiasAlertType.BIASED_LANGUAGE:
        return 'Biased Language';
      case BiasAlertType.STATISTICAL_DISPARITY:
        return 'Statistical Disparity';
      case BiasAlertType.RATING_INCONSISTENCY:
        return 'Rating Inconsistency';
      case BiasAlertType.DEMOGRAPHIC_PATTERN:
        return 'Demographic Pattern';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bias report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bias Detection Report
          </h1>
          <p className="text-gray-600 mt-1">
            Analyze hiring patterns and identify potential bias
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, startDate: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) =>
              setDateRange({ ...dateRange, endDate: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-sm font-medium text-gray-600">Total Alerts</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {report.summary.totalAlerts}
          </div>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
          <div className="text-sm font-medium text-red-600">
            Critical Alerts
          </div>
          <div className="mt-2 text-3xl font-bold text-red-900">
            {report.summary.criticalAlerts}
          </div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg shadow border border-orange-200">
          <div className="text-sm font-medium text-orange-600">
            High Priority
          </div>
          <div className="mt-2 text-3xl font-bold text-orange-900">
            {report.summary.highAlerts}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="text-sm font-medium text-gray-600">
            Feedback with Bias
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {report.summary.feedbackWithBias}
            <span className="text-sm font-normal text-gray-500">
              {' '}
              / {report.summary.totalFeedbackAnalyzed}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {report.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Alerts
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {report.alerts.map((alert, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getAlertTypeLabel(alert.type)}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{alert.message}</p>
                    {alert.recommendation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <span className="font-medium">Recommendation:</span>{' '}
                          {alert.recommendation}
                        </p>
                      </div>
                    )}
                    {alert.data && (
                      <details className="mt-3">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                          {JSON.stringify(alert.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pass-Through Rates */}
      {report.passRates && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pass-Through Rates by Demographic
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Overall pass rate: {report.passRates.overallPassRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {report.passRates.groups.map((group, index) => {
                const isAffected = report.passRates?.affectedGroups.includes(
                  group.group
                );
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {group.group}
                        {isAffected && (
                          <span className="ml-2 text-xs text-red-600 font-semibold">
                            ⚠ Disparity Detected
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-gray-600">
                        {group.passed} / {group.total} ({group.passRate.toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isAffected ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${group.passRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Demographic Representation */}
      {report.representation && report.representation.stages.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Demographic Representation by Stage
            </h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stage
                  </th>
                  {Object.keys(
                    report.representation.stages[0]?.demographics || {}
                  ).map((group) => (
                    <th
                      key={group}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.representation.stages.map((stage, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {stage.stageName}
                    </td>
                    {Object.values(stage.demographics).map((percent, i) => (
                      <td key={i} className="px-4 py-3 text-sm text-gray-600">
                        {percent}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time to Hire */}
      {report.timeToHire && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Time to Hire by Demographic
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Overall average: {report.timeToHire.overallAverage} days
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {report.timeToHire.groups.map((group, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {group.group}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {group.averageDays} days
                    </div>
                    <div className="text-xs text-gray-500">
                      ({group.count} hires)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow border border-blue-200">
          <div className="px-6 py-4 border-b border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900">
              Recommendations
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-sm text-blue-900">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
