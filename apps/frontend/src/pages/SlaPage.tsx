import React, { useState } from 'react';
import { SlaRuleForm, SlaRuleList, SlaComplianceDashboard } from '../components/sla';
import { SlaRule, CreateSlaRuleDto, UpdateSlaRuleDto } from '../types/sla';
import { slaService } from '../services/sla';

export const SlaPage: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'rules' | 'create' | 'edit'>('dashboard');
  const [selectedRule, setSelectedRule] = useState<SlaRule | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateRule = () => {
    setSelectedRule(null);
    setView('create');
  };

  const handleEditRule = (rule: SlaRule) => {
    setSelectedRule(rule);
    setView('edit');
  };

  const handleSaveRule = async (data: CreateSlaRuleDto | UpdateSlaRuleDto) => {
    try {
      if (view === 'edit' && selectedRule) {
        await slaService.updateRule(selectedRule.id, data as UpdateSlaRuleDto);
      } else {
        await slaService.createRule(data as CreateSlaRuleDto);
      }
      setView('rules');
      setSelectedRule(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    setView(view === 'create' || view === 'edit' ? 'rules' : 'dashboard');
    setSelectedRule(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SLA Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor and manage service level agreements for recruiting activities
            </p>
          </div>
          {view === 'rules' && (
            <button
              onClick={handleCreateRule}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create SLA Rule
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setView('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                view === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                view === 'rules' || view === 'create' || view === 'edit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rules
            </button>
          </nav>
        </div>

        {/* Content */}
        {view === 'dashboard' && <SlaComplianceDashboard />}

        {view === 'rules' && (
          <SlaRuleList onEdit={handleEditRule} refreshTrigger={refreshTrigger} />
        )}

        {(view === 'create' || view === 'edit') && (
          <SlaRuleForm
            rule={selectedRule || undefined}
            onSave={handleSaveRule}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};
