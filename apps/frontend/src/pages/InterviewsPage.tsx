import React, { useState } from 'react';
import { InterviewCalendar } from '../components/interviews/InterviewCalendar';
import { InterviewDetailsModal } from '../components/interviews/InterviewDetailsModal';
import { Interview } from '../types/interview';

export const InterviewsPage: React.FC = () => {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleInterviewClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedInterview(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interviews</h1>
        <p className="text-gray-600">
          View and manage all scheduled interviews
        </p>
      </div>

      <InterviewCalendar onInterviewClick={handleInterviewClick} />

      {selectedInterview && (
        <InterviewDetailsModal
          interviewId={selectedInterview.id}
          isOpen={showDetailsModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
