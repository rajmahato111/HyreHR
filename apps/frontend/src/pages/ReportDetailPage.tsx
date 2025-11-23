import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsService, Report, ReportFormat } from '../services/analytics';
import { ReportSchedule } from '../components/analytics/ReportSchedule';
import { ReportHistory } from '../components/analytics/ReportHistory';
import { ArrowLeft, Play, Edit, Trash2, Download } from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getReport(id);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<Report>) => {
    if (!id) return;

    await analyticsService.updateReport(id, updates);
    await loadReport();
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await analyticsService.deleteReport(id);
      navigate('/reports');
    } catch (err: any) {
      alert('Failed to delete report: ' + err.message);
    }
  };

  const handleRunNow = async () => {
    if (!id) return;

    try {
      setGenerating(true);
      const result = await analyticsService.generateReport(id, ReportFormat.JSON);
      alert(`Report generated successfully with ${result.metadata.totalRows} rows`);
      // Refresh history
      window.location.reload();
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format: ReportFormat) => {
    if (!id) return;

    try {
      const blob = await analyticsService.exportReport(id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.name || 'report'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export report: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/reports')}
            className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Reports
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{report.name}</h1>
              {report.description && (
                <p className="text-gray-600 mt-2">{report.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>Data Source: {report.definition.dataSource}</span>
                <span>Columns: {report.definition.columns.length}</span>
                {report.definition.filters && (
                  <span>Filters: {report.definition.filters.length}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunNow}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Play className="w-5 h-5" />
                )}
                Run Now
              </button>
              <div className="relative group">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Download className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <button
                    onClick={() => handleExport(ReportFormat.CSV)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport(ReportFormat.EXCEL)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => handleExport(ReportFormat.PDF)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <button
                onClick={() => navigate(`/reports/${id}/edit`)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule Configuration */}
          <div>
            <ReportSchedule
              report={report}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onRunNow={handleRunNow}
            />
          </div>

          {/* Report Definition */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Definition</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Columns</h4>
                <div className="flex flex-wrap gap-2">
                  {report.definition.columns.map((col, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {col.label}
                    </span>
                  ))}
                </div>
              </div>

              {report.definition.filters && report.definition.filters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Filters</h4>
                  <div className="space-y-2">
                    {report.definition.filters.map((filter, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                      >
                        {filter.field} {filter.operator} {String(filter.value)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.definition.groupBy && report.definition.groupBy.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Group By</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.definition.groupBy.map((field, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.definition.aggregations && report.definition.aggregations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Aggregations</h4>
                  <div className="space-y-2">
                    {report.definition.aggregations.map((agg, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                      >
                        {agg.function}({agg.field}) as {agg.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Execution History */}
        <div className="mt-6">
          <ReportHistory reportId={report.id} />
        </div>
      </div>
    </div>
  );
};
