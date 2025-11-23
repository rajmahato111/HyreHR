import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RetentionPolicy {
  id: string;
  entityType: string;
  retentionPeriodDays: number;
  autoDelete: boolean;
  notifyBeforeDays: number;
  active: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const RetentionPolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RetentionPolicy | null>(null);
  const [formData, setFormData] = useState({
    entityType: 'candidate',
    retentionPeriodDays: 1095, // 3 years default
    autoDelete: false,
    notifyBeforeDays: 30,
    description: '',
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await axios.get('/api/gdpr/retention-policies');
      setPolicies(response.data);
    } catch (error) {
      console.error('Failed to fetch retention policies:', error);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/gdpr/retention-policies', formData);
      alert('Retention policy created successfully');
      setShowCreateForm(false);
      setFormData({
        entityType: 'candidate',
        retentionPeriodDays: 1095,
        autoDelete: false,
        notifyBeforeDays: 30,
        description: '',
      });
      fetchPolicies();
    } catch (error) {
      console.error('Failed to create retention policy:', error);
      alert('Failed to create retention policy');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    setLoading(true);
    try {
      await axios.post(`/api/gdpr/retention-policies/${editingPolicy.id}`, formData);
      alert('Retention policy updated successfully');
      setEditingPolicy(null);
      fetchPolicies();
    } catch (error) {
      console.error('Failed to update retention policy:', error);
      alert('Failed to update retention policy');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this retention policy?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/gdpr/retention-policies/${policyId}`);
      alert('Retention policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      console.error('Failed to delete retention policy:', error);
      alert('Failed to delete retention policy');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (policy: RetentionPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      entityType: policy.entityType,
      retentionPeriodDays: policy.retentionPeriodDays,
      autoDelete: policy.autoDelete,
      notifyBeforeDays: policy.notifyBeforeDays,
      description: policy.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingPolicy(null);
    setFormData({
      entityType: 'candidate',
      retentionPeriodDays: 1095,
      autoDelete: false,
      notifyBeforeDays: 30,
      description: '',
    });
  };

  const formatDays = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Data Retention Policies</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create Policy'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingPolicy) && (
          <form
            onSubmit={editingPolicy ? handleUpdatePolicy : handleCreatePolicy}
            className="mb-6 p-4 bg-gray-50 rounded border border-gray-200"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) =>
                    setFormData({ ...formData, entityType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  disabled={!!editingPolicy}
                >
                  <option value="candidate">Candidate</option>
                  <option value="application">Application</option>
                  <option value="communication">Communication</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retention Period (days)
                </label>
                <input
                  type="number"
                  value={formData.retentionPeriodDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retentionPeriodDays: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formatDays(formData.retentionPeriodDays)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notify Before (days)
                </label>
                <input
                  type="number"
                  value={formData.notifyBeforeDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notifyBeforeDays: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoDelete"
                  checked={formData.autoDelete}
                  onChange={(e) =>
                    setFormData({ ...formData, autoDelete: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="autoDelete" className="text-sm font-medium text-gray-700">
                  Enable automatic deletion
                </label>
              </div>

              {formData.autoDelete && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Warning:</strong> Data will be automatically deleted after the
                    retention period expires. This action cannot be undone.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    cancelEdit();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Policies List */}
        <div className="space-y-4">
          {policies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No retention policies configured. Create one to get started.
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.id}
                className="border border-gray-200 rounded p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold capitalize">
                        {policy.entityType}
                      </h3>
                      {policy.autoDelete && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                          Auto-Delete Enabled
                        </span>
                      )}
                      {!policy.active && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Retention Period:</span>
                        <span className="ml-2 font-medium">
                          {formatDays(policy.retentionPeriodDays)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Notify Before:</span>
                        <span className="ml-2 font-medium">
                          {policy.notifyBeforeDays} days
                        </span>
                      </div>
                    </div>

                    {policy.description && (
                      <p className="text-sm text-gray-600 mt-2">{policy.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(policy)}
                      className="text-blue-600 hover:text-blue-700 text-sm px-3 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-red-600 hover:text-red-700 text-sm px-3 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Information Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-900 mb-2">About Data Retention</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Retention policies define how long data is kept before deletion
            </li>
            <li>
              • Automatic deletion runs daily at 2 AM for expired data
            </li>
            <li>
              • Notifications are sent before data is scheduled for deletion
            </li>
            <li>
              • Deleted data is anonymized to maintain referential integrity
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
