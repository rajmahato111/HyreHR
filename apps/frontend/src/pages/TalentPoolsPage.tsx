import React from 'react';
import { TalentPoolList } from '../components/talent-pools';

export const TalentPoolsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TalentPoolList />
    </div>
  );
};

export default TalentPoolsPage;
