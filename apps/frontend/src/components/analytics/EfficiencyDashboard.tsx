import React, { useEffect, useState } from 'react';
import { analyticsService, DashboardType, DashboardFilters, Dashboard } from '../../services/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Users, Calendar } from 'lucide-react';

interface EfficiencyDashboardProps {
  filters?: DashboardFilters;
}

export const EfficiencyDashboard: React.FC<EfficiencyDashboardProps> = ({ filters }) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [filters]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboard(DashboardType.EFFICIENCY, filters);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  const efficiencyWidget = dashboard.widgets.find(w => w.type === 'efficiency_metrics');
  const timeInStageWidget = dashboard.widgets.find(w => w.type === 'time_in_stage');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">{dashboard.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>
            Period: {new Date(dashboard.period.startDate).toLocaleDateString()} -{' '}
            {new Date(dashboard.period.endDate).toLocaleDateString()}
          </span>
          <span>Generated: {new Date(dashboard.generatedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      {efficiencyWidget && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EfficiencyMetricCard
            title="Avg Time to Fill"
            value={efficiencyWidget.data.averageTimeToFill}
            unit="days"
            icon={<Clock className="w-6 h-6" />}
            color="blue"
          />
          <EfficiencyMetricCard
            title="Avg Time to Hire"
            value={efficiencyWidget.data.averageTimeToHire}
            unit="days"
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <EfficiencyMetricCard
            title="Interviews per Hire"
            value={efficiencyWidget.data.interviewsPerHire}
            unit=""
            icon={<Users className="w-6 h-6" />}
            color="purple"
          />
          <EfficiencyMetricCard
            title="Response Time"
            value={efficiencyWidget.data.applicationResponseTime}
            unit="hours"
            icon={<Calendar className="w-6 h-6" />}
            color="orange"
          />
        </div>
      )}

      {/* Time in Stage Chart */}
      {timeInStageWidget?.data && timeInStageWidget.data.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Time in Each Stage</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={timeInStageWidget.data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="stage" width={150} />
              <Tooltip formatter={(value) => `${value} days`} />
              <Bar dataKey="averageDays" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Breakdown */}
      {timeInStageWidget?.data && timeInStageWidget.data.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Duration Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeInStageWidget.data.map((stage: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stage.stage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stage.averageDays.toFixed(1)} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          stage.averageDays < 3
                            ? 'bg-green-100 text-green-800'
                            : stage.averageDays < 7
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {stage.averageDays < 3 ? 'Fast' : stage.averageDays < 7 ? 'Normal' : 'Slow'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Efficiency Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {efficiencyWidget && (
            <>
              {efficiencyWidget.data.averageTimeToFill > 30 && (
                <li>• Time to fill is above industry average. Consider streamlining your process.</li>
              )}
              {efficiencyWidget.data.interviewsPerHire > 5 && (
                <li>• High number of interviews per hire. Review interview stages for efficiency.</li>
              )}
              {efficiencyWidget.data.applicationResponseTime > 48 && (
                <li>• Application response time is slow. Faster responses improve candidate experience.</li>
              )}
              {efficiencyWidget.data.averageTimeToFill <= 30 &&
                efficiencyWidget.data.interviewsPerHire <= 5 && (
                  <li>• Your hiring process is efficient! Keep up the good work.</li>
                )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

interface EfficiencyMetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const EfficiencyMetricCard: React.FC<EfficiencyMetricCardProps> = ({ title, value, unit, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium opacity-80">{title}</div>
        <div className="opacity-60">{icon}</div>
      </div>
      <div className="text-3xl font-bold">
        {value.toFixed(1)}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
    </div>
  );
};
