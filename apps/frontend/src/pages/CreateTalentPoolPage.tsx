import React from 'react';
import { TalentPoolWizard } from '../components/talent-pools';

export const CreateTalentPoolPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TalentPoolWizard />
    </div>
  );
};

export default CreateTalentPoolPage;
