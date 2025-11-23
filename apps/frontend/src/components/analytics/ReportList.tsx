import React, { useEffect, useState } from 'react';
import { analyticsService, Report, ReportFormat } from '../../services/analytics';
import { FileText, Download, Edit, Trash2, Calendar, Play } from 'lucide-react';

interface ReportListProps {
  onEdit: (report: Report) => void;
  onGenerate: (report: Report) => void;
}

export const ReportList: React.FC<ReportListProps> = ({ onEdit, onGenerate }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.listReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await analyticsService.deleteReport(id);
      setReports(reports.filter(r => r.id !== id));
    } catch (err: any) {
      alert('Failed to delete report: ' + err.message);
    }
  };

  const handleExport = async (report: Report, format: ReportFormat) => {
    try {
      setExportingId(report.id);
      const blob = await analyticsService.exportReport(report.id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export report: ' + err.message);
    } finally {
      setExportingId(null);
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
          onClick={loadReports}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
        <p className="text-gray-600 mb-4">
          Create your first custom report to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                {report.scheduled && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Scheduled
                  </span>
                )}
              </div>
              {report.description && (
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Data Source: {report.definition.dataSource}</span>
                <span>Columns: {report.definition.columns.length}</span>
                {report.definition.filters && (
                  <span>Filters: {report.definition.filters.length}</span>
                )}
                {report.scheduled && report.scheduleFrequency && (
                  <span>Frequency: {report.scheduleFrequency}</span>
                )}
              </div>
              {report.recipients && report.recipients.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Recipients: {report.recipients.join(', ')}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onGenerate(report)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Generate Report"
              >
                <Play className="w-5 h-5" />
              </button>
              <div className="relative group">
                <button
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  title="Export Report"
                  disabled={exportingId === report.id}
                >
                  {exportingId === report.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <button
                    onClick={() => handleExport(report, ReportFormat.CSV)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExport(report, ReportFormat.EXCEL)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => handleExport(report, ReportFormat.PDF)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <button
                onClick={() => onEdit(report)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                title="Edit Report"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(report.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title="Delete Report"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
