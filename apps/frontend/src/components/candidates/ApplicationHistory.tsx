import { Link } from 'react-router-dom';
import { Application, ApplicationStatus } from '../../types/application';

interface ApplicationHistoryProps {
  applications: Application[];
}

export function ApplicationHistory({ applications }: ApplicationHistoryProps) {
  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApplicationStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800';
      case ApplicationStatus.HIRED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application History</h3>
        <p className="text-gray-500 text-center py-8">No applications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Application History</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {applications.map((application) => (
          <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/jobs/${application.jobId}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Job #{application.jobId.slice(0, 8)}
                </Link>
                <div className="mt-1 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>
                  {application.stage && (
                    <span className="text-xs text-gray-500">
                      Current Stage: {application.stage.name}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                  <span>Source: {application.source.type}</span>
                  {application.rating && (
                    <span className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      {application.rating}/5
                    </span>
                  )}
                </div>
              </div>
              <Link
                to={`/jobs/${application.jobId}/pipeline`}
                className="ml-4 text-sm text-blue-600 hover:underline"
              >
                View Pipeline
              </Link>
            </div>

            {/* Stage History */}
            {application.history && application.history.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Stage History:</p>
                <div className="space-y-1">
                  {application.history.slice(0, 3).map((history, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <span className="font-medium">
                        {history.fromStageId ? 'Moved to' : 'Started at'}
                      </span>{' '}
                      stage on {new Date(history.movedAt).toLocaleDateString()}
                      {history.automated && (
                        <span className="text-gray-400 ml-1">(automated)</span>
                      )}
                    </div>
                  ))}
                  {application.history.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{application.history.length - 3} more stages
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
