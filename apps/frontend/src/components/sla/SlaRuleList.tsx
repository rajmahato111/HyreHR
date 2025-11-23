import React, { useState, useEffect } from 'react';
import { SlaRule } from '../../types/sla';
import { slaService } from '../../services/sla';

interface SlaRuleListProps {
  onEdit: (rule: SlaRule) => void;
  refreshTrigger?: number;
}

export const SlaRuleList: React.FC<SlaRuleListProps> = ({ onEdit, refreshTrigger }) => {
  const [rules, setRules] = useState<SlaRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadRules();
  }, [filter, refreshTrigger]);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await slaService.findAllRules({
        active: filter === 'active' ? true : filter === 'inactive' ? false : undefined,
      });
      setRules(data);
    } catch (error) {
      console.error('Failed to load SLA rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rule: SlaRule) => {
    if (!confirm(`Are you sure you want to delete "${rule.name}"?`)) {
      return;
    }

    try {
      await slaService.deleteRule(rule.id);
      loadRules();
    } catch (error) {
      console.error('Failed to delete SLA rule:', error);
      alert('Failed to delete SLA rule');
    }
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
        <div className="text-gray-500">Loading SLA rules...</div>
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

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No SLA rules found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {rule.description && (
                    <p className="mt-1 text-sm text-gray-600">{rule.description}</p>
                  )}

                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      <span className="font-medium">Type:</span>{' '}
                      {getRuleTypeLabel(rule.type)}
                    </span>
                    <span>
                      <span className="font-medium">Threshold:</span> {rule.thresholdHours}h
                    </span>
                    {rule.escalationHours && (
                      <span>
                        <span className="font-medium">Escalation:</span>{' '}
                        {rule.escalationHours}h
                      </span>
                    )}
                    <span>
                      <span className="font-medium">Recipients:</span>{' '}
                      {rule.alertRecipients.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(rule)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rule)}
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
