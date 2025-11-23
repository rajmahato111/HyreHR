import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application } from '../../types/application';

interface CandidateCardProps {
  application: Application;
  onClick: () => void;
}

export function CandidateCard({ application, onClick }: CandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const candidate = application.candidate;
  if (!candidate) return null;

  const matchScore = application.customFields?.matchScore;
  
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {candidate.firstName} {candidate.lastName}
          </h4>
          {candidate.currentTitle && (
            <p className="text-xs text-gray-500 truncate">
              {candidate.currentTitle}
              {candidate.currentCompany && ` at ${candidate.currentCompany}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          {matchScore !== undefined && (
            <div
              className={`flex items-center px-2 py-1 rounded border text-xs font-semibold ${getMatchScoreColor(matchScore)}`}
              title="Match Score"
            >
              {matchScore}%
            </div>
          )}
          {application.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="text-xs text-gray-600 ml-1">{application.rating}</span>
            </div>
          )}
        </div>
      </div>

      {candidate.location && (
        <p className="text-xs text-gray-500 mb-2">
          📍 {candidate.location.city}
          {candidate.location.state && `, ${candidate.location.state}`}
        </p>
      )}

      {candidate.tags && candidate.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {candidate.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
          {candidate.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{candidate.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
        <span>{application.source.type}</span>
      </div>
    </div>
  );
}
