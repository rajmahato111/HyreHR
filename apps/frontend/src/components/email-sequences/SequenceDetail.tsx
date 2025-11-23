import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emailSequencesService } from '../../services/email-sequences';
import {
  EmailSequence,
  SequenceEnrollment,
  SequencePerformance,
  SequenceStatus,
  EnrollmentStatus,
} from '../../types/email-sequence';

export const SequenceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState<EmailSequence | null>(null);
  const [enrollments, setEnrollments] = useState<SequenceEnrollment[]>([]);
  const [performance, setPerformance] = useState<SequencePerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrollments' | 'performance'>('enrollments');

  useEffect(() => {
    if (id) {
      loadSequenceData();
    }
  }, [id]);

  const loadSequenceData = async () => {
    try {
      setLoading(true);
      const [sequenceData, enrollmentsData, performanceData] = await Promise.all([
        emailSequencesService.getSequence(id!),
        emailSequencesService.getEnrollments(id!),
        emailSequencesService.getSequencePerformance(id!),
      ]);
      setSequence(sequenceData);
      setEnrollments(enrollmentsData);
      setPerformance(performanceData);
    } catch (err: any) {
      alert(err.message || 'Failed to load sequence');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!sequence) return;

    const newStatus =
      sequence.status === SequenceStatus.ACTIVE
        ? SequenceStatus.PAUSED
        : SequenceStatus.ACTIVE;

    try {
      const updated = await emailSequencesService.updateSequence(sequence.id, {
        status: newStatus,
      });
      setSequence(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update sequence status');
    }
  };

  const handleUnenroll = async (candidateId: string) => {
    if (!sequence) return;

    if (!confirm('Are you sure you want to unenroll this candidate?')) {
      return;
    }

    try {
      await emailSequencesService.unenrollCandidate(sequence.id, candidateId);
      setEnrollments(enrollments.filter((e) => e.candidateId !== candidateId));
    } catch (err: any) {
      alert(err.message || 'Failed to unenroll candidate');
    }
  };

  if (loading || !sequence) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{sequence.name}</h1>
              <span
                className={`px-3 py-1 text-sm rounded ${
                  sequence.status === SequenceStatus.ACTIVE
                    ? 'bg-green-100 text-green-700'
                    : sequence.status === SequenceStatus.DRAFT
                    ? 'bg-gray-100 text-gray-700'
                    : sequence.status === SequenceStatus.PAUSED
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {sequence.status}
              </span>
            </div>
            {sequence.description && (
              <p className="text-gray-600 mt-2">{sequence.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-lg ${
                sequence.status === SequenceStatus.ACTIVE
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {sequence.status === SequenceStatus.ACTIVE ? 'Pause' : 'Activate'}
            </button>
            <button
              onClick={() => navigate(`/email-sequences/${sequence.id}/edit`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {sequence.steps.length}
            </div>
            <div className="text-sm text-gray-600">Steps</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {sequence.totalEnrolled}
            </div>
            <div className="text-sm text-gray-600">Enrolled</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {sequence.openRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Open Rate</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {sequence.replyRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Reply Rate</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">
              {sequence.totalCompleted}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Steps Preview */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Sequence Steps</h3>
          <div className="space-y-2">
            {sequence.steps.map((step, index) => (
              <div
                key={step.order}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {step.order}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{step.subject}</div>
                  {index > 0 && (
                    <div className="text-xs text-gray-500">
                      Wait {step.delayDays}d {step.delayHours}h after previous step
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'enrollments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Enrollments ({enrollments.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 border-b-2 ${
              activeTab === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Performance
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'enrollments' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No candidates enrolled yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {enrollment.candidate?.firstName} {enrollment.candidate?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {enrollment.candidate?.email}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            enrollment.status === EnrollmentStatus.ACTIVE
                              ? 'bg-green-100 text-green-700'
                              : enrollment.status === EnrollmentStatus.COMPLETED
                              ? 'bg-blue-100 text-blue-700'
                              : enrollment.status === EnrollmentStatus.PAUSED
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {enrollment.status}
                        </span>
                        <span>Step {enrollment.currentStep + 1} of {sequence.steps.length}</span>
                        <span>•</span>
                        <span>{enrollment.emailsSent} sent</span>
                        <span>•</span>
                        <span>{enrollment.emailsOpened} opened</span>
                        {enrollment.repliedAt && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">Replied</span>
                          </>
                        )}
                      </div>
                    </div>
                    {enrollment.status === EnrollmentStatus.ACTIVE && (
                      <button
                        onClick={() => handleUnenroll(enrollment.candidateId)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Unenroll
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance' && performance && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Email Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Open Rate</span>
                <span className="font-semibold">{performance.openRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reply Rate</span>
                <span className="font-semibold">{performance.replyRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {performance.completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-semibold">
                  {performance.averageResponseTime.toFixed(1)} days
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Response Sentiment
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Interested</span>
                <span className="font-semibold text-green-600">
                  {performance.sentimentBreakdown.interested}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Not Interested</span>
                <span className="font-semibold text-red-600">
                  {performance.sentimentBreakdown.notInterested}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Neutral</span>
                <span className="font-semibold text-gray-600">
                  {performance.sentimentBreakdown.neutral}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enrollment Status
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {performance.totalEnrolled}
                </div>
                <div className="text-sm text-gray-600">Total Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {enrollments.filter((e) => e.status === EnrollmentStatus.ACTIVE).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performance.totalCompleted}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {enrollments.filter((e) => e.status === EnrollmentStatus.UNSUBSCRIBED).length}
                </div>
                <div className="text-sm text-gray-600">Unsubscribed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceDetail;
