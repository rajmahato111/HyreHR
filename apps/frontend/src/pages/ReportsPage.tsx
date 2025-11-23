import React, { useState } from 'react';
import { ReportBuilder } from '../components/analytics/ReportBuilder';
import { ReportList } from '../components/analytics/ReportList';
import { ReportViewer } from '../components/analytics/ReportViewer';
import { analyticsService, Report, ReportDefinition, ReportResult, ReportFormat, ReportScheduleFrequency } from '../services/analytics';
import { Plus, ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export const ReportsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<ReportScheduleFrequency>(ReportScheduleFrequency.WEEKLY);
  const [recipients, setRecipients] = useState<string>('');

  const handleCreateNew = () => {
    setSelectedReport(null);
    setReportName('');
    setReportDescription('');
    setScheduled(false);
    setScheduleFrequency(ReportScheduleFrequency.WEEKLY);
    setRecipients('');
    setViewMode('create');
  };

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setReportName(report.name);
    setReportDescription(report.description || '');
    setScheduled(report.scheduled);
    setScheduleFrequency(report.scheduleFrequency || ReportScheduleFrequency.WEEKLY);
    setRecipients(report.recipients?.join(', ') || '');
    setViewMode('edit');
  };

  const handleGenerate = async (report: Report) => {
    try {
      const result = await analyticsService.generateReport(
        report.id,
        ReportFormat.JSON
      );
      setReportResult(result);
      setViewMode('view');
    } catch (err: any) {
      alert('Failed to generate report: ' + err.message);
    }
  };

  const handleSaveDefinition = async (definition: ReportDefinition) => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }

    try {
      const recipientList = recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      if (viewMode === 'edit' && selectedReport) {
        await analyticsService.updateReport(selectedReport.id, {
          name: reportName,
          description: reportDescription,
          definition,
          scheduled,
          scheduleFrequency: scheduled ? scheduleFrequency : undefined,
          recipients: recipientList.length > 0 ? recipientList : undefined,
        });
      } else {
        await analyticsService.createReport({
          name: reportName,
          description: reportDescription,
          definition,
          scheduled,
          scheduleFrequency: scheduled ? scheduleFrequency : undefined,
          recipients: recipientList.length > 0 ? recipientList : undefined,
        });
      }
      setViewMode('list');
    } catch (err: any) {
      alert('Failed to save report: ' + err.message);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {viewMode === 'list' ? (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
              <p className="text-gray-600 mt-2">
                Create and manage custom reports with flexible data sources and filters
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Report
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Reports
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'edit' ? 'Edit Report' : 'Create New Report'}
            </h1>
          </div>
        )}

        {/* Content */}
        {viewMode === 'list' && (
          <ReportList onEdit={handleEdit} onGenerate={handleGenerate} />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <div className="space-y-6">
            {/* Report Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Enter report description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduling</h3>
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
                    Schedule this report to run automatically
                  </label>
                </div>
                {scheduled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={scheduleFrequency}
                        onChange={(e) => setScheduleFrequency(e.target.value as ReportScheduleFrequency)}
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
              </div>
            </div>

            {/* Report Builder */}
            <ReportBuilder
              initialDefinition={selectedReport?.definition}
              onSave={handleSaveDefinition}
              onCancel={handleCancel}
            />
          </div>
        )}

        {viewMode === 'view' && reportResult && (
          <ReportViewer
            result={reportResult}
            onClose={() => {
              setViewMode('list');
              setReportResult(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
