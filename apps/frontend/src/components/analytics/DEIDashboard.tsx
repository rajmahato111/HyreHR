import React, { useEffect, useState } from 'react';
import { analyticsService, DashboardType, DashboardFilters, Dashboard } from '../../services/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, AlertCircle } from 'lucide-react';

interface DEIDashboardProps {
  filters?: DashboardFilters;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const DEIDashboard: React.FC<DEIDashboardProps> = ({ filters }) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('gender');

  useEffect(() => {
    loadDashboard();
  }, [filters]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboard(DashboardType.DEI, filters);
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

  const demographicWidget = dashboard.widgets.find(w => w.type === 'demographic_breakdown');
  const passRatesWidget = dashboard.widgets.find(w => w.type === 'stage_pass_rates');
  const hiringWidget = dashboard.widgets.find(w => w.type === 'hiring_diversity');

  const categories: string[] = demographicWidget?.data
    ? Array.from(new Set(demographicWidget.data.map((d: any) => d.category)))
    : [];

  const selectedDemographics = demographicWidget?.data?.filter(
    (d: any) => d.category === selectedCategory
  ) || [];

  const selectedPassRates = passRatesWidget?.data?.find(
    (s: any) => s.stage === 'Overall'
  )?.demographics.filter((d: any) => d.category === selectedCategory) || [];

  const selectedHiring = hiringWidget?.data?.filter(
    (h: any) => h.category === selectedCategory
  ) || [];

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

      {/* Category Selector */}
      {categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Demographic Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Demographic Breakdown */}
      {selectedDemographics.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Distribution
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={selectedDemographics}
                  dataKey="count"
                  nameKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.value}: ${entry.percentage}%`}
                >
                  {selectedDemographics.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {selectedDemographics.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-900">{item.value}</span>
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

      {/* Pass Rates by Demographics */}
      {selectedPassRates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pass Rates by {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={selectedPassRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="value" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="passRate" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hiring Diversity */}
      {selectedHiring.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Hiring Diversity - {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedHiring.map((item: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.value}</span>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{item.hireCount}</div>
                <div className="text-sm text-gray-600 mt-1">{item.percentage}% of hires</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disparity Alerts */}
      {passRatesWidget?.data && (
        <DisparityAlerts passRatesData={passRatesWidget.data} />
      )}

      {/* Compliance Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">EEOC Compliance Note</h3>
            <p className="text-sm text-yellow-800">
              All demographic data is collected voluntarily and stored in compliance with EEOC regulations.
              This data is used solely for diversity analytics and is not used in hiring decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DisparityAlertsProps {
  passRatesData: any[];
}

const DisparityAlerts: React.FC<DisparityAlertsProps> = ({ passRatesData }) => {
  const alerts: { stage: string; message: string; severity: 'warning' | 'error' }[] = [];

  passRatesData.forEach((stage) => {
    const rates = stage.demographics.map((d: any) => d.passRate);
    const avgRate = rates.reduce((a: number, b: number) => a + b, 0) / rates.length;

    stage.demographics.forEach((demo: any) => {
      const diff = Math.abs(demo.passRate - avgRate);
      if (diff > 15) {
        alerts.push({
          stage: stage.stage,
          message: `${demo.category} - ${demo.value} has ${demo.passRate}% pass rate vs ${avgRate.toFixed(1)}% average (${diff.toFixed(1)}% difference)`,
          severity: diff > 25 ? 'error' : 'warning',
        });
      }
    });
  });

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 mb-1">No Significant Disparities Detected</h3>
            <p className="text-sm text-green-800">
              Pass rates across demographic groups are within acceptable ranges. Continue monitoring for changes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Disparity Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${alert.severity === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
              }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 mt-0.5 ${alert.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`}
              />
              <div>
                <div
                  className={`text-sm font-semibold mb-1 ${alert.severity === 'error' ? 'text-red-900' : 'text-yellow-900'
                    }`}
                >
                  {alert.stage}
                </div>
                <div
                  className={`text-sm ${alert.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                    }`}
                >
                  {alert.message}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
