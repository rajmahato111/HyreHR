import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsApi } from '../services/jobs';
import { Job, JobStatus } from '../types/job';
import { formatDateTime } from '../utils/date';
import { TimeToFillPredictionComponent } from '../components/jobs/TimeToFillPrediction';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        const data = await jobsApi.getJob(id);
        setJob(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load job');
        console.error('Failed to fetch job:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      await jobsApi.deleteJob(id);
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete job');
      console.error('Failed to delete job:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!id) return;

    try {
      const updatedJob = await jobsApi.updateJobStatus(id, newStatus);
      setJob(updatedJob);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
      console.error('Failed to update status:', err);
    }
  };

  const handleClone = async () => {
    if (!id) return;

    try {
      const clonedJob = await jobsApi.cloneJob(id);
      navigate(`/jobs/${clonedJob.id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clone job');
      console.error('Failed to clone job:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading job...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading job
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/jobs"
              className="text-sm font-medium text-red-800 hover:text-red-900"
            >
              Back to jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const statusColors = {
    [JobStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    [JobStatus.OPEN]: 'bg-green-100 text-green-800',
    [JobStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
    [JobStatus.CLOSED]: 'bg-blue-100 text-blue-800',
    [JobStatus.CANCELLED]: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    [JobStatus.DRAFT]: 'Draft',
    [JobStatus.OPEN]: 'Open',
    [JobStatus.ON_HOLD]: 'On Hold',
    [JobStatus.CLOSED]: 'Closed',
    [JobStatus.CANCELLED]: 'Cancelled',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link to="/jobs" className="text-gray-500 hover:text-gray-700">
              Jobs
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{job.title}</li>
        </ol>
      </nav>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[job.status]
                }`}
              >
                {statusLabels[job.status]}
              </span>
              {job.confidential && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Confidential
                </span>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              {job.department && (
                <span className="flex items-center gap-1">
                  <span>📁</span>
                  <span>{job.department.name}</span>
                </span>
              )}
              {job.locations && job.locations.length > 0 && (
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{job.locations.map((l) => l.name).join(', ')}</span>
                </span>
              )}
              {job.remoteOk && (
                <span className="flex items-center gap-1">
                  <span>🏠</span>
                  <span>Remote</span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              to={`/jobs/${job.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              onClick={handleClone}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Clone
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Description
            </h2>
            {job.description ? (
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {job.description}
              </div>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </div>

          {/* Applications Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Applications
            </h2>
            <p className="text-gray-500 text-sm">
              Application pipeline will be displayed here in a future update
            </p>
          </div>

          {/* Analytics Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Analytics
            </h2>
            <p className="text-gray-500 text-sm">
              Job metrics and analytics will be displayed here in a future update
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Time to Fill Prediction */}
          {job.status === JobStatus.OPEN && (
            <TimeToFillPredictionComponent jobId={job.id} />
          )}

          {/* Status Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Status
            </h3>
            <select
              value={job.status}
              onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={JobStatus.DRAFT}>Draft</option>
              <option value={JobStatus.OPEN}>Open</option>
              <option value={JobStatus.ON_HOLD}>On Hold</option>
              <option value={JobStatus.CLOSED}>Closed</option>
              <option value={JobStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Job Details
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500">Employment Type</dt>
                <dd className="text-sm text-gray-900 mt-1 capitalize">
                  {job.employmentType.replace('_', ' ')}
                </dd>
              </div>

              {job.seniorityLevel && (
                <div>
                  <dt className="text-xs text-gray-500">Seniority Level</dt>
                  <dd className="text-sm text-gray-900 mt-1 capitalize">
                    {job.seniorityLevel}
                  </dd>
                </div>
              )}

              {job.salaryMin && job.salaryMax && (
                <div>
                  <dt className="text-xs text-gray-500">Salary Range</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {job.salaryCurrency} {job.salaryMin.toLocaleString()} -{' '}
                    {job.salaryMax.toLocaleString()}
                  </dd>
                </div>
              )}

              {job.requisitionId && (
                <div>
                  <dt className="text-xs text-gray-500">Requisition ID</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {job.requisitionId}
                  </dd>
                </div>
              )}

              {job.owner && (
                <div>
                  <dt className="text-xs text-gray-500">Hiring Manager</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {job.owner.firstName} {job.owner.lastName}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Timeline
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {formatDateTime(job.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {formatDateTime(job.updatedAt)}
                </dd>
              </div>

              {job.openedAt && (
                <div>
                  <dt className="text-xs text-gray-500">Opened</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatDateTime(job.openedAt)}
                  </dd>
                </div>
              )}

              {job.closedAt && (
                <div>
                  <dt className="text-xs text-gray-500">Closed</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatDateTime(job.closedAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Job
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this job? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
