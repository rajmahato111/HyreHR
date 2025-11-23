import React, { useState } from 'react';
import { Mail, MessageSquare, Activity } from 'lucide-react';
import { EmailComposer, UnifiedInbox, ActivityTimeline } from '../components/communication';

type TabType = 'inbox' | 'timeline';

export const CommunicationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [showComposer, setShowComposer] = useState(false);

  // Mock candidate ID - in real app, this would come from route params or context
  const candidateId = '123e4567-e89b-12d3-a456-426614174000';
  const applicationId = '123e4567-e89b-12d3-a456-426614174001';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
            <button
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Compose Email
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'inbox'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Inbox
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'timeline'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              Activity Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'inbox' && (
          <div className="h-[calc(100vh-200px)]">
            <UnifiedInbox candidateId={candidateId} applicationId={applicationId} />
          </div>
        )}

        {activeTab === 'timeline' && (
          <ActivityTimeline candidateId={candidateId} applicationId={applicationId} />
        )}
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <EmailComposer
          candidateId={candidateId}
          applicationId={applicationId}
          onClose={() => setShowComposer(false)}
          onSent={() => {
            setShowComposer(false);
            // Refresh data if needed
          }}
        />
      )}
    </div>
  );
};
