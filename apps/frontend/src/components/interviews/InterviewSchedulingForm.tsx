import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviews';
import { LocationType, TimeSlot, User } from '../../types/interview';

interface InterviewSchedulingFormProps {
  applicationId: string;
  onSuccess?: (interview: any) => void;
  onCancel?: () => void;
}

export const InterviewSchedulingForm: React.FC<InterviewSchedulingFormProps> = ({
  applicationId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    interviewStageId: '',
    scheduledAt: '',
    durationMinutes: 60,
    locationType: 'video' as LocationType,
    locationDetails: '',
    meetingLink: '',
    roomId: '',
    participants: [] as Array<{ userId: string; role: 'interviewer' | 'coordinator' | 'observer' }>,
  });

  const [interviewStages, setInterviewStages] = useState<any[]>([]);
  const [availableInterviewers, setAvailableInterviewers] = useState<User[]>([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);

  useEffect(() => {
    loadInterviewStages();
    loadInterviewers();
  }, []);

  const loadInterviewStages = async () => {
    try {
      // In a real implementation, this would fetch stages for the job's interview plan
      const stages = await interviewService.getInterviewStages('');
      setInterviewStages(stages);
    } catch (err) {
      console.error('Failed to load interview stages:', err);
    }
  };

  const loadInterviewers = async () => {
    try {
      // In a real implementation, this would fetch users with interviewer role
      // For now, we'll use a placeholder
      setAvailableInterviewers([]);
    } catch (err) {
      console.error('Failed to load interviewers:', err);
    }
  };

  const handleInterviewerToggle = (userId: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const checkAvailability = async () => {
    if (selectedInterviewers.length === 0) {
      setError('Please select at least one interviewer');
      return;
    }

    setLoadingAvailability(true);
    setError(null);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // Next 2 weeks

      const slots = await interviewService.findCommonAvailability(
        selectedInterviewers,
        startDate.toISOString(),
        endDate.toISOString(),
        formData.durationMinutes
      );

      setAvailableSlots(slots);
      setShowAvailability(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check availability');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setFormData((prev) => ({
      ...prev,
      scheduledAt: slot.start,
    }));
    setShowAvailability(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const participants = selectedInterviewers.map((userId) => ({
        userId,
        role: 'interviewer' as const,
      }));

      const interview = await interviewService.createInterview({
        applicationId,
        ...formData,
        participants,
      });

      onSuccess?.(interview);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Schedule Interview</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interview Stage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Stage (Optional)
          </label>
          <select
            value={formData.interviewStageId}
            onChange={(e) =>
              setFormData({ ...formData, interviewStageId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a stage</option>
            {interviewStages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name} ({stage.durationMinutes} min)
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationMinutes: parseInt(e.target.value),
              })
            }
            min="15"
            step="15"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Type
          </label>
          <div className="space-y-2">
            {(['phone', 'video', 'onsite'] as LocationType[]).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  value={type}
                  checked={formData.locationType === type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationType: e.target.value as LocationType,
                    })
                  }
                  className="mr-2"
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Details */}
        {formData.locationType === 'phone' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.locationDetails}
              onChange={(e) =>
                setFormData({ ...formData, locationDetails: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {formData.locationType === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) =>
                setFormData({ ...formData, meetingLink: e.target.value })
              }
              placeholder="https://zoom.us/j/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {formData.locationType === 'onsite' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room / Location
            </label>
            <input
              type="text"
              value={formData.locationDetails}
              onChange={(e) =>
                setFormData({ ...formData, locationDetails: e.target.value })
              }
              placeholder="Conference Room A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Interviewers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Interviewers
          </label>
          <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
            {availableInterviewers.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No interviewers available. Please add users with interviewer role.
              </p>
            ) : (
              availableInterviewers.map((interviewer) => (
                <label
                  key={interviewer.id}
                  className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedInterviewers.includes(interviewer.id)}
                    onChange={() => handleInterviewerToggle(interviewer.id)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">
                      {interviewer.firstName} {interviewer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {interviewer.email}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Check Availability Button */}
        {selectedInterviewers.length > 0 && (
          <div>
            <button
              type="button"
              onClick={checkAvailability}
              disabled={loadingAvailability}
              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
            >
              {loadingAvailability
                ? 'Checking Availability...'
                : 'Check Interviewer Availability'}
            </button>
          </div>
        )}

        {/* Available Slots */}
        {showAvailability && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots
            </label>
            <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto">
              {availableSlots.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No common availability found. Try selecting different interviewers or a different duration.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSlotSelect(slot)}
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300"
                    >
                      <div className="font-medium">{slot.startFormatted}</div>
                      <div className="text-sm text-gray-500">
                        {slot.endFormatted}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Date/Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scheduled Date & Time
            {formData.scheduledAt && ' (Selected from availability)'}
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledAt ? formData.scheduledAt.slice(0, 16) : ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                scheduledAt: new Date(e.target.value).toISOString(),
              })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            disabled={loading || selectedInterviewers.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </form>
    </div>
  );
};
