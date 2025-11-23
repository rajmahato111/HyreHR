import React, { useState } from 'react';
import { SlaRule, CreateSlaRuleDto, UpdateSlaRuleDto, SlaRuleType } from '../../types/sla';

interface SlaRuleFormProps {
  rule?: SlaRule;
  onSave: (data: CreateSlaRuleDto | UpdateSlaRuleDto) => Promise<void>;
  onCancel: () => void;
}

export const SlaRuleForm: React.FC<SlaRuleFormProps> = ({ rule, onSave, onCancel }) => {
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [type, setType] = useState<SlaRuleType>(
    rule?.type || SlaRuleType.TIME_TO_FIRST_REVIEW
  );
  const [thresholdHours, setThresholdHours] = useState(rule?.thresholdHours || 24);
  const [alertRecipients, setAlertRecipients] = useState(
    rule?.alertRecipients.join(', ') || ''
  );
  const [escalationRecipients, setEscalationRecipients] = useState(
    rule?.escalationRecipients.join(', ') || ''
  );
  const [escalationHours, setEscalationHours] = useState(rule?.escalationHours || 0);
  const [active, setActive] = useState(rule?.active ?? true);
  const [loading, setLoading] = useState(false);

  const ruleTypeLabels: Record<SlaRuleType, string> = {
    [SlaRuleType.TIME_TO_FIRST_REVIEW]: 'Time to First Review',
    [SlaRuleType.TIME_TO_SCHEDULE_INTERVIEW]: 'Time to Schedule Interview',
    [SlaRuleType.TIME_TO_PROVIDE_FEEDBACK]: 'Time to Provide Feedback',
    [SlaRuleType.TIME_TO_OFFER]: 'Time to Offer',
    [SlaRuleType.TIME_TO_HIRE]: 'Time to Hire',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: CreateSlaRuleDto | UpdateSlaRuleDto = {
        name,
        description,
        type,
        thresholdHours,
        alertRecipients: alertRecipients
          .split(',')
          .map((email) => email.trim())
          .filter((email) => email),
        escalationRecipients: escalationRecipients
          .split(',')
          .map((email) => email.trim())
          .filter((email) => email),
        escalationHours: escalationHours || undefined,
        active,
      };

      await onSave(data);
    } catch (error) {
      console.error('Failed to save SLA rule:', error);
      alert('Failed to save SLA rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        {rule ? 'Edit SLA Rule' : 'Create SLA Rule'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rule Name *
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rule Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SlaRuleType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(ruleTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Threshold (Hours) *
          </label>
          <input
            type="number"
            value={thresholdHours}
            onChange={(e) => setThresholdHours(parseInt(e.target.value))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Alert will be triggered if the activity exceeds this time
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alert Recipients (Email Addresses) *
          </label>
          <input
            type="text"
            value={alertRecipients}
            onChange={(e) => setAlertRecipients(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Comma-separated list of email addresses
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escalation Recipients (Optional)
          </label>
          <input
            type="text"
            value={escalationRecipients}
            onChange={(e) => setEscalationRecipients(e.target.value)}
            placeholder="manager@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escalation After (Hours)
          </label>
          <input
            type="number"
            value={escalationHours}
            onChange={(e) => setEscalationHours(parseInt(e.target.value))}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Additional hours after threshold before escalating (0 to disable)
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 text-sm text-gray-700">
            Active (rule will monitor and send alerts)
          </label>
        </div>

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
            {loading ? 'Saving...' : rule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>
  );
};
