import { Candidate } from '../../types/candidate';
import { Application, MatchBreakdown } from '../../types/application';

interface CandidateOverviewProps {
  candidate: Candidate;
  application?: Application;
  onEdit: () => void;
}

export function CandidateOverview({ candidate, application, onEdit }: CandidateOverviewProps) {
  const matchScore = application?.customFields?.matchScore;
  const matchBreakdown = application?.customFields?.matchBreakdown;
  const skillGaps = application?.customFields?.skillGaps || [];
  const matchReasons = application?.customFields?.matchReasons || [];

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBreakdownColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {candidate.firstName} {candidate.lastName}
                </h2>
                {candidate.currentTitle && (
                  <p className="text-gray-600 mt-1">
                    {candidate.currentTitle}
                    {candidate.currentCompany && ` at ${candidate.currentCompany}`}
                  </p>
                )}
              </div>
              {matchScore !== undefined && (
                <div className={`px-4 py-2 rounded-lg ${getMatchScoreColor(matchScore)}`}>
                  <div className="text-2xl font-bold">{matchScore}%</div>
                  <div className="text-xs font-medium">Match Score</div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">
                  <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                    {candidate.email}
                  </a>
                </dd>
              </div>
              {candidate.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{candidate.phone}</dd>
                </div>
              )}
              {candidate.location && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">
                    {candidate.location.city}
                    {candidate.location.state && `, ${candidate.location.state}`}
                    {candidate.location.country && `, ${candidate.location.country}`}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Links</h3>
            <dl className="space-y-2">
              {candidate.linkedinUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">LinkedIn</dt>
                  <dd className="text-sm text-gray-900">
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </dd>
                </div>
              )}
              {candidate.githubUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">GitHub</dt>
                  <dd className="text-sm text-gray-900">
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </dd>
                </div>
              )}
              {candidate.portfolioUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Portfolio</dt>
                  <dd className="text-sm text-gray-900">
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Portfolio
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Tags */}
        {candidate.tags && candidate.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
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

        {/* Resume */}
        {candidate.resumeUrls && candidate.resumeUrls.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resume</h3>
            <div className="space-y-2">
              {candidate.resumeUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:underline"
                >
                  📄 Resume {candidate.resumeUrls.length > 1 && `(${index + 1})`}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Source</h3>
          <p className="text-sm text-gray-600">
            {candidate.source.type}
            {candidate.source.details && Object.keys(candidate.source.details).length > 0 && (
              <span className="text-gray-400 ml-2">
                ({Object.entries(candidate.source.details).map(([key, value]) => `${key}: ${value}`).join(', ')})
              </span>
            )}
          </p>
        </div>

        {/* Match Analysis */}
        {matchBreakdown && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Match Analysis</h3>
            
            {/* Match Breakdown */}
            <div className="space-y-3 mb-4">
              {Object.entries(matchBreakdown).map(([category, score]) => (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{category}</span>
                    <span className="text-gray-600">{Math.round(score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getBreakdownColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Match Reasons */}
            {matchReasons.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Why this match?</h4>
                <ul className="space-y-1">
                  {matchReasons.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skill Gaps */}
            {skillGaps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {skillGaps.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="text-gray-900">{new Date(candidate.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="text-gray-900">{new Date(candidate.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
