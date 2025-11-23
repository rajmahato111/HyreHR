import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviews';
import { InterviewStage, User } from '../../types/interview';

interface BulkInterviewSchedulingProps {
  applicationId: string;
  onSuccess?: (interviews: any[]) => void;
  onCancel?: () => void;
}

interface InterviewSlot {
  stageId: string;
  stageName: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewerIds: string[];
  roomId?: string;
}

export const BulkInterviewScheduling: React.FC<BulkInterviewSchedulingProps> = ({
  applicationId,
  onSuccess,
  onCancel,
}) => {
  const [interviewPlan, setInterviewPlan] = useState<any>(null);
  const [stages, setStages] = useState<InterviewStage[]>([]);
  const [availableInterviewers, setAvailableInterviewers] = useState<User[]>([]);
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [breakMinutes, setBreakMinutes] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterviewPlan();
    loadInterviewers();
  }, []);

  const loadInterviewPlan = async () => {
    try {
      // In a real implementation, fetch the interview plan for the job
      const plans = await interviewService.getInterviewPlans();
      if (plans.length > 0) {
        const plan = plans[0];
        setInterviewPlan(plan);
        const planStages = await interviewService.getInterviewStages(plan.id);
        setStages(planStages);
        generateInitialSlots(planStages);
      }
    } catch (err) {
      console.error('Failed to load interview plan:', err);
    }
  };

  const loadInterviewers = async () => {
    try {
      // In a real implementation, fetch users with interviewer role
      setAvailableInterviewers([]);
    } catch (err) {
      console.error('Failed to load interviewers:', err);
    }
  };

  const generateInitialSlots = (stageList: InterviewStage[]) => {
    const initialSlots: InterviewSlot[] = stageList.map((stage) => ({
      stageId: stage.id,
      stageName: stage.name,
      scheduledAt: '',
      durationMinutes: stage.durationMinutes,
      interviewerIds: [],
      roomId: undefined,
    }));
    setSlots(initialSlots);
  };

  const autoScheduleSlots = () => {
    if (!startDate || !startTime) {
      setError('Please select a start date and time');
      return;
    }

    const baseDateTime = new Date(`${startDate}T${startTime}`);
    let currentTime = baseDateTime.getTime();

    const updatedSlots = slots.map((slot) => {
      const scheduledAt = new Date(currentTime).toISOString();
      currentTime += (slot.durationMinutes + breakMinutes) * 60 * 1000;

      return {
        ...slot,
        scheduledAt,
      };
    });

    setSlots(updatedSlots);
    setError(null);
  };

  const updateSlot = (index: number, field: keyof InterviewSlot, value: any) => {
    const updatedSlots = [...slots];
    updatedSlots[index] = {
      ...updatedSlots[index],
      [field]: value,
    };
    setSlots(updatedSlots);
  };

  const toggleInterviewer = (slotIndex: number, interviewerId: string) => {
    const slot = slots[slotIndex];
    const interviewerIds = slot.interviewerIds.includes(interviewerId)
      ? slot.interviewerIds.filter((id) => id !== interviewerId)
      : [...slot.interviewerIds, interviewerId];

    updateSlot(slotIndex, 'interviewerIds', interviewerIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate all slots
      for (const slot of slots) {
        if (!slot.scheduledAt) {
          throw new Error(`Please set a time for ${slot.stageName}`);
        }
        if (slot.interviewerIds.length === 0) {
          throw new Error(`Please select interviewers for ${slot.stageName}`);
        }
      }

      // Create all interviews
      const interviews = await Promise.all(
        slots.map((slot) =>
          interviewService.createInterview({
            applicationId,
            interviewStageId: slot.stageId,
            scheduledAt: slot.scheduledAt,
            durationMinutes: slot.durationMinutes,
            locationType: 'onsite',
            roomId: slot.roomId,
            participants: slot.interviewerIds.map((userId) => ({
              userId,
              role: 'interviewer' as const,
            })),
          })
        )
      );

      onSuccess?.(interviews);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule interviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Bulk Schedule Onsite Interviews</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Auto-schedule Controls */}
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <h3 className="font-semibold text-lg">Auto-Schedule Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Between (minutes)
              </label>
              <input
                type="number"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
                min="0"
                step="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={autoScheduleSlots}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Auto-Schedule All Interviews
          </button>
        </div>

        {/* Interview Slots */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Interview Schedule</h3>

          {slots.map((slot, index) => (
            <div key={slot.stageId} className="border border-gray-300 rounded-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">{slot.stageName}</h4>
                <span className="text-sm text-gray-500">
                  {slot.durationMinutes} minutes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date/Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={slot.scheduledAt ? slot.scheduledAt.slice(0, 16) : ''}
                    onChange={(e) =>
                      updateSlot(
                        index,
                        'scheduledAt',
                        new Date(e.target.value).toISOString()
                      )
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room (Optional)
                  </label>
                  <input
                    type="text"
                    value={slot.roomId || ''}
                    onChange={(e) => updateSlot(index, 'roomId', e.target.value)}
                    placeholder="Conference Room A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Interviewers */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewers
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {availableInterviewers.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No interviewers available
                    </p>
                  ) : (
                    availableInterviewers.map((interviewer) => (
                      <label
                        key={interviewer.id}
                        className="flex items-center py-1 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={slot.interviewerIds.includes(interviewer.id)}
                          onChange={() => toggleInterviewer(index, interviewer.id)}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {interviewer.firstName} {interviewer.lastName}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || slots.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : `Schedule ${slots.length} Interviews`}
          </button>
        </div>
      </form>
    </div>
  );
};
