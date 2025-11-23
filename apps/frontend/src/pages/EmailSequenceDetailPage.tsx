import React from 'react';
import { SequenceDetail } from '../components/email-sequences';

export const EmailSequenceDetailPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SequenceDetail />
    </div>
  );
};

export default EmailSequenceDetailPage;
