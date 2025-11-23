import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { talentPoolsService } from '../../services/talent-pools';
import { candidatesService } from '../../services/candidates';
import { TalentPool, TalentPoolType, TalentPoolAnalytics } from '../../types/talent-pool';
import { Candidate } from '../../types/candidate';

export const TalentPoolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pool, setPool] = useState<TalentPool | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [analytics, setAnalytics] = useState<TalentPoolAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'candidates' | 'analytics'>('candidates');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (id) {
      loadPoolData();
    }
  }, [id]);

  const loadPoolData = async () => {
    try {
      setLoading(true);
      const [poolData, candidatesData, analyticsData] = await Promise.all([
        talentPoolsService.getTalentPool(id!),
        talentPoolsService.getPoolCandidates(id!),
        talentPoolsService.getPoolAnalytics(id!),
      ]);
      setPool(poolData);
      setCandidates(candidatesData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      alert(err.message || 'Failed to load talent pool');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!pool || pool.type !== TalentPoolType.DYNAMIC) return;

    try {
      setSyncing(true);
      const updated = await talentPoolsService.syncPool(pool.id);
      setPool(updated);
      await loadPoolData();
    } catch (err: any) {
      alert(err.message || 'Failed to sync pool');
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveCandidates = async () => {
    if (!pool || selectedCandidates.length === 0) return;

    if (!confirm(`Remove ${selectedCandidates.length} candidate(s) from this pool?`)) {
      return;
    }

    try {
      await talentPoolsService.removeCandidates(pool.id, selectedCandidates);
      setCandidates(candidates.filter((c) => !selectedCandidates.includes(c.id)));
      setSelectedCandidates([]);
    } catch (err: any) {
      alert(err.message || 'Failed to remove candidates');
    }
  };

  if (loading || !pool) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{pool.name}</h1>
              <span
                className={`px-3 py-1 text-sm rounded ${
                  pool.type === TalentPoolType.STATIC
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {pool.type}
              </span>
            </div>
            {pool.description && (
              <p className="text-gray-600 mt-2">{pool.description}</p>
            )}
            {pool.tags && pool.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {pool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {pool.type === TalentPoolType.DYNAMIC && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
              >
                {syncing ? 'Syncing...' : 'Sync Pool'}
              </button>
            )}
            <button
              onClick={() => navigate(`/talent-pools/${pool.id}/edit`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {pool.memberCount}
            </div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.newMembersThisMonth || 0}
            </div>
            <div className="text-sm text-gray-600">New This Month</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.engagementRate || 0}%
            </div>
            <div className="text-sm text-gray-600">Engagement Rate</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.hiresFromPool || 0}
            </div>
            <div className="text-sm text-gray-600">Hires</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'candidates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Candidates ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'candidates' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Actions Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {selectedCandidates.length > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedCandidates.length} selected
                  </span>
                  <button
                    onClick={handleRemoveCandidates}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
            {pool.type === TalentPoolType.STATIC && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Candidates
              </button>
            )}
          </div>

          {/* Candidates List */}
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No candidates in this pool</p>
              {pool.type === TalentPoolType.STATIC && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Add your first candidate
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedCandidates([...selectedCandidates, candidate.id]);
                        } else {
                          setSelectedCandidates(
                            selectedCandidates.filter((id) => id !== candidate.id)
                          );
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {candidate.currentTitle && candidate.currentCompany
                          ? `${candidate.currentTitle} at ${candidate.currentCompany}`
                          : candidate.currentTitle || candidate.currentCompany || candidate.email}
                      </div>
                    </div>
                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="flex gap-1">
                        {candidate.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Email Performance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Emails Sent</span>
                <span className="font-semibold">{analytics.emailsSent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Emails Opened</span>
                <span className="font-semibold">{analytics.emailsOpened}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Emails Replied</span>
                <span className="font-semibold">{analytics.emailsReplied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Open Rate</span>
                <span className="font-semibold">
                  {analytics.emailsSent > 0
                    ? Math.round((analytics.emailsOpened / analytics.emailsSent) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reply Rate</span>
                <span className="font-semibold">
                  {analytics.emailsSent > 0
                    ? Math.round((analytics.emailsReplied / analytics.emailsSent) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Applications</span>
                <span className="font-semibold">{analytics.applicationsFromPool}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hires</span>
                <span className="font-semibold">{analytics.hiresFromPool}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Application Rate</span>
                <span className="font-semibold">
                  {pool.memberCount > 0
                    ? Math.round((analytics.applicationsFromPool / pool.memberCount) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hire Rate</span>
                <span className="font-semibold">
                  {analytics.applicationsFromPool > 0
                    ? Math.round((analytics.hiresFromPool / analytics.applicationsFromPool) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentPoolDetail;
