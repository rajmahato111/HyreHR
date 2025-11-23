import React, { useState, useEffect } from 'react';
import {
  Workflow,
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowConditionOperator,
  WorkflowAction,
  WorkflowCondition,
} from '../../types/workflow';

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave: (data: CreateWorkflowDto | UpdateWorkflowDto) => Promise<void>;
  onCancel: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>(
    workflow?.triggerType || WorkflowTriggerType.APPLICATION_CREATED
  );
  const [conditions, setConditions] = useState<WorkflowCondition[]>(
    workflow?.conditions || []
  );
  const [actions, setActions] = useState<WorkflowAction[]>(
    workflow?.actions || [{ type: WorkflowActionType.SEND_EMAIL, config: {} }]
  );
  const [active, setActive] = useState(workflow?.active ?? true);
  const [loading, setLoading] = useState(false);

  const triggerTypeLabels: Record<WorkflowTriggerType, string> = {
    [WorkflowTriggerType.APPLICATION_CREATED]: 'Application Created',
    [WorkflowTriggerType.APPLICATION_STAGE_CHANGED]: 'Application Stage Changed',
    [WorkflowTriggerType.INTERVIEW_COMPLETED]: 'Interview Completed',
    [WorkflowTriggerType.INTERVIEW_FEEDBACK_SUBMITTED]: 'Interview Feedback Submitted',
    [WorkflowTriggerType.OFFER_SENT]: 'Offer Sent',
    [WorkflowTriggerType.OFFER_ACCEPTED]: 'Offer Accepted',
    [WorkflowTriggerType.OFFER_DECLINED]: 'Offer Declined',
    [WorkflowTriggerType.CANDIDATE_CREATED]: 'Candidate Created',
    [WorkflowTriggerType.JOB_OPENED]: 'Job Opened',
    [WorkflowTriggerType.JOB_CLOSED]: 'Job Closed',
  };

  const actionTypeLabels: Record<WorkflowActionType, string> = {
    [WorkflowActionType.SEND_EMAIL]: 'Send Email',
    [WorkflowActionType.MOVE_TO_STAGE]: 'Move to Stage',
    [WorkflowActionType.SEND_NOTIFICATION]: 'Send Notification',
    [WorkflowActionType.CREATE_TASK]: 'Create Task',
    [WorkflowActionType.UPDATE_FIELD]: 'Update Field',
    [WorkflowActionType.ASSIGN_USER]: 'Assign User',
    [WorkflowActionType.ADD_TAG]: 'Add Tag',
    [WorkflowActionType.REMOVE_TAG]: 'Remove Tag',
  };

  const operatorLabels: Record<WorkflowConditionOperator, string> = {
    [WorkflowConditionOperator.EQUALS]: 'Equals',
    [WorkflowConditionOperator.NOT_EQUALS]: 'Not Equals',
    [WorkflowConditionOperator.CONTAINS]: 'Contains',
    [WorkflowConditionOperator.NOT_CONTAINS]: 'Does Not Contain',
    [WorkflowConditionOperator.GREATER_THAN]: 'Greater Than',
    [WorkflowConditionOperator.LESS_THAN]: 'Less Than',
    [WorkflowConditionOperator.IN]: 'In',
    [WorkflowConditionOperator.NOT_IN]: 'Not In',
    [WorkflowConditionOperator.IS_EMPTY]: 'Is Empty',
    [WorkflowConditionOperator.IS_NOT_EMPTY]: 'Is Not Empty',
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: '',
        operator: WorkflowConditionOperator.EQUALS,
        value: '',
        logicalOperator: conditions.length > 0 ? 'AND' : undefined,
      },
    ]);
  };

  const updateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addAction = () => {
    setActions([
      ...actions,
      { type: WorkflowActionType.SEND_EMAIL, config: {} },
    ]);
  };

  const updateAction = (index: number, updates: Partial<WorkflowAction>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    setActions(newActions);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: CreateWorkflowDto | UpdateWorkflowDto = {
        name,
        description,
        triggerType,
        conditions,
        actions,
        active,
      };

      await onSave(data);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        {workflow ? 'Edit Workflow' : 'Create Workflow'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workflow Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Trigger */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Event *
          </label>
          <select
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as WorkflowTriggerType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(triggerTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Conditions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Conditions (Optional)
            </label>
            <button
              type="button"
              onClick={addCondition}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Condition
            </button>
          </div>

          {conditions.map((condition, index) => (
            <div key={index} className="mb-3 p-4 border border-gray-200 rounded-md">
              {index > 0 && (
                <div className="mb-2">
                  <select
                    value={condition.logicalOperator || 'AND'}
                    onChange={(e) =>
                      updateCondition(index, {
                        logicalOperator: e.target.value as 'AND' | 'OR',
                      })
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Field name"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  className="col-span-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />

                <select
                  value={condition.operator}
                  onChange={(e) =>
                    updateCondition(index, {
                      operator: e.target.value as WorkflowConditionOperator,
                    })
                  }
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Object.entries(operatorLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Value"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  className="col-span-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />

                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="col-span-1 text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Actions *
            </label>
            <button
              type="button"
              onClick={addAction}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Action
            </button>
          </div>

          {actions.map((action, index) => (
            <div key={index} className="mb-3 p-4 border border-gray-200 rounded-md">
              <div className="grid grid-cols-12 gap-2 mb-2">
                <select
                  value={action.type}
                  onChange={(e) =>
                    updateAction(index, { type: e.target.value as WorkflowActionType })
                  }
                  className="col-span-5 px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Object.entries(actionTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Delay (minutes)"
                  value={action.delayMinutes || ''}
                  onChange={(e) =>
                    updateAction(index, {
                      delayMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />

                <button
                  type="button"
                  onClick={() => removeAction(index)}
                  className="col-span-1 text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>

              <textarea
                placeholder="Action configuration (JSON)"
                value={JSON.stringify(action.config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    updateAction(index, { config });
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              />
            </div>
          ))}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 text-sm text-gray-700">
            Active (workflow will execute automatically)
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
          </button>
        </div>
      </form>
    </div>
  );
};
