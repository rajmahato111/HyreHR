import React, { useState } from 'react';
import { RecruitingFunnelDashboard, EfficiencyDashboard, DEIDashboard, ExecutiveDashboard } from '../components/analytics';
import { DashboardType, DashboardFilters, TimeRange } from '../services/analytics';
import { Calendar, Filter } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardType>(DashboardType.EXECUTIVE_SUMMARY);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.LAST_30_DAYS);

  const dashboards = [
    { type: DashboardType.EXECUTIVE_SUMMARY, label: 'Executive Summary', icon: '📊' },
    { type: DashboardType.RECRUITING_FUNNEL, label: 'Recruiting Funnel', icon: '🔄' },
    { type: DashboardType.EFFICIENCY, label: 'Efficiency Metrics', icon: '⚡' },
    { type: DashboardType.DEI, label: 'DEI Analytics', icon: '🌈' },
  ];

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case TimeRange.LAST_7_DAYS:
        startDate.setDate(now.getDate() - 7);
        break;
      case TimeRange.LAST_30_DAYS:
        startDate.setDate(now.getDate() - 30);
        break;
      case TimeRange.LAST_90_DAYS:
        startDate.setDate(now.getDate() - 90);
        break;
      case TimeRange.LAST_6_MONTHS:
        startDate.setMonth(now.getMonth() - 6);
        break;
      case TimeRange.LAST_YEAR:
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        break;
    }

    if (range !== TimeRange.CUSTOM) {
      setFilters({
        ...filters,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      });
    }
  };

  const renderDashboard = () => {
    switch (selectedDashboard) {
      case DashboardType.EXECUTIVE_SUMMARY:
        return <ExecutiveDashboard filters={filters} />;
      case DashboardType.RECRUITING_FUNNEL:
        return <RecruitingFunnelDashboard filters={filters} />;
      case DashboardType.EFFICIENCY:
        return <EfficiencyDashboard filters={filters} />;
      case DashboardType.DEI:
        return <DEIDashboard filters={filters} />;
      default:
        return <ExecutiveDashboard filters={filters} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track and analyze your recruiting performance with comprehensive dashboards
          </p>
        </div>

        {/* Dashboard Selector */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {dashboards.map((dashboard) => (
                <button
                  key={dashboard.type}
                  onClick={() => setSelectedDashboard(dashboard.type)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    selectedDashboard === dashboard.type
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{dashboard.icon}</span>
                  {dashboard.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters Bar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={TimeRange.LAST_7_DAYS}>Last 7 Days</option>
                  <option value={TimeRange.LAST_30_DAYS}>Last 30 Days</option>
                  <option value={TimeRange.LAST_90_DAYS}>Last 90 Days</option>
                  <option value={TimeRange.LAST_6_MONTHS}>Last 6 Months</option>
                  <option value={TimeRange.LAST_YEAR}>Last Year</option>
                  <option value={TimeRange.CUSTOM}>Custom Range</option>
                </select>
              </div>

              {/* Custom Date Range */}
              {timeRange === TimeRange.CUSTOM && (
                <>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}

              {/* Additional Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>

              {/* Clear Filters */}
              {(filters.jobId || filters.departmentId || filters.locationIds?.length) && (
                <button
                  onClick={() => setFilters({ startDate: filters.startDate, endDate: filters.endDate })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Additional Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by job..."
                    value={filters.jobId || ''}
                    onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by department..."
                    value={filters.departmentId || ''}
                    onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div>{renderDashboard()}</div>
      </div>
    </div>
  );
};
