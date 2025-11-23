import React, { useState, useEffect } from 'react';
import { SlaComplianceMetrics, SlaViolation, SlaViolationStatus } from '../../types/sla';
import { slaService } from '../../services/sla';

export const SlaComplianceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SlaComplianceMetrics | null>(null);
  const [violations, setViolations] = useState<SlaViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [violationFilter, setViolationFilter] = useState<'all' | 'open' | 'acknowledged'>(
    'open'
  );

  useEffect(() => {
    loadData();
  }, [dateRange, violationFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();

      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const [metricsData, violationsData] = await Promise.all([
        slaService.getComplianceMetrics(
          startDate.toISOString(),
          endDate.toISOString()
        ),
        slaService.findAllViolations({
          status: violationFilter === 'all' ? undefined : violationFilter,
        }),
      ]);

      setMetrics(metricsData);
      setViolations(violationsData);
    } catch (error) {
      console.error('Failed to load SLA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (violationId: string) => {
    try {
      await slaService.acknowledgeViolation(violationId);
      loadData();
    } catch (error) {
      console.error('Failed to acknowledge violation:', error);
      alert('Failed to acknowledge violation');
    }
  };

  const handleResolve = async (violationId: string) => {
    const notes = prompt('Enter resolution notes (optional):');
    try {
      await slaService.resolveViolation(violationId, notes || undefined);
      loadData();
    } catch (error) {
      console.error('Failed to resolve violation:', error);
      alert('Failed to resolve violation');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getRuleTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading SLA dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SLA Compliance Dashboard</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Activities</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {metrics.totalActivities}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Compliant</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {metrics.compliantActivities}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Violations</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {metrics.violatedActivities}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Compliance Rate</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {metrics.complianceRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Compliance by Rule Type */}
      {metrics && Object.keys(metrics.byRuleType).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance by Rule Type</h3>
          <div className="space-y-4">
            {Object.entries(metrics.byRuleType).map(([type, data]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getRuleTypeLabel(type)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {data.compliant} / {data.total} ({data.complianceRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${data.complianceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Violations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">SLA Violations</h3>
            <div className="flex space-x-2">
              {(['all', 'open', 'acknowledged'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setViolationFilter(filter)}
                  className={`px-3 py-1 text-sm rounded ${
                    violationFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {violations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No violations found
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            violation.status === SlaViolationStatus.OPEN
                              ? 'bg-red-100 text-red-800'
                              : violation.status === SlaViolationStatus.ACKNOWLEDGED
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {violation.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {violation.rule?.name || 'Unknown Rule'}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Entity:</span> {violation.entityType}{' '}
                        ({violation.entityId})
                      </div>

                      <div className="mt-1 text-sm text-gray-500">
                        Violated: {formatDate(violation.violatedAt)}
                      </div>

                      {violation.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {violation.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {violation.status === SlaViolationStatus.OPEN && (
                        <>
                          <button
                            onClick={() => handleAcknowledge(violation.id)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleResolve(violation.id)}
                            className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      {violation.status === SlaViolationStatus.ACKNOWLEDGED && (
                        <button
                          onClick={() => handleResolve(violation.id)}
                          className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
