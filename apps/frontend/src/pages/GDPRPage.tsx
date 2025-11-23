import React, { useState } from 'react';
import { GDPRDashboard } from '../components/gdpr/GDPRDashboard';
import { RetentionPolicyManager } from '../components/gdpr/RetentionPolicyManager';

export const GDPRPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'policies'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GDPR Compliance</h1>
          <p className="text-gray-600 mt-2">
            Manage data retention policies and ensure GDPR compliance
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'policies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ Retention Policies
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && <GDPRDashboard />}
            {activeTab === 'policies' && <RetentionPolicyManager />}
          </div>
        </div>

        {/* GDPR Rights Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">GDPR Data Subject Rights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🔍 Right to Access
              </h3>
              <p className="text-sm text-gray-600">
                Candidates can request a copy of all their personal data. Use the
                export function in the candidate profile to fulfill this request.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                🗑️ Right to Erasure
              </h3>
              <p className="text-sm text-gray-600">
                Candidates can request deletion of their data. The system anonymizes
                personal information while preserving application history for
                compliance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ✏️ Right to Rectification
              </h3>
              <p className="text-sm text-gray-600">
                Candidates can request corrections to inaccurate data. Update
                candidate information through the profile edit function.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                📦 Right to Data Portability
              </h3>
              <p className="text-sm text-gray-600">
                Candidates can receive their data in a machine-readable format. The
                export function provides data in JSON format.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ✋ Right to Object
              </h3>
              <p className="text-sm text-gray-600">
                Candidates can object to processing of their data. Use the consent
                withdrawal function to stop processing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                ⏸️ Right to Restriction
              </h3>
              <p className="text-sm text-gray-600">
                Candidates can request restriction of processing. Mark candidates as
                restricted in their profile settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
