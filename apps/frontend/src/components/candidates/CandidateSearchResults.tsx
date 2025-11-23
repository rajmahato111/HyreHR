import { Link } from 'react-router-dom';
import { Candidate } from '../../types/candidate';

interface CandidateSearchResultsProps {
  candidates: Candidate[];
  searchQuery?: string;
  loading?: boolean;
}

export function CandidateSearchResults({
  candidates,
  searchQuery,
  loading = false,
}: CandidateSearchResultsProps) {
  const highlightText = (text: string, query?: string) => {
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Searching...</div>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-sm text-gray-700">
          Found <span className="font-medium">{candidates.length}</span> candidate
          {candidates.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {candidates.map((candidate) => (
          <Link
            key={candidate.id}
            to={`/candidates/${candidate.id}`}
            className="block px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">
                  {highlightText(
                    `${candidate.firstName} ${candidate.lastName}`,
                    searchQuery
                  )}
                </h4>
                {candidate.currentTitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    {highlightText(candidate.currentTitle, searchQuery)}
                    {candidate.currentCompany && (
                      <>
                        {' at '}
                        {highlightText(candidate.currentCompany, searchQuery)}
                      </>
                    )}
                  </p>
                )}
                {candidate.location && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {candidate.location.city}
                    {candidate.location.state && `, ${candidate.location.state}`}
                  </p>
                )}
              </div>

              <div className="ml-4 flex-shrink-0">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Tags */}
            {candidate.tags && candidate.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {candidate.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {highlightText(tag, searchQuery)}
                  </span>
                ))}
                {candidate.tags.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{candidate.tags.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Contact */}
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
              <span>{candidate.email}</span>
              {candidate.phone && <span>{candidate.phone}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
