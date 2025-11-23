import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CandidateForDeletion {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  policy: {
    id: string;
    retentionPeriodDays: number;
  };
  daysOverdue: number;
}

interface CandidateApproachingDeletion {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  daysUntilDeletion: number;
}

export const GDPRDashboard: React.FC = () => {
  const [candidatesForDeletion, setCandidatesForDeletion] = useState<
    CandidateForDeletion[]
  >([]);
  const [candidatesApproaching, setCandidatesApproaching] = useState<
    CandidateApproachingDeletion[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [forDeletion, approaching] = await Promise.all([
        axios.get('/api/gdpr/candidates-for-deletion'),
        axios.get('/api/gdpr/candidates-approaching-deletion'),
      ]);

      setCandidatesForDeletion(forDeletion.data);
      setCandidatesApproaching(approaching.data);
    } catch (error) {
      console.error('Failed to fetch GDPR dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete/anonymize this candidate data? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/gdpr/candidates/${candidateId}`);
      alert('Candidate data has been anonymized successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      alert('Failed to delete candidate data');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading GDPR dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue for Deletion</p>
              <p className="text-3xl font-bold text-red-600">
                {candidatesForDeletion.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🗑️</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Candidates past retention period
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approaching Deletion</p>
              <p className="text-3xl font-bold text-yellow-600">
                {candidatesApproaching.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Candidates nearing retention limit
          </p>
        </div>
      </div>

      {/* Overdue Candidates */}
      {candidatesForDeletion.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            ⚠️ Candidates Overdue for Deletion
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            These candidates have exceeded the retention period and should be reviewed
            for deletion.
          </p>

          <div className="space-y-3">
            {candidatesForDeletion.map(({ candidate, daysOverdue }) => (
              <div
                key={candidate.id}
                className="border border-red-200 rounded p-4 bg-red-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    <p className="text-sm text-red-600 mt-1">
                      <strong>{daysOverdue} days</strong> overdue for deletion
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/candidates/${candidate.id}`)
                      }
                      className="text-blue-600 hover:text-blue-700 text-sm px-3 py-1"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Delete Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approaching Deletion */}
      {candidatesApproaching.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-yellow-600">
            ⏰ Candidates Approaching Deletion
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            These candidates will be eligible for deletion soon. Review and take action
            if needed.
          </p>

          <div className="space-y-3">
            {candidatesApproaching.map(({ candidate, daysUntilDeletion }) => (
              <div
                key={candidate.id}
                className="border border-yellow-200 rounded p-4 bg-yellow-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      <strong>{daysUntilDeletion} days</strong> until scheduled
                      deletion
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/candidates/${candidate.id}`)
                      }
                      className="text-blue-600 hover:text-blue-700 text-sm px-3 py-1"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {candidatesForDeletion.length === 0 &&
        candidatesApproaching.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              All Clear!
            </h3>
            <p className="text-gray-600">
              No candidates require immediate attention for GDPR compliance.
            </p>
          </div>
        )}

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          About GDPR Compliance
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Data retention policies automatically track candidate data age
          </li>
          <li>
            • Candidates are flagged when approaching or exceeding retention limits
          </li>
          <li>
            • Automatic deletion can be enabled in retention policy settings
          </li>
          <li>
            • Deleted data is anonymized while preserving application history
          </li>
        </ul>
      </div>
    </div>
  );
};
