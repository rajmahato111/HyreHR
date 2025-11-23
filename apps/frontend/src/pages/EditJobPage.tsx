import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JobForm } from '../components/jobs/JobForm';
import { jobsApi } from '../services/jobs';
import { Job, UpdateJobDto } from '../types/job';

export function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setIsFetching(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSubmit = async (data: UpdateJobDto) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedJob = await jobsApi.updateJob(id, data);
      navigate(`/jobs/${updatedJob.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update job');
      console.error('Failed to update job:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/jobs/${id}`);
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            <button
              onClick={() => navigate('/jobs')}
              className="text-sm font-medium text-red-800 hover:text-red-900"
            >
              Back to jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
        <p className="mt-2 text-gray-600">
          Update the job details below
        </p>
      </div>

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
              <h3 className="text-sm font-medium text-red-800">
                Error updating job
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <JobForm
        job={job}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
