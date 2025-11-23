import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../services/jobs';
import { JobFilters, JobStatus, EmploymentType } from '../types/job';
import { JobList } from '../components/jobs/JobList';
import { JobFiltersPanel } from '../components/jobs/JobFiltersPanel';

export function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsApi.getJobs(filters),
  });

  const { data: statistics } = useQuery({
    queryKey: ['jobs', 'statistics'],
    queryFn: () => jobsApi.getStatistics(),
  });

  const handleFilterChange = (newFilters: Partial<JobFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Jobs</h1>
              <p className="mt-2 text-sm text-purple-100">
                Manage your job postings and track hiring progress
              </p>
            </div>
            <Link
              to="/jobs/new"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-all hover:scale-105 shadow-lg"
            >
              + Create Job
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Jobs" value={statistics.total} />
            <StatCard label="Open" value={statistics.byStatus.open} color="green" />
            <StatCard label="Draft" value={statistics.byStatus.draft} color="gray" />
            <StatCard label="On Hold" value={statistics.byStatus.onHold} color="yellow" />
            <StatCard label="Closed" value={statistics.byStatus.closed} color="blue" />
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <JobFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Job List */}
          <div className="flex-1">
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-sm text-gray-600">Loading jobs...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Error loading jobs. Please try again.
                </p>
              </div>
            )}

            {data && (
              <JobList
                jobs={data.data}
                pagination={data.meta}
                onPageChange={handlePageChange}
                onRefresh={refetch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color?: 'green' | 'gray' | 'yellow' | 'blue';
}

function StatCard({ label, value, color = 'gray' }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gradient-to-br from-purple-50 to-pink-50 text-gray-800 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
