import React, { useState } from 'react';
import { Survey } from '../types/survey';
import {
  SurveyBuilder,
  SurveyList,
  SurveyResponseDashboard,
} from '../components/surveys';

type View = 'list' | 'create' | 'edit' | 'analytics' | 'dashboard';

export const SurveysPage: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const handleCreate = () => {
    setSelectedSurvey(null);
    setView('create');
  };

  const handleEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    setView('edit');
  };

  const handleViewAnalytics = (survey: Survey) => {
    setSelectedSurvey(survey);
    setView('analytics');
  };

  const handleSave = () => {
    setView('list');
    setSelectedSurvey(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedSurvey(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Candidate Surveys
              </h1>
              <p className="mt-2 text-gray-600">
                Collect feedback and measure candidate experience
              </p>
            </div>
            {view === 'list' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setView('dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  View Dashboard
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Survey
                </button>
              </div>
            )}
            {view !== 'list' && (
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                ← Back to Surveys
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {view === 'list' && (
            <SurveyList
              onEdit={handleEdit}
              onViewAnalytics={handleViewAnalytics}
            />
          )}

          {(view === 'create' || view === 'edit') && (
            <SurveyBuilder
              survey={selectedSurvey || undefined}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          {view === 'analytics' && selectedSurvey && (
            <div>
              <h2 className="text-2xl font-bold mb-6">{selectedSurvey.name}</h2>
              <SurveyResponseDashboard surveyId={selectedSurvey.id} />
            </div>
          )}

          {view === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Organization Survey Analytics
              </h2>
              <SurveyResponseDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
