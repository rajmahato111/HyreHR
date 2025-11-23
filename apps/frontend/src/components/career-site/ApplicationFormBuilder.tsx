import React, { useState, useEffect } from 'react';
import { ApplicationForm, FormField, ScreeningQuestion } from '../../types/career-site';
import { careerSiteService } from '../../services/career-site';

interface ApplicationFormBuilderProps {
  formId?: string;
  jobId?: string;
  onSave?: (form: ApplicationForm) => void;
}

export const ApplicationFormBuilder: React.FC<ApplicationFormBuilderProps> = ({
  formId,
  jobId,
  onSave,
}) => {
  const [form, setForm] = useState<Partial<ApplicationForm>>({
    name: '',
    jobId,
    isDefault: false,
    fields: [],
    screeningQuestions: [],
    includeResume: true,
    includeCoverLetter: false,
    includeEEO: true,
    eeoConfig: {
      voluntary: true,
      questions: [
        {
          id: 'gender',
          question: 'Gender',
          options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
        },
        {
          id: 'ethnicity',
          question: 'Ethnicity',
          options: [
            'White',
            'Black or African American',
            'Hispanic or Latino',
            'Asian',
            'Native American',
            'Pacific Islander',
            'Two or more races',
            'Prefer not to say',
          ],
        },
        {
          id: 'veteran',
          question: 'Veteran Status',
          options: ['Veteran', 'Not a veteran', 'Prefer not to say'],
        },
        {
          id: 'disability',
          question: 'Disability Status',
          options: ['Yes', 'No', 'Prefer not to say'],
        },
      ],
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const data = await careerSiteService.getApplicationForm(formId);
      setForm(data);
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedForm: ApplicationForm;
      if (formId) {
        savedForm = await careerSiteService.updateApplicationForm(formId, form);
      } else {
        savedForm = await careerSiteService.createApplicationForm(form);
      }
      onSave?.(savedForm);
    } catch (error) {
      console.error('Failed to save form:', error);
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: '',
      required: false,
      order: form.fields?.length || 0,
    };
    setForm({
      ...form,
      fields: [...(form.fields || []), newField],
    });
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields?.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const removeField = (id: string) => {
    setForm({
      ...form,
      fields: form.fields?.filter((f) => f.id !== id),
    });
  };

  const addScreeningQuestion = () => {
    const newQuestion: ScreeningQuestion = {
      id: `question-${Date.now()}`,
      question: '',
      type: 'text',
      required: false,
      order: form.screeningQuestions?.length || 0,
    };
    setForm({
      ...form,
      screeningQuestions: [...(form.screeningQuestions || []), newQuestion],
    });
  };

  const updateScreeningQuestion = (id: string, updates: Partial<ScreeningQuestion>) => {
    setForm({
      ...form,
      screeningQuestions: form.screeningQuestions?.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    });
  };

  const removeScreeningQuestion = (id: string) => {
    setForm({
      ...form,
      screeningQuestions: form.screeningQuestions?.filter((q) => q.id !== id),
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {formId ? 'Edit Application Form' : 'Create Application Form'}
        </h1>
        <p className="text-gray-600">
          Customize the application form for candidates to fill out
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Form Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Form Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Standard Application Form"
            />
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.isDefault || false}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="mr-2"
            />
            <span>Set as default form for all jobs</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.includeResume || false}
                onChange={(e) => setForm({ ...form, includeResume: e.target.checked })}
                className="mr-2"
              />
              <span>Require resume upload</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.includeCoverLetter || false}
                onChange={(e) => setForm({ ...form, includeCoverLetter: e.target.checked })}
                className="mr-2"
              />
              <span>Include cover letter field</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.includeEEO || false}
                onChange={(e) => setForm({ ...form, includeEEO: e.target.checked })}
                className="mr-2"
              />
              <span>Include EEO questionnaire (voluntary)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Custom Fields */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Custom Fields</h2>
          <button
            onClick={addField}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Field
          </button>
        </div>
        <div className="space-y-4">
          {form.fields?.map((field) => (
            <div key={field.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Field Label</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., LinkedIn Profile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Field Type</label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(field.id, { type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Dropdown</option>
                    <option value="multiselect">Multi-select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                    <option value="file">File Upload</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              </div>
              {(field.type === 'select' ||
                field.type === 'multiselect' ||
                field.type === 'radio') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={field.options?.join(', ') || ''}
                    onChange={(e) =>
                      updateField(field.id, {
                        options: e.target.value.split(',').map((o) => o.trim()),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="mr-2"
                  />
                  <span>Required field</span>
                </label>
                <button
                  onClick={() => removeField(field.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screening Questions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Screening Questions</h2>
          <button
            onClick={addScreeningQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Question
          </button>
        </div>
        <div className="space-y-4">
          {form.screeningQuestions?.map((question) => (
            <div key={question.id} className="border rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Question</label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) =>
                    updateScreeningQuestion(question.id, { question: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Are you authorized to work in the US?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Type</label>
                  <select
                    value={question.type}
                    onChange={(e) =>
                      updateScreeningQuestion(question.id, { type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="text">Text</option>
                    <option value="boolean">Yes/No</option>
                    <option value="select">Dropdown</option>
                    <option value="multiselect">Multi-select</option>
                  </select>
                </div>
                {(question.type === 'select' || question.type === 'multiselect') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={question.options?.join(', ') || ''}
                      onChange={(e) =>
                        updateScreeningQuestion(question.id, {
                          options: e.target.value.split(',').map((o) => o.trim()),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Option 1, Option 2"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) =>
                      updateScreeningQuestion(question.id, { required: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span>Required question</span>
                </label>
                <button
                  onClick={() => removeScreeningQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Form'}
        </button>
      </div>
    </div>
  );
};
