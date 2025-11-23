import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailSequencesService } from '../../services/email-sequences';
import { EmailSequence, SequenceStatus } from '../../types/email-sequence';

export const EmailSequenceList: React.FC = () => {
  const navigate = useNavigate();
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | SequenceStatus>('all');

  useEffect(() => {
    loadSequences();
  }, []);

  const loadSequences = async () => {
    try {
      setLoading(true);
      const data = await emailSequencesService.getSequences();
      setSequences(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load email sequences');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email sequence?')) {
      return;
    }

    try {
      await emailSequencesService.deleteSequence(id);
      setSequences(sequences.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete email sequence');
    }
  };

  const handleToggleStatus = async (sequence: EmailSequence) => {
    const newStatus =
      sequence.status === SequenceStatus.ACTIVE
        ? SequenceStatus.PAUSED
        : SequenceStatus.ACTIVE;

    try {
      const updated = await emailSequencesService.updateSequence(sequence.id, {
        status: newStatus,
      });
      setSequences(sequences.map((s) => (s.id === sequence.id ? updated : s)));
    } catch (err: any) {
      alert(err.message || 'Failed to update sequence status');
    }
  };

  const filteredSequences =
    filter === 'all' ? sequences : sequences.filter((s) => s.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading email sequences...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Email Sequences</h1>
          <p className="text-gray-600 mt-1">
            Automate multi-step email campaigns to engage candidates
          </p>
        </div>
        <button
          onClick={() => navigate('/email-sequences/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Sequence
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
          All ({sequences.length})
        </button>
        <button
          onClick={() => setFilter(SequenceStatus.ACTIVE)}
          className={`px-4 py-2 rounded-lg ${
            filter === SequenceStatus.ACTIVE
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active ({sequences.filter((s) => s.status === SequenceStatus.ACTIVE).length})
        </button>
        <button
          onClick={() => setFilter(SequenceStatus.DRAFT)}
          className={`px-4 py-2 rounded-lg ${
            filter === SequenceStatus.DRAFT
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Draft ({sequences.filter((s) => s.status === SequenceStatus.DRAFT).length})
        </button>
        <button
          onClick={() => setFilter(SequenceStatus.PAUSED)}
          className={`px-4 py-2 rounded-lg ${
            filter === SequenceStatus.PAUSED
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Paused ({sequences.filter((s) => s.status === SequenceStatus.PAUSED).length})
        </button>
      </div>

      {/* Sequence List */}
      {filteredSequences.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No email sequences found</p>
          <button
            onClick={() => navigate('/email-sequences/new')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Create your first email sequence
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
          {filteredSequences.map((sequence) => (
            <div
              key={sequence.id}
              className="p-6 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/email-sequences/${sequence.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sequence.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        sequence.status === SequenceStatus.ACTIVE
                          ? 'bg-green-100 text-green-700'
                          : sequence.status === SequenceStatus.DRAFT
                          ? 'bg-gray-100 text-gray-700'
                          : sequence.status === SequenceStatus.PAUSED
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {sequence.status}
                    </span>
                  </div>
                  {sequence.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {sequence.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span>{sequence.steps.length} steps</span>
                    <span>•</span>
                    <span>{sequence.totalEnrolled} enrolled</span>
                    <span>•</span>
                    <span>{sequence.openRate.toFixed(1)}% open rate</span>
                    <span>•</span>
                    <span>{sequence.replyRate.toFixed(1)}% reply rate</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(sequence);
                    }}
                    className={`px-3 py-1 text-sm rounded ${
                      sequence.status === SequenceStatus.ACTIVE
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {sequence.status === SequenceStatus.ACTIVE ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sequence.id);
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailSequenceList;
