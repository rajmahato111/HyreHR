import React from 'react';
import { EmailSequenceList } from '../components/email-sequences';

export const EmailSequencesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <EmailSequenceList />
    </div>
  );
};

export default EmailSequencesPage;
