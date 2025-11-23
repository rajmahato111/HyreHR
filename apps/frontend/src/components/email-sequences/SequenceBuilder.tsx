import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { emailSequencesService } from '../../services/email-sequences';
import {
  CreateEmailSequenceDto,
  SequenceStep,
} from '../../types/email-sequence';

export const SequenceBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEmailSequenceDto>({
    name: '',
    description: '',
    steps: [
      {
        order: 1,
        subject: '',
        body: '',
        delayDays: 0,
        delayHours: 0,
      },
    ],
  });

  useEffect(() => {
    if (id) {
      loadSequence();
    }
  }, [id]);

  const loadSequence = async () => {
    try {
      setLoading(true);
      const sequence = await emailSequencesService.getSequence(id!);
      setFormData({
        name: sequence.name,
        description: sequence.description,
        steps: sequence.steps,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to load sequence');
      navigate('/email-sequences');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('Please enter a sequence name');
      return;
    }

    if (formData.steps.length === 0) {
      alert('Please add at least one step');
      return;
    }

    if (formData.steps.some((s) => !s.subject || !s.body)) {
      alert('All steps must have a subject and body');
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await emailSequencesService.updateSequence(id, formData);
      } else {
        const sequence = await emailSequencesService.createSequence(formData);
        navigate(`/email-sequences/${sequence.id}`);
        return;
      }
      navigate(`/email-sequences/${id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to save sequence');
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          order: formData.steps.length + 1,
          subject: '',
          body: '',
          delayDays: 1,
          delayHours: 0,
        },
      ],
    });
  };

  const removeStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    // Renumber steps
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const updateStep = (index: number, updates: Partial<SequenceStep>) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setFormData({ ...formData, steps: newSteps });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];

    // Renumber steps
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });

    setFormData({ ...formData, steps: newSteps });
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {id ? 'Edit' : 'Create'} Email Sequence
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sequence Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Senior Engineer Outreach"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the purpose of this sequence..."
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {formData.steps.map((step, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {step.order}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Step {step.order}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === formData.steps.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {formData.steps.length > 1 && (
                  <button
                    onClick={() => removeStep(index)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {index > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Wait{' '}
                    {step.delayDays > 0 && `${step.delayDays} day${step.delayDays > 1 ? 's' : ''}`}
                    {step.delayDays > 0 && step.delayHours > 0 && ' and '}
                    {step.delayHours > 0 && `${step.delayHours} hour${step.delayHours > 1 ? 's' : ''}`}
                    {' '}after previous step
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Days
                    </label>
                    <input
                      type="number"
                      value={step.delayDays}
                      onChange={(e) =>
                        updateStep(index, {
                          delayDays: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Hours
                    </label>
                    <input
                      type="number"
                      value={step.delayHours}
                      onChange={(e) =>
                        updateStep(index, {
                          delayHours: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      max="23"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  value={step.subject}
                  onChange={(e) =>
                    updateStep(index, { subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Exciting opportunity at [Company]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body *
                </label>
                <textarea
                  value={step.body}
                  onChange={(e) => updateStep(index, { body: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Hi {{firstName}},&#10;&#10;I came across your profile and was impressed by your experience with {{skills}}.&#10;&#10;We're looking for talented engineers to join our team at {{company}}..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variables: {'{'}
                  {'{'}firstName{'}'}
                  {'}'}, {'{'}
                  {'{'}lastName{'}'}
                  {'}'}, {'{'}
                  {'{'}company{'}'}
                  {'}'}, {'{'}
                  {'{'}jobTitle{'}'}
                  {'}'}
                </p>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addStep}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Step
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6">
        <button
          onClick={() => navigate('/email-sequences')}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : id ? 'Save Changes' : 'Create Sequence'}
        </button>
      </div>
    </div>
  );
};

export default SequenceBuilder;
