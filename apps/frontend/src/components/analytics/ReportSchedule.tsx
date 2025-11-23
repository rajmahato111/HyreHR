import React, { useState } from 'react';
import { Report, ReportScheduleFrequency } from '../../services/analytics';
import { Calendar, Clock, Mail, Edit, Trash2, Play, Pause } from 'lucide-react';

interface ReportScheduleProps {
  report: Report;
  onUpdate: (updates: Partial<Report>) => Promise<void>;
  onDelete: () => Promise<void>;
  onRunNow: () => Promise<void>;
}

export const ReportSchedule: React.FC<ReportScheduleProps> = ({
  report,
  onUpdate,
  onDelete,
  onRunNow,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scheduled, setScheduled] = useState(report.scheduled);
  const [frequency, setFrequency] = useState(report.scheduleFrequency || ReportScheduleFrequency.WEEKLY);
  const [recipients, setRecipients] = useState(report.recipients?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const recipientList = recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      await onUpdate({
        scheduled,
        scheduleFrequency: scheduled ? frequency : undefined,
        recipients: recipientList.length > 0 ? recipientList : undefined,
      });
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to update schedule: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSchedule = async () => {
    try {
      await onUpdate({ scheduled: !report.scheduled });
    } catch (err: any) {
      alert('Failed to toggle schedule: ' + err.message);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Schedule</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scheduled"
              checked={scheduled}
              onChange={(e) => setScheduled(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="scheduled" className="text-sm font-medium text-gray-700">
              Enable automatic scheduling
            </label>
          </div>

          {scheduled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as ReportScheduleFrequency)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ReportScheduleFrequency.DAILY}>Daily</option>
                  <option value={ReportScheduleFrequency.WEEKLY}>Weekly</option>
                  <option value={ReportScheduleFrequency.MONTHLY}>Monthly</option>
                  <option value={ReportScheduleFrequency.QUARTERLY}>Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients (comma-separated emails)
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Configuration</h3>
          {report.scheduled ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Calendar className="w-4 h-4" />
              <span>Active - Runs {report.scheduleFrequency}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Not scheduled</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRunNow}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Run Now"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={handleToggleSchedule}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            title={report.scheduled ? 'Pause Schedule' : 'Resume Schedule'}
          >
            {report.scheduled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            title="Edit Schedule"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {report.scheduled && (
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">Frequency:</span>
            <span className="font-medium text-gray-900">{report.scheduleFrequency}</span>
          </div>

          {report.recipients && report.recipients.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <span className="text-gray-700">Recipients:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {report.recipients.map((email, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
