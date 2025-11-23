import React, { useState } from 'react';
import { ReportResult, ReportFormat, analyticsService } from '../../services/analytics';
import { Download, X } from 'lucide-react';

interface ReportViewerProps {
  result: ReportResult;
  onClose: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ result, onClose }) => {
  const [exportingFormat, setExportingFormat] = useState<ReportFormat | null>(null);

  const handleExport = async (format: ReportFormat) => {
    try {
      setExportingFormat(format);
      const blob = await analyticsService.exportReport(result.id, format, {
        startDate: result.metadata.period.startDate.toString(),
        endDate: result.metadata.period.endDate.toString(),
        ...result.metadata.filters,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.name}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export report: ' + err.message);
    } finally {
      setExportingFormat(null);
    }
  };

  const columns = result.data.length > 0 ? Object.keys(result.data[0]) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{result.name}</h2>
            {result.description && (
              <p className="text-sm text-gray-600 mt-1">{result.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>
                Period: {new Date(result.metadata.period.startDate).toLocaleDateString()} -{' '}
                {new Date(result.metadata.period.endDate).toLocaleDateString()}
              </span>
              <span>Total Rows: {result.metadata.totalRows}</span>
              <span>Generated: {new Date(result.metadata.generatedAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={exportingFormat !== null}
              >
                {exportingFormat ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                <button
                  onClick={() => handleExport(ReportFormat.CSV)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport(ReportFormat.EXCEL)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleExport(ReportFormat.PDF)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                >
                  PDF
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {result.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No data found for the selected criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {result.data.length} of {result.metadata.totalRows} rows
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  return String(value);
}
