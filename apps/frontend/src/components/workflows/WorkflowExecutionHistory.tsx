import React, { useState, useEffect } from 'react';
import { WorkflowExecution, WorkflowExecutionStatus } from '../../types/workflow';
import { workflowsService } from '../../services/workflows';

interface WorkflowExecutionHistoryProps {
  workflowId: string;
  workflowName: string;
  onClose: () => void;
}

export const WorkflowExecutionHistory: React.FC<WorkflowExecutionHistoryProps> = ({
  workflowId,
  workflowName,
  onClose,
}) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);

  useEffect(() => {
    loadExecutions();
  }, [workflowId, page]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const data = await workflowsService.getExecutions(workflowId, page, 20);
      setExecutions(data.executions);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: WorkflowExecutionStatus) => {
    switch (status) {
      case WorkflowExecutionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case WorkflowExecutionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case WorkflowExecutionStatus.RUNNING:
        return 'bg-blue-100 text-blue-800';
      case WorkflowExecutionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case WorkflowExecutionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getDuration = (execution: WorkflowExecution) => {
    if (!execution.startedAt || !execution.completedAt) return 'N/A';
    const start = new Date(execution.startedAt).getTime();
    const end = new Date(execution.completedAt).getTime();
    const seconds = Math.round((end - start) / 1000);
    return `${seconds}s`;
  };

  if (selectedExecution) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Execution Details</h3>
              <button
                onClick={() => setSelectedExecution(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    selectedExecution.status
                  )}`}
                >
                  {selectedExecution.status}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Entity:</span>
                <span className="ml-2 text-sm">
                  {selectedExecution.entityType} ({selectedExecution.entityId})
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Started:</span>
                <span className="ml-2 text-sm">
                  {selectedExecution.startedAt
                    ? formatDate(selectedExecution.startedAt)
                    : 'Not started'}
                </span>
              </div>

              {selectedExecution.completedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Completed:</span>
                  <span className="ml-2 text-sm">
                    {formatDate(selectedExecution.completedAt)}
                  </span>
                </div>
              )}

              {selectedExecution.error && (
                <div>
                  <span className="text-sm font-medium text-red-600">Error:</span>
                  <pre className="mt-1 p-3 bg-red-50 text-red-800 text-sm rounded overflow-x-auto">
                    {selectedExecution.error}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Execution Steps:</h4>
                <div className="space-y-2">
                  {selectedExecution.steps.map((step, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-md bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{step.actionType}</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            step.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : step.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {step.status}
                        </span>
                      </div>
                      {step.error && (
                        <p className="text-xs text-red-600 mt-1">{step.error}</p>
                      )}
                      {step.result && (
                        <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                          {JSON.stringify(step.result, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Trigger Data:</h4>
                <pre className="p-3 bg-gray-50 text-sm rounded overflow-x-auto">
                  {JSON.stringify(selectedExecution.triggerData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              Execution History: {workflowName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading executions...</div>
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No executions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedExecution(execution)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            execution.status
                          )}`}
                        >
                          {execution.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {execution.entityType}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(execution.createdAt)}</span>
                        {execution.completedAt && (
                          <span>Duration: {getDuration(execution)}</span>
                        )}
                        <span>Steps: {execution.steps.length}</span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
