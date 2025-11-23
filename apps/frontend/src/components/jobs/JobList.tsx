import { Link } from 'react-router-dom';
import { Job, JobStatus } from '../../types/job';
import { formatDate } from '../../utils/date';

interface JobListProps {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function JobList({ jobs, pagination, onPageChange, onRefresh }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">No jobs found</p>
        <button
          onClick={onRefresh}
          className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Cards */}
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1
                )
                .map((page, index, array) => (
                  <div key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
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
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusColors[job.status]
              }`}
            >
              {statusLabels[job.status]}
            </span>
            {job.confidential && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Confidential
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            {job.department && <span>📁 {job.department.name}</span>}
            {job.locations && job.locations.length > 0 && (
              <span>📍 {job.locations.map((l) => l.name).join(', ')}</span>
            )}
            {job.remoteOk && <span>🏠 Remote</span>}
          </div>

          {job.salaryMin && job.salaryMax && (
            <div className="mt-2 text-sm text-gray-700">
              💰 {job.salaryCurrency} {job.salaryMin.toLocaleString()} -{' '}
              {job.salaryMax.toLocaleString()}
            </div>
          )}

          {job.owner && (
            <div className="mt-2 text-sm text-gray-600">
              👤 {job.owner.firstName} {job.owner.lastName}
            </div>
          )}
        </div>

        <div className="text-right text-sm text-gray-500">
          <div>Created {formatDate(job.createdAt)}</div>
          {job.openedAt && <div>Opened {formatDate(job.openedAt)}</div>}
        </div>
      </div>
    </Link>
  );
}
