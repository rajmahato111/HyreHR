import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { Job } from '../types/job';
import { jobsApi } from '../services/jobs';

export function PipelinePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJob(jobId);
    }
  }, [jobId]);

  const loadJob = async (id: string) => {
    try {
      setLoading(true);
      const data = await jobsApi.getJob(id);
      setJob(data);
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!job || !jobId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <Link to="/jobs" className="text-blue-600 hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <Link to="/jobs" className="hover:text-gray-700">
                  Jobs
                </Link>
                <span>/</span>
                <Link to={`/jobs/${job.id}`} className="hover:text-gray-700">
                  {job.title}
                </Link>
                <span>/</span>
                <span className="text-gray-900">Pipeline</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {job.department?.name} • {job.locations?.map((l) => l.name).join(', ')}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/jobs/${job.id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Job Details
              </Link>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KanbanBoard jobId={jobId} />
      </div>
    </div>
  );
}
