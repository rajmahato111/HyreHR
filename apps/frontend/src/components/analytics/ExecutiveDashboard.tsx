import React, { useEffect, useState } from 'react';
import { analyticsService, DashboardType, DashboardFilters, Dashboard } from '../../services/analytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, Target } from 'lucide-react';

interface ExecutiveDashboardProps {
  filters?: DashboardFilters;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ filters }) => {
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
      const data = await analyticsService.getDashboard(DashboardType.EXECUTIVE_SUMMARY, filters);
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

  const summaryWidget = dashboard.widgets.find(w => w.type === 'executive_summary');
  const trendsWidget = dashboard.widgets.find(w => w.type === 'hiring_trends');
  const departmentWidget = dashboard.widgets.find(w => w.type === 'department_performance');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow p-6 text-white">
        <h2 className="text-2xl font-bold">Executive Summary</h2>
        <p className="text-blue-100 mt-1">Key recruiting metrics at a glance</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
          <span>
            Period: {new Date(dashboard.period.startDate).toLocaleDateString()} -{' '}
            {new Date(dashboard.period.endDate).toLocaleDateString()}
          </span>
          <span>Generated: {new Date(dashboard.generatedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Key Performance Indicators */}
      {summaryWidget && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard
            title="Total Hires"
            value={summaryWidget.data.totalHires}
            change={summaryWidget.data.hiresChange}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <KPICard
            title="Time to Fill"
            value={`${summaryWidget.data.avgTimeToFill} days`}
            change={summaryWidget.data.timeToFillChange}
            icon={<Clock className="w-6 h-6" />}
            color="green"
            inverse
          />
          <KPICard
            title="Offer Acceptance"
            value={`${summaryWidget.data.offerAcceptanceRate}%`}
            change={summaryWidget.data.offerAcceptanceChange}
            icon={<Target className="w-6 h-6" />}
            color="purple"
          />
          <KPICard
            title="Active Openings"
            value={summaryWidget.data.activeOpenings}
            change={summaryWidget.data.openingsChange}
            icon={<TrendingUp className="w-6 h-6" />}
            color="orange"
          />
          <KPICard
            title="Pipeline Size"
            value={summaryWidget.data.pipelineSize}
            change={summaryWidget.data.pipelineSizeChange}
            icon={<Users className="w-6 h-6" />}
            color="pink"
          />
          <KPICard
            title="Cost per Hire"
            value={`$${summaryWidget.data.costPerHire.toLocaleString()}`}
            change={summaryWidget.data.costPerHireChange}
            icon={<DollarSign className="w-6 h-6" />}
            color="indigo"
            inverse
          />
        </div>
      )}

      {/* Hiring Trends */}
      {trendsWidget?.data && trendsWidget.data.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsWidget.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="hires"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Hires"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="applications"
                stroke="#10b981"
                strokeWidth={2}
                name="Applications"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="timeToFill"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Time to Fill (days)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Department Performance */}
      {departmentWidget?.data && departmentWidget.data.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentWidget.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hires" fill="#3b82f6" name="Hires" />
              <Bar dataKey="openings" fill="#10b981" name="Open Positions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Department Details Table */}
      {departmentWidget?.data && departmentWidget.data.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Positions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time to Fill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fill Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentWidget.data.map((dept: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.hires}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.openings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.avgTimeToFill} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${dept.fillRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{dept.fillRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Key Insights */}
      {summaryWidget && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Strengths</h3>
            <ul className="space-y-2 text-sm text-green-800">
              {summaryWidget.data.offerAcceptanceRate > 80 && (
                <li>• High offer acceptance rate indicates strong employer brand</li>
              )}
              {summaryWidget.data.avgTimeToFill < 30 && (
                <li>• Efficient hiring process with quick time to fill</li>
              )}
              {summaryWidget.data.hiresChange > 0 && (
                <li>• Growing team with increased hiring velocity</li>
              )}
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Areas for Improvement</h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              {summaryWidget.data.offerAcceptanceRate < 70 && (
                <li>• Offer acceptance rate below target - review compensation and benefits</li>
              )}
              {summaryWidget.data.avgTimeToFill > 45 && (
                <li>• Time to fill is high - consider streamlining interview process</li>
              )}
              {summaryWidget.data.costPerHire > 5000 && (
                <li>• Cost per hire is elevated - optimize sourcing channels</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  inverse?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color, inverse = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const isPositive = inverse ? change < 0 : change > 0;
  const changeColor = isPositive ? 'text-green-600' : change === 0 ? 'text-gray-600' : 'text-red-600';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium opacity-80">{title}</div>
        <div className="opacity-60">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      {change !== 0 && (
        <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
          <ChangeIcon className="w-4 h-4" />
          <span>{Math.abs(change)}% vs last period</span>
        </div>
      )}
    </div>
  );
};
