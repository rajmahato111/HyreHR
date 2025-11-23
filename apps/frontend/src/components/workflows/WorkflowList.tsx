import React, { useState, useEffect } from 'react';
import { Workflow } from '../../types/workflow';
import { workflowsService } from '../../services/workflows';

interface WorkflowListProps {
  onEdit: (workflow: Workflow) => void;
  onViewExecutions: (workflow: Workflow) => void;
  refreshTrigger?: number;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  onEdit,
  onViewExecutions,
  refreshTrigger,
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadWorkflows();
  }, [filter, refreshTrigger]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowsService.findAll(
        filter === 'active' ? true : filter === 'inactive' ? false : undefined
      );
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      if (workflow.active) {
        await workflowsService.deactivate(workflow.id);
      } else {
        await workflowsService.activate(workflow.id);
      }
      loadWorkflows();
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      alert('Failed to update workflow status');
    }
  };

  const handleDelete = async (workflow: Workflow) => {
    if (!confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      return;
    }

    try {
      await workflowsService.remove(workflow.id);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow');
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    return triggerType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'active', 'inactive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Workflows List */}
      {workflows.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No workflows found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        workflow.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {workflow.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {workflow.description && (
                    <p className="mt-1 text-sm text-gray-600">{workflow.description}</p>
                  )}

                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      <span className="font-medium">Trigger:</span>{' '}
                      {getTriggerLabel(workflow.triggerType)}
                    </span>
                    <span>
                      <span className="font-medium">Actions:</span> {workflow.actions.length}
                    </span>
                    {workflow.conditions.length > 0 && (
                      <span>
                        <span className="font-medium">Conditions:</span>{' '}
                        {workflow.conditions.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onViewExecutions(workflow)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Executions
                  </button>
                  <button
                    onClick={() => handleToggleActive(workflow)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    {workflow.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => onEdit(workflow)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(workflow)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
