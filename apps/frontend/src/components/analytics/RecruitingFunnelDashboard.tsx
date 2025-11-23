import React, { useEffect, useState } from 'react';
import { analyticsService, DashboardType, DashboardFilters, Dashboard } from '../../services/analytics';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RecruitingFunnelDashboardProps {
  filters?: DashboardFilters;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const RecruitingFunnelDashboard: React.FC<RecruitingFunnelDashboardProps> = ({ filters }) => {
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
      const data = await analyticsService.getDashboard(DashboardType.RECRUITING_FUNNEL, filters);
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

  const funnelWidget = dashboard.widgets.find(w => w.type === 'funnel');
  const conversionWidget = dashboard.widgets.find(w => w.type === 'conversion_rates');
  const dropOffWidget = dashboard.widgets.find(w => w.type === 'drop_off_analysis');

  const funnelData = funnelWidget?.data ? [
    { stage: 'Applications', count: funnelWidget.data.totalApplications },
    { stage: 'Screening', count: funnelWidget.data.screeningPassed },
    { stage: 'Interviews', count: funnelWidget.data.interviewsScheduled },
    { stage: 'Completed', count: funnelWidget.data.interviewsCompleted },
    { stage: 'Offers', count: funnelWidget.data.offersExtended },
    { stage: 'Accepted', count: funnelWidget.data.offersAccepted },
  ] : [];

  const conversionData = conversionWidget?.data ? [
    { stage: 'App → Screen', rate: conversionWidget.data.applicationToScreening },
    { stage: 'Screen → Interview', rate: conversionWidget.data.screeningToInterview },
    { stage: 'Interview → Offer', rate: conversionWidget.data.interviewToOffer },
    { stage: 'Offer → Accept', rate: conversionWidget.data.offerToAcceptance },
  ] : [];

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
      {funnelWidget && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title="Total Applications"
            value={funnelWidget.data.totalApplications}
            color="blue"
          />
          <MetricCard
            title="Screening Passed"
            value={funnelWidget.data.screeningPassed}
            color="green"
          />
          <MetricCard
            title="Interviews"
            value={funnelWidget.data.interviewsScheduled}
            color="yellow"
          />
          <MetricCard
            title="Completed"
            value={funnelWidget.data.interviewsCompleted}
            color="purple"
          />
          <MetricCard
            title="Offers"
            value={funnelWidget.data.offersExtended}
            color="pink"
          />
          <MetricCard
            title="Accepted"
            value={funnelWidget.data.offersAccepted}
            color="indigo"
          />
        </div>
      )}

      {/* Funnel Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruiting Funnel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Rates */}
      {conversionData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Conversion Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} name="Conversion Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Drop-off Analysis */}
      {dropOffWidget?.data && dropOffWidget.data.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Drop-off Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dropOffWidget.data}
                  dataKey="count"
                  nameKey="stage"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.stage}: ${entry.percentage}%`}
                >
                  {dropOffWidget.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {dropOffWidget.data.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900">{item.stage}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{item.count}</div>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overall Conversion */}
      {conversionWidget?.data && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Overall Conversion Rate</h3>
          <div className="text-4xl font-bold">
            {conversionWidget.data.overallConversion.toFixed(1)}%
          </div>
          <p className="text-blue-100 mt-2">
            From application to accepted offer
          </p>
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="text-3xl font-bold mt-2">{value.toLocaleString()}</div>
    </div>
  );
};
