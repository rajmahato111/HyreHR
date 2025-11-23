import React, { useState, useEffect } from 'react';
import { ApplicationForm, PublicJob, ApplicationSubmission } from '../../types/career-site';
import { careerSiteService } from '../../services/career-site';

interface PublicApplicationFormProps {
  slug: string;
  jobId: string;
}

export const PublicApplicationForm: React.FC<PublicApplicationFormProps> = ({ slug, jobId }) => {
  const [job, setJob] = useState<PublicJob | null>(null);
  const [form, setForm] = useState<ApplicationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    coverLetter: '',
    customFields: {},
    screeningAnswers: [],
    eeoData: {},
  });

  useEffect(() => {
    loadJobAndForm();
  }, [slug, jobId]);

  const loadJobAndForm = async () => {
    setLoading(true);
    try {
      const [jobData, formData] = await Promise.all([
        careerSiteService.getPublicJob(slug, jobId),
        careerSiteService.getPublicApplicationForm(slug, jobId),
      ]);
      setJob(jobData);
      setForm(formData);
    } catch (error) {
      console.error('Failed to load job and form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submission: ApplicationSubmission = {
        jobId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        resumeUrl: formData.resumeUrl,
        coverLetter: formData.coverLetter,
        customFields: formData.customFields,
        screeningAnswers: formData.screeningAnswers,
        eeoData: formData.eeoData,
        source: 'career_site',
      };

      await careerSiteService.submitApplication(slug, submission);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateCustomField = (fieldId: string, value: any) => {
    setFormData({
      ...formData,
      customFields: {
        ...formData.customFields,
        [fieldId]: value,
      },
    });
  };

  const updateScreeningAnswer = (questionId: string, answer: any) => {
    const existingIndex = formData.screeningAnswers.findIndex(
      (a: any) => a.questionId === questionId,
    );
    const newAnswers = [...formData.screeningAnswers];

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId, answer };
    } else {
      newAnswers.push({ questionId, answer });
    }

    setFormData({
      ...formData,
      screeningAnswers: newAnswers,
    });
  };

  const updateEEOData = (questionId: string, value: string) => {
    setFormData({
      ...formData,
      eeoData: {
        ...formData.eeoData,
        [questionId]: value,
      },
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading application form...</div>;
  }

  if (!job || !form) {
    return <div className="p-8 text-center">Application form not found</div>;
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-gray-700 mb-4">
            Thank you for applying to {job.title}. We've received your application and will
            review it shortly.
          </p>
          <p className="text-sm text-gray-600">
            You'll receive an email confirmation at {formData.email}
          </p>
          <button
            onClick={() => (window.location.href = `/careers/${slug}`)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View More Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Apply for {job.title}</h1>
        <p className="text-gray-600">
          {job.department} • {job.locations?.map((l) => l.name).join(', ')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        {form.includeResume && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resume</h2>
            <div>
              <label className="block text-sm font-medium mb-2">
                Resume URL {form.includeResume && <span className="text-red-500">*</span>}
              </label>
              <input
                type="url"
                required={form.includeResume}
                value={formData.resumeUrl}
                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://example.com/resume.pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your resume to a cloud storage service and paste the link here
              </p>
            </div>
          </div>
        )}

        {/* Cover Letter */}
        {form.includeCoverLetter && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cover Letter</h2>
            <textarea
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={6}
              placeholder="Tell us why you're interested in this position..."
            />
          </div>
        )}

        {/* Custom Fields */}
        {form.fields && form.fields.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="space-y-4">
              {form.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={formData.customFields[field.id] || ''}
                      onChange={(e) => updateCustomField(field.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData.customFields[field.id] || ''}
                      onChange={(e) => updateCustomField(field.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData.customFields[field.id] || ''}
                      onChange={(e) => updateCustomField(field.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screening Questions */}
        {form.screeningQuestions && form.screeningQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Screening Questions</h2>
            <div className="space-y-4">
              {form.screeningQuestions.map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium mb-2">
                    {question.question}
                    {question.required && <span className="text-red-500">*</span>}
                  </label>
                  {question.type === 'boolean' ? (
                    <div className="space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          required={question.required}
                          name={question.id}
                          value="yes"
                          onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          required={question.required}
                          name={question.id}
                          value="no"
                          onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  ) : question.type === 'select' ? (
                    <select
                      required={question.required}
                      onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select an option</option>
                      {question.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required={question.required}
                      onChange={(e) => updateScreeningAnswer(question.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EEO Questionnaire */}
        {form.includeEEO && form.eeoConfig && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Equal Employment Opportunity (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We are an equal opportunity employer. This information is voluntary and will be
              kept confidential. It will not affect your application.
            </p>
            <div className="space-y-4">
              {form.eeoConfig.questions.map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium mb-2">{question.question}</label>
                  <select
                    value={formData.eeoData[question.id] || ''}
                    onChange={(e) => updateEEOData(question.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};
