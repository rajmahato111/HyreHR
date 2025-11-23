import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { talentPoolsService } from '../../services/talent-pools';
import { TalentPoolType, CreateTalentPoolDto } from '../../types/talent-pool';

export const TalentPoolWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTalentPoolDto>({
    name: '',
    description: '',
    type: TalentPoolType.STATIC,
    tags: [],
  });

  const [criteriaForm, setCriteriaForm] = useState({
    skills: '',
    experienceMin: '',
    experienceMax: '',
    location: '',
    tags: '',
    currentTitle: '',
    currentCompany: '',
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Build criteria for dynamic pools
      const criteria =
        formData.type === TalentPoolType.DYNAMIC
          ? {
              skills: criteriaForm.skills
                ? criteriaForm.skills.split(',').map((s) => s.trim())
                : undefined,
              experience:
                criteriaForm.experienceMin || criteriaForm.experienceMax
                  ? {
                      min: criteriaForm.experienceMin
                        ? parseInt(criteriaForm.experienceMin)
                        : undefined,
                      max: criteriaForm.experienceMax
                        ? parseInt(criteriaForm.experienceMax)
                        : undefined,
                    }
                  : undefined,
              location: criteriaForm.location
                ? criteriaForm.location.split(',').map((l) => l.trim())
                : undefined,
              tags: criteriaForm.tags
                ? criteriaForm.tags.split(',').map((t) => t.trim())
                : undefined,
              currentTitle: criteriaForm.currentTitle || undefined,
              currentCompany: criteriaForm.currentCompany || undefined,
            }
          : undefined;

      const pool = await talentPoolsService.createTalentPool({
        ...formData,
        criteria,
      });

      navigate(`/talent-pools/${pool.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create talent pool');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pool Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Senior Engineers, Marketing Leads"
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
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the purpose of this talent pool..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pool Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: TalentPoolType.STATIC })}
            className={`p-4 border-2 rounded-lg text-left ${
              formData.type === TalentPoolType.STATIC
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Static Pool</div>
            <div className="text-sm text-gray-600 mt-1">
              Manually add and remove candidates
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: TalentPoolType.DYNAMIC })}
            className={`p-4 border-2 rounded-lg text-left ${
              formData.type === TalentPoolType.DYNAMIC
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Dynamic Pool</div>
            <div className="text-sm text-gray-600 mt-1">
              Auto-update based on criteria
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags?.join(', ')}
          onChange={(e) =>
            setFormData({
              ...formData,
              tags: e.target.value.split(',').map((t) => t.trim()),
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., engineering, senior, remote"
        />
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (formData.type === TalentPoolType.STATIC) {
      return (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Static Pool Created
          </h3>
          <p className="text-gray-600">
            You can add candidates to this pool after creation
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Define criteria to automatically include candidates in this pool.
            The pool will update as candidates match these criteria.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={criteriaForm.skills}
              onChange={(e) =>
                setCriteriaForm({ ...criteriaForm, skills: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., React, Node.js, Python"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (comma-separated)
            </label>
            <input
              type="text"
              value={criteriaForm.location}
              onChange={(e) =>
                setCriteriaForm({ ...criteriaForm, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., San Francisco, New York"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Years of Experience
            </label>
            <input
              type="number"
              value={criteriaForm.experienceMin}
              onChange={(e) =>
                setCriteriaForm({
                  ...criteriaForm,
                  experienceMin: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Years of Experience
            </label>
            <input
              type="number"
              value={criteriaForm.experienceMax}
              onChange={(e) =>
                setCriteriaForm({
                  ...criteriaForm,
                  experienceMax: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="20"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Title
          </label>
          <input
            type="text"
            value={criteriaForm.currentTitle}
            onChange={(e) =>
              setCriteriaForm({ ...criteriaForm, currentTitle: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Senior Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Company
          </label>
          <input
            type="text"
            value={criteriaForm.currentCompany}
            onChange={(e) =>
              setCriteriaForm({
                ...criteriaForm,
                currentCompany: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Google, Microsoft"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={criteriaForm.tags}
            onChange={(e) =>
              setCriteriaForm({ ...criteriaForm, tags: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., remote, senior"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Talent Pool
          </h1>
          <div className="flex items-center mt-4">
            <div
              className={`flex items-center ${
                step >= 1 ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Basic Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-4" />
            <div
              className={`flex items-center ${
                step >= 2 ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Criteria</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mb-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 1) {
                navigate('/talent-pools');
              } else {
                setStep(step - 1);
              }
            }}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex gap-2">
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
            {step === 2 && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Pool'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentPoolWizard;
