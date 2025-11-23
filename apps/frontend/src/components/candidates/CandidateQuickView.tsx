import { Application } from '../../types/application';

interface CandidateQuickViewProps {
  application: Application | null;
  onClose: () => void;
}

export function CandidateQuickView({ application, onClose }: CandidateQuickViewProps) {
  if (!application || !application.candidate) return null;

  const candidate = application.candidate;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Candidate Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            {/* Candidate Info */}
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {candidate.firstName} {candidate.lastName}
              </h4>
              {candidate.currentTitle && (
                <p className="text-gray-600 mb-1">
                  {candidate.currentTitle}
                  {candidate.currentCompany && ` at ${candidate.currentCompany}`}
                </p>
              )}
              {candidate.location && (
                <p className="text-gray-500 text-sm">
                  📍 {candidate.location.city}
                  {candidate.location.state && `, ${candidate.location.state}`}
                  {candidate.location.country && `, ${candidate.location.country}`}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Contact</h5>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                    {candidate.email}
                  </a>
                </p>
                {candidate.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {candidate.phone}
                  </p>
                )}
                {candidate.linkedinUrl && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">LinkedIn:</span>{' '}
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {candidate.tags && candidate.tags.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {candidate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application Info */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Application</h5>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Applied:</span>{' '}
                  {new Date(application.appliedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Source:</span> {application.source.type}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{application.status}</span>
                </p>
                {application.rating && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Rating:</span>{' '}
                    <span className="text-yellow-500">
                      {'★'.repeat(application.rating)}
                      {'☆'.repeat(5 - application.rating)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Resume */}
            {candidate.resumeUrls && candidate.resumeUrls.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Resume</h5>
                {candidate.resumeUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:underline"
                  >
                    📄 View Resume {candidate.resumeUrls.length > 1 && `(${index + 1})`}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.location.href = `/candidates/${candidate.id}`;
              }}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
