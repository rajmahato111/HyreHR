import React, { useState } from 'react';
import { BiasReportingDashboard } from '../components/bias-detection';

export const BiasDetectionPage: React.FC = () => {
  // In a real app, this would come from auth context
  const organizationId = 'org-123';
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(
    undefined
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BiasReportingDashboard
          organizationId={organizationId}
          jobId={selectedJobId}
        />
      </div>
    </div>
  );
};
