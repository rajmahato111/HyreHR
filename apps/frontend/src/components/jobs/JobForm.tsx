import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Job,
  CreateJobDto,
  UpdateJobDto,
  JobStatus,
  EmploymentType,
  SeniorityLevel,
} from '../../types/job';

interface JobFormProps {
  job?: Job;
  onSubmit: (data: CreateJobDto | UpdateJobDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function JobForm({ job, onSubmit, onCancel, isLoading }: JobFormProps) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateJobDto>({
    title: job?.title || '',
    description: job?.description || '',
    departmentId: job?.departmentId || '',
    locationIds: job?.locations?.map((l) => l.id) || [],
    ownerId: job?.ownerId || '',
    status: job?.status || JobStatus.DRAFT,
    employmentType: job?.employmentType || EmploymentType.FULL_TIME,
    seniorityLevel: job?.seniorityLevel,
    remoteOk: job?.remoteOk || false,
    salaryMin: job?.salaryMin,
    salaryMax: job?.salaryMax,
    salaryCurrency: job?.salaryCurrency || 'USD',
    requisitionId: job?.requisitionId || '',
    confidential: job?.confidential || false,
    interviewPlanId: job?.interviewPlanId || '',
    customFields: job?.customFields || {},
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.employmentType) {
      newErrors.employmentType = 'Employment type is required';
    }

    if (formData.salaryMin && formData.salaryMax) {
      if (formData.salaryMin > formData.salaryMax) {
        newErrors.salaryMax = 'Maximum salary must be greater than minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Clean up the form data - remove empty optional UUID fields
      const cleanedData = { ...formData };
      if (!cleanedData.departmentId || cleanedData.departmentId.trim() === '') {
        delete cleanedData.departmentId;
      }
      if (!cleanedData.ownerId || cleanedData.ownerId.trim() === '') {
        delete cleanedData.ownerId;
      }
      if (!cleanedData.interviewPlanId || cleanedData.interviewPlanId.trim() === '') {
        delete cleanedData.interviewPlanId;
      }
      if (!cleanedData.locationIds || cleanedData.locationIds.length === 0) {
        delete cleanedData.locationIds;
      }

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const handleChange = (
    field: keyof CreateJobDto,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>

        <div className="space-y-4">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the role, responsibilities, and requirements..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Tip: Include key responsibilities, required skills, and qualifications
            </p>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) =>
                handleChange('employmentType', e.target.value as EmploymentType)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.employmentType ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value={EmploymentType.FULL_TIME}>Full-time</option>
              <option value={EmploymentType.PART_TIME}>Part-time</option>
              <option value={EmploymentType.CONTRACT}>Contract</option>
              <option value={EmploymentType.INTERNSHIP}>Internship</option>
            </select>
            {errors.employmentType && (
              <p className="mt-1 text-sm text-red-600">{errors.employmentType}</p>
            )}
          </div>

          {/* Seniority Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seniority Level
            </label>
            <select
              value={formData.seniorityLevel || ''}
              onChange={(e) =>
                handleChange(
                  'seniorityLevel',
                  e.target.value ? (e.target.value as SeniorityLevel) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select level...</option>
              <option value={SeniorityLevel.ENTRY}>Entry Level</option>
              <option value={SeniorityLevel.JUNIOR}>Junior</option>
              <option value={SeniorityLevel.MID}>Mid-Level</option>
              <option value={SeniorityLevel.SENIOR}>Senior</option>
              <option value={SeniorityLevel.LEAD}>Lead</option>
              <option value={SeniorityLevel.PRINCIPAL}>Principal</option>
              <option value={SeniorityLevel.EXECUTIVE}>Executive</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                handleChange('status', e.target.value as JobStatus)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={JobStatus.DRAFT}>Draft</option>
              <option value={JobStatus.OPEN}>Open</option>
              <option value={JobStatus.ON_HOLD}>On Hold</option>
              <option value={JobStatus.CLOSED}>Closed</option>
              <option value={JobStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location & Remote */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Location & Remote Work
        </h3>

        <div className="space-y-4">
          {/* Remote OK */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remoteOk"
              checked={formData.remoteOk}
              onChange={(e) => handleChange('remoteOk', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remoteOk"
              className="ml-2 block text-sm text-gray-700"
            >
              Remote work allowed
            </label>
          </div>

          {/* Department ID - Placeholder for now */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department ID
            </label>
            <input
              type="text"
              value={formData.departmentId}
              onChange={(e) => handleChange('departmentId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter department ID"
            />
            <p className="mt-1 text-sm text-gray-500">
              Department selector will be added in a future update
            </p>
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Compensation
        </h3>

        <div className="space-y-4">
          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={formData.salaryCurrency}
              onChange={(e) => handleChange('salaryCurrency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Salary
              </label>
              <input
                type="number"
                value={formData.salaryMin || ''}
                onChange={(e) =>
                  handleChange(
                    'salaryMin',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Salary
              </label>
              <input
                type="number"
                value={formData.salaryMax || ''}
                onChange={(e) =>
                  handleChange(
                    'salaryMax',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.salaryMax ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="100000"
              />
              {errors.salaryMax && (
                <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Settings
        </h3>

        <div className="space-y-4">
          {/* Requisition ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requisition ID
            </label>
            <input
              type="text"
              value={formData.requisitionId}
              onChange={(e) => handleChange('requisitionId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="REQ-2024-001"
            />
          </div>

          {/* Confidential */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="confidential"
              checked={formData.confidential}
              onChange={(e) => handleChange('confidential', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="confidential"
              className="ml-2 block text-sm text-gray-700"
            >
              Confidential job posting (internal only)
            </label>
          </div>

          {/* Owner ID - Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hiring Manager ID
            </label>
            <input
              type="text"
              value={formData.ownerId}
              onChange={(e) => handleChange('ownerId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter hiring manager ID"
            />
            <p className="mt-1 text-sm text-gray-500">
              User selector will be added in a future update
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 bg-white rounded-lg shadow p-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
