import React from 'react';
import { TalentPoolDetail } from '../components/talent-pools';

export const TalentPoolDetailPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TalentPoolDetail />
    </div>
  );
};

export default TalentPoolDetailPage;
