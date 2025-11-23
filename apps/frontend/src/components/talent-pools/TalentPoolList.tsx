import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { talentPoolsService } from '../../services/talent-pools';
import { TalentPool, TalentPoolType } from '../../types/talent-pool';

export const TalentPoolList: React.FC = () => {
  const navigate = useNavigate();
  const [pools, setPools] = useState<TalentPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | TalentPoolType>('all');

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      setLoading(true);
      const data = await talentPoolsService.getTalentPools();
      setPools(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load talent pools');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this talent pool?')) {
      return;
    }

    try {
      await talentPoolsService.deleteTalentPool(id);
      setPools(pools.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete talent pool');
    }
  };

  const filteredPools = filter === 'all' 
    ? pools 
    : pools.filter((p) => p.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading talent pools...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Pools</h1>
          <p className="text-gray-600 mt-1">
            Organize and engage with candidates for future opportunities
          </p>
        </div>
        <button
          onClick={() => navigate('/talent-pools/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Pool
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({pools.length})
        </button>
        <button
          onClick={() => setFilter(TalentPoolType.STATIC)}
          className={`px-4 py-2 rounded-lg ${
            filter === TalentPoolType.STATIC
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Static ({pools.filter((p) => p.type === TalentPoolType.STATIC).length})
        </button>
        <button
          onClick={() => setFilter(TalentPoolType.DYNAMIC)}
          className={`px-4 py-2 rounded-lg ${
            filter === TalentPoolType.DYNAMIC
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Dynamic ({pools.filter((p) => p.type === TalentPoolType.DYNAMIC).length})
        </button>
      </div>

      {/* Pool List */}
      {filteredPools.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No talent pools found</p>
          <button
            onClick={() => navigate('/talent-pools/new')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Create your first talent pool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map((pool) => (
            <div
              key={pool.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/talent-pools/${pool.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pool.name}
                  </h3>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      pool.type === TalentPoolType.STATIC
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {pool.type}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(pool.id);
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {pool.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {pool.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {pool.memberCount} members
                </div>
                {pool.owner && (
                  <div className="text-gray-500">
                    {pool.owner.firstName} {pool.owner.lastName}
                  </div>
                )}
              </div>

              {pool.tags && pool.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {pool.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {pool.tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">
                      +{pool.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TalentPoolList;
