import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  rowCount?: number;
  error?: string;
  format: string;
  triggeredBy: 'manual' | 'scheduled';
}

interface ReportHistoryProps {
  reportId: string;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({ reportId }) => {
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [reportId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockExecutions: ReportExecution[] = [
        {
          id: '1',
          reportId,
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000),
          completedAt: new Date(Date.now() - 3500000),
          rowCount: 1234,
          format: 'csv',
          triggeredBy: 'manual',
        },
        {
          id: '2',
          reportId,
          status: 'completed',
          startedAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 86300000),
          rowCount: 1189,
          format: 'excel',
          triggeredBy: 'scheduled',
        },
        {
          id: '3',
          reportId,
          status: 'failed',
          startedAt: new Date(Date.now() - 172800000),
          completedAt: new Date(Date.now() - 172700000),
          error: 'Database connection timeout',
          format: 'pdf',
          triggeredBy: 'scheduled',
        },
      ];
      setExecutions(mockExecutions);
    } catch (err) {
      console.error('Failed to load report history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (execution: ReportExecution) => {
    // Implement download logic
    console.log('Download execution:', execution.id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution History</h3>
      
      {executions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No execution history yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Run this report to see execution history
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {executions.map((execution) => (
            <div
              key={execution.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                {execution.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {execution.status === 'failed' && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                {(execution.status === 'pending' || execution.status === 'running') && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}

                {/* Execution Details */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(execution.startedAt).toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        execution.triggeredBy === 'manual'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {execution.triggeredBy}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      {execution.format}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {execution.status === 'completed' && execution.rowCount && (
                      <span>{execution.rowCount.toLocaleString()} rows</span>
                    )}
                    {execution.status === 'failed' && execution.error && (
                      <span className="text-red-600">{execution.error}</span>
                    )}
                    {execution.status === 'running' && <span>In progress...</span>}
                    {execution.status === 'pending' && <span>Queued</span>}
                  </div>
                  {execution.completedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Duration:{' '}
                      {Math.round(
                        (new Date(execution.completedAt).getTime() -
                          new Date(execution.startedAt).getTime()) /
                          1000
                      )}
                      s
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {execution.status === 'completed' && (
                <button
                  onClick={() => handleDownload(execution)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {executions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={loadHistory}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh History
          </button>
        </div>
      )}
    </div>
  );
};
