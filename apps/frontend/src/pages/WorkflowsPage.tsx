import React, { useState } from 'react';
import { WorkflowBuilder, WorkflowList, WorkflowExecutionHistory } from '../components/workflows';
import { Workflow, CreateWorkflowDto, UpdateWorkflowDto } from '../types/workflow';
import { workflowsService } from '../services/workflows';

export const WorkflowsPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'executions'>('list');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedWorkflow(null);
    setView('create');
  };

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setView('edit');
  };

  const handleViewExecutions = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setView('executions');
  };

  const handleSave = async (data: CreateWorkflowDto | UpdateWorkflowDto) => {
    try {
      if (view === 'edit' && selectedWorkflow) {
        await workflowsService.update(selectedWorkflow.id, data as UpdateWorkflowDto);
      } else {
        await workflowsService.create(data as CreateWorkflowDto);
      }
      setView('list');
      setSelectedWorkflow(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    setView('list');
    setSelectedWorkflow(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Automate your recruiting processes with custom workflows
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Workflow
              </button>
            </div>

            <WorkflowList
              onEdit={handleEdit}
              onViewExecutions={handleViewExecutions}
              refreshTrigger={refreshTrigger}
            />
          </>
        )}

        {(view === 'create' || view === 'edit') && (
          <WorkflowBuilder
            workflow={selectedWorkflow || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {view === 'executions' && selectedWorkflow && (
          <WorkflowExecutionHistory
            workflowId={selectedWorkflow.id}
            workflowName={selectedWorkflow.name}
            onClose={handleCancel}
          />
        )}
      </div>
    </div>
  );
};
