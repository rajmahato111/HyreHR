import { JobFilters, JobStatus, EmploymentType, SeniorityLevel } from '../../types/job';

interface JobFiltersPanelProps {
  filters: JobFilters;
  onFilterChange: (filters: Partial<JobFilters>) => void;
  onClearFilters: () => void;
}

export function JobFiltersPanel({
  filters,
  onFilterChange,
  onClearFilters,
}: JobFiltersPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-xs text-primary-600 hover:text-primary-700"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
            placeholder="Search jobs..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as JobStatus || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All statuses</option>
            <option value={JobStatus.DRAFT}>Draft</option>
            <option value={JobStatus.OPEN}>Open</option>
            <option value={JobStatus.ON_HOLD}>On Hold</option>
            <option value={JobStatus.CLOSED}>Closed</option>
            <option value={JobStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type
          </label>
          <select
            value={filters.employmentType || ''}
            onChange={(e) =>
              onFilterChange({ employmentType: e.target.value as EmploymentType || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All types</option>
            <option value={EmploymentType.FULL_TIME}>Full-time</option>
            <option value={EmploymentType.PART_TIME}>Part-time</option>
            <option value={EmploymentType.CONTRACT}>Contract</option>
            <option value={EmploymentType.INTERNSHIP}>Internship</option>
          </select>
        </div>

        {/* Seniority Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seniority Level
          </label>
          <select
            value={filters.seniorityLevel || ''}
            onChange={(e) =>
              onFilterChange({ seniorityLevel: e.target.value as SeniorityLevel || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All levels</option>
            <option value={SeniorityLevel.ENTRY}>Entry</option>
            <option value={SeniorityLevel.JUNIOR}>Junior</option>
            <option value={SeniorityLevel.MID}>Mid-level</option>
            <option value={SeniorityLevel.SENIOR}>Senior</option>
            <option value={SeniorityLevel.LEAD}>Lead</option>
            <option value={SeniorityLevel.PRINCIPAL}>Principal</option>
            <option value={SeniorityLevel.EXECUTIVE}>Executive</option>
          </select>
        </div>

        {/* Remote */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.remoteOk || false}
              onChange={(e) => onFilterChange({ remoteOk: e.target.checked || undefined })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Remote OK</span>
          </label>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select
            value={filters.sortOrder || 'DESC'}
            onChange={(e) => onFilterChange({ sortOrder: e.target.value as 'ASC' | 'DESC' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  );
}
