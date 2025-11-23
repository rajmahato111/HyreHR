import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Application, PipelineStage } from '../../types/application';
import { PipelineColumn } from './PipelineColumn';
import { CandidateCard } from './CandidateCard';
import { CandidateQuickView } from '../candidates/CandidateQuickView';
import applicationsService from '../../services/applications';
import websocketService from '../../services/websocket';

interface KanbanBoardProps {
  jobId: string;
}

export function KanbanBoard({ jobId }: KanbanBoardProps) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<'appliedAt' | 'matchScore' | 'rating'>('appliedAt');
  const [minMatchScore, setMinMatchScore] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load initial data
  useEffect(() => {
    loadData();
  }, [jobId, sortBy, minMatchScore]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    websocketService.connect();
    websocketService.subscribe('applications', { jobId });

    const handleStageChanged = (data: any) => {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === data.applicationId
            ? { ...app, stageId: data.toStage, stageEnteredAt: data.timestamp }
            : app
        )
      );
    };

    const handleApplicationCreated = (data: any) => {
      if (data.jobId === jobId) {
        loadData(); // Reload to get full application data
      }
    };

    websocketService.on('application.stage_changed', handleStageChanged);
    websocketService.on('application.created', handleApplicationCreated);

    return () => {
      websocketService.off('application.stage_changed', handleStageChanged);
      websocketService.off('application.created', handleApplicationCreated);
      websocketService.unsubscribe('applications');
    };
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stagesData, applicationsData] = await Promise.all([
        applicationsService.getPipelineStages(jobId),
        applicationsService.getApplications({ 
          jobId, 
          limit: 1000,
          sortBy,
          sortOrder: 'DESC',
          minMatchScore,
        }),
      ]);

      setStages(stagesData.sort((a, b) => a.orderIndex - b.orderIndex));
      setApplications(applicationsData.data);
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByStage = useCallback(
    (stageId: string) => {
      let filtered = applications.filter((app) => app.stageId === stageId && !app.archived);
      
      // Sort within each stage
      if (sortBy === 'matchScore') {
        filtered.sort((a, b) => {
          const scoreA = a.customFields?.matchScore ?? 0;
          const scoreB = b.customFields?.matchScore ?? 0;
          return scoreB - scoreA;
        });
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      } else {
        filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
      }
      
      return filtered;
    },
    [applications, sortBy]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find if we're over a stage
    const overStage = stages.find((stage) => stage.id === overId);
    if (!overStage) return;

    // Optimistically update UI
    setApplications((prev) =>
      prev.map((app) =>
        app.id === activeId ? { ...app, stageId: overStage.id } : app
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const overId = over.id as string;

    // Find the target stage
    const targetStage = stages.find((stage) => stage.id === overId);
    if (!targetStage) return;

    const application = applications.find((app) => app.id === applicationId);
    if (!application || application.stageId === targetStage.id) return;

    try {
      // Move application via API
      await applicationsService.moveApplication(applicationId, {
        stageId: targetStage.id,
      });
    } catch (error) {
      console.error('Failed to move application:', error);
      // Revert optimistic update
      loadData();
    }
  };

  const handleCardClick = (application: Application) => {
    setSelectedApplication(application);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading pipeline...</div>
      </div>
    );
  }

  const activeApplication = activeId
    ? applications.find((app) => app.id === activeId)
    : null;

  return (
    <>
      {/* Filters and Sorting */}
      <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="appliedAt">Applied Date</option>
                <option value="matchScore">Match Score</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {applications.length} candidates
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Match Score
                </label>
                <select
                  value={minMatchScore ?? ''}
                  onChange={(e) => setMinMatchScore(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All candidates</option>
                  <option value="80">80% or higher (Strong match)</option>
                  <option value="60">60% or higher (Good match)</option>
                  <option value="40">40% or higher</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              applications={getApplicationsByStage(stage.id)}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApplication && (
            <div className="w-80">
              <CandidateCard
                application={activeApplication}
                onClick={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CandidateQuickView
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
      />
    </>
  );
}
