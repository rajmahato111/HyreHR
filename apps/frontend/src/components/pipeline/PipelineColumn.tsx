import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PipelineStage } from '../../types/application';
import { Application } from '../../types/application';
import { CandidateCard } from './CandidateCard';

interface PipelineColumnProps {
  stage: PipelineStage;
  applications: Application[];
  onCardClick: (application: Application) => void;
}

export function PipelineColumn({ stage, applications, onCardClick }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-50 rounded-lg h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{stage.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
              {applications.length}
            </span>
          </div>
        </div>

        <div
          ref={setNodeRef}
          className={`flex-1 p-4 overflow-y-auto ${
            isOver ? 'bg-blue-50' : ''
          }`}
          style={{ minHeight: '200px' }}
        >
          <SortableContext
            items={applications.map((app) => app.id)}
            strategy={verticalListSortingStrategy}
          >
            {applications.map((application) => (
              <CandidateCard
                key={application.id}
                application={application}
                onClick={() => onCardClick(application)}
              />
            ))}
          </SortableContext>

          {applications.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No candidates in this stage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
