import React from 'react';
import { SequenceBuilder } from '../components/email-sequences';

export const CreateEmailSequencePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SequenceBuilder />
    </div>
  );
};

export default CreateEmailSequencePage;
