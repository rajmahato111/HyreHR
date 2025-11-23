import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface GDPRDataManagementProps {
  candidateId: string;
}

interface RetentionStatus {
  candidateId: string;
  createdAt: string;
  lastActivity: string;
  retentionPeriodDays: number;
  shouldBeDeleted: boolean;
  daysUntilDeletion: number;
}

export const GDPRDataManagement: React.FC<GDPRDataManagementProps> = ({ candidateId }) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [retentionStatus, setRetentionStatus] = useState<RetentionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchConsentStatus();
    fetchRetentionStatus();
  }, [candidateId]);

  const fetchConsentStatus = async () => {
    try {
      const response = await axios.get(`/api/gdpr/candidates/${candidateId}/consent`);
      setHasConsent(response.data.hasConsent);
    } catch (error) {
      console.error('Failed to fetch consent status:', error);
    }
  };

  const fetchRetentionStatus = async () => {
    try {
      const response = await axios.get(`/api/gdpr/candidates/${candidateId}/retention`);
      setRetentionStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch retention status:', error);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/gdpr/candidates/${candidateId}/export`);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidate-data-${candidateId}-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/gdpr/candidates/${candidateId}`);
      alert('Candidate data has been anonymized successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete data:', error);
      alert('Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordConsent = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/gdpr/candidates/${candidateId}/consent`, {
        consentType: 'data_processing',
      });
      setHasConsent(true);
      alert('Consent recorded successfully');
    } catch (error) {
      console.error('Failed to record consent:', error);
      alert('Failed to record consent');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async () => {
    setLoading(true);
    try {
      await axios.delete(`/api/gdpr/candidates/${candidateId}/consent`);
      setHasConsent(false);
      alert('Consent withdrawn successfully');
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      alert('Failed to withdraw consent');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">GDPR Data Management</h2>

        {/* Consent Status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Consent Status</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${hasConsent ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-700">
                {hasConsent ? 'Consent Given' : 'No Consent'}
              </span>
            </div>
            {hasConsent ? (
              <button
                onClick={handleWithdrawConsent}
                disabled={loading}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Withdraw Consent
              </button>
            ) : (
              <button
                onClick={handleRecordConsent}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Record Consent
              </button>
            )}
          </div>
        </div>

        {/* Data Retention */}
        {retentionStatus && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Data Retention</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(retentionStatus.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Activity:</span>
                <span className="font-medium">{formatDate(retentionStatus.lastActivity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Retention Period:</span>
                <span className="font-medium">{retentionStatus.retentionPeriodDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Until Deletion:</span>
                <span className={`font-medium ${retentionStatus.shouldBeDeleted ? 'text-red-600' : 'text-green-600'}`}>
                  {retentionStatus.shouldBeDeleted ? 'Overdue' : retentionStatus.daysUntilDeletion}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-2">Data Rights</h3>
          
          <button
            onClick={handleExportData}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Exporting...' : '📥 Export All Data (Right to Access)'}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            🗑️ Delete/Anonymize Data (Right to Erasure)
          </button>
        </div>

        {/* GDPR Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-900 mb-2">GDPR Rights</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Right to Access:</strong> Export all personal data</li>
            <li>• <strong>Right to Erasure:</strong> Delete or anonymize personal data</li>
            <li>• <strong>Right to Rectification:</strong> Update incorrect data</li>
            <li>• <strong>Right to Data Portability:</strong> Receive data in machine-readable format</li>
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Confirm Data Deletion</h3>
            <p className="text-gray-700 mb-6">
              This action will anonymize all personal data for this candidate. This includes:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Name, email, and contact information</li>
              <li>Location and social profiles</li>
              <li>All communications</li>
              <li>Custom fields and tags</li>
            </ul>
            <p className="text-gray-700 mb-6">
              <strong>Note:</strong> Application history and interview records will be preserved
              for compliance purposes, but personal identifiers will be removed.
            </p>
            <p className="text-red-600 font-semibold mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteData}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Data'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
