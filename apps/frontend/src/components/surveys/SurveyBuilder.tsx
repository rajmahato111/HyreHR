import React, { useState } from 'react';
import {
  Survey,
  SurveyQuestion,
  SurveyTriggerType,
  SurveyQuestionType,
} from '../../types/survey';
import { surveysService } from '../../services/surveys';

interface SurveyBuilderProps {
  survey?: Survey;
  onSave: (survey: Survey) => void;
  onCancel: () => void;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  survey,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(survey?.name || '');
  const [description, setDescription] = useState(survey?.description || '');
  const [triggerType, setTriggerType] = useState<SurveyTriggerType>(
    survey?.triggerType || SurveyTriggerType.POST_APPLICATION,
  );
  const [sendDelayHours, setSendDelayHours] = useState(
    survey?.sendDelayHours || 0,
  );
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    survey?.questions || [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = (type: SurveyQuestionType) => {
    const newQuestion: SurveyQuestion = {
      id: `q_${Date.now()}`,
      type,
      question: '',
      required: false,
      order: questions.length,
      ...(type === SurveyQuestionType.MULTIPLE_CHOICE && { options: [''] }),
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated[index].order = index;
    updated[newIndex].order = newIndex;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        name,
        description,
        triggerType,
        sendDelayHours,
        questions,
        active: true,
      };

      const result = survey
        ? await surveysService.updateSurvey(survey.id, data)
        : await surveysService.createSurvey(data);

      onSave(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {survey ? 'Edit Survey' : 'Create Survey'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Survey Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Post-Interview Feedback"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Optional description of the survey purpose"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger Type *
              </label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as SurveyTriggerType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={SurveyTriggerType.POST_APPLICATION}>
                  After Application
                </option>
                <option value={SurveyTriggerType.POST_INTERVIEW}>
                  After Interview
                </option>
                <option value={SurveyTriggerType.POST_REJECTION}>
                  After Rejection
                </option>
                <option value={SurveyTriggerType.POST_OFFER}>After Offer</option>
                <option value={SurveyTriggerType.MANUAL}>Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send Delay (hours)
              </label>
              <input
                type="number"
                value={sendDelayHours}
                onChange={(e) => setSendDelayHours(parseInt(e.target.value))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Questions</h3>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => addQuestion(SurveyQuestionType.NPS)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + NPS
              </button>
              <button
                type="button"
                onClick={() => addQuestion(SurveyQuestionType.RATING)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Rating
              </button>
              <button
                type="button"
                onClick={() => addQuestion(SurveyQuestionType.TEXT)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Text
              </button>
              <button
                type="button"
                onClick={() => addQuestion(SurveyQuestionType.MULTIPLE_CHOICE)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Multiple Choice
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    {question.type.toUpperCase()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(index, { question: e.target.value })
                  }
                  placeholder="Enter your question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                />

                {question.type === SurveyQuestionType.MULTIPLE_CHOICE && (
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Options:</label>
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(question.options || [])];
                            newOptions[optIndex] = e.target.value;
                            updateQuestion(index, { options: newOptions });
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = question.options?.filter(
                              (_, i) => i !== optIndex,
                            );
                            updateQuestion(index, { options: newOptions });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...(question.options || []), ''];
                        updateQuestion(index, { options: newOptions });
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateQuestion(index, { required: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Required</span>
                </label>
              </div>
            ))}

            {questions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No questions yet. Click a button above to add one.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name || questions.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : survey ? 'Update Survey' : 'Create Survey'}
          </button>
        </div>
      </form>
    </div>
  );
};
