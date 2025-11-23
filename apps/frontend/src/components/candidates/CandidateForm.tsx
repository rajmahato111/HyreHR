import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateCandidateDto } from '../../types/candidate';
import candidatesService from '../../services/candidates';
import resumeParserService, { ParsedResumeData } from '../../services/resume-parser';

interface CandidateFormProps {
  initialData?: Partial<CreateCandidateDto>;
  onSubmit?: (candidate: any) => void;
  onCancel?: () => void;
}

export function CandidateForm({ initialData, onSubmit, onCancel }: CandidateFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [confidence, setConfidence] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [showConfidence, setShowConfidence] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateCandidateDto>>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: {
      city: '',
      state: '',
      country: '',
    },
    currentCompany: '',
    currentTitle: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    tags: [],
    gdprConsent: false,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (parsedData) {
      // Auto-populate form with parsed data
      setFormData((prev) => ({
        ...prev,
        email: parsedData.personalInfo.email || prev.email,
        firstName: parsedData.personalInfo.firstName || prev.firstName,
        lastName: parsedData.personalInfo.lastName || prev.lastName,
        phone: parsedData.personalInfo.phone || prev.phone,
        location: {
          city: parsedData.personalInfo.location?.city || prev.location?.city || '',
          state: parsedData.personalInfo.location?.state || prev.location?.state || '',
          country: parsedData.personalInfo.location?.country || prev.location?.country || '',
        },
        currentCompany: parsedData.workExperience[0]?.company || prev.currentCompany,
        currentTitle: parsedData.workExperience[0]?.title || prev.currentTitle,
        linkedinUrl: parsedData.personalInfo.linkedinUrl || prev.linkedinUrl,
        githubUrl: parsedData.personalInfo.githubUrl || prev.githubUrl,
        portfolioUrl: parsedData.personalInfo.portfolioUrl || prev.portfolioUrl,
        tags: parsedData.skills.slice(0, 10),
      }));
    }
  }, [parsedData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setErrors({});

    try {
      const result = await resumeParserService.parseResume(file);
      setParsedData(result.data.parsedData);
      setConfidence(result.data.parsedData.confidence);
      setFileUrl(result.data.fileUrl);
      setShowConfidence(true);
    } catch (error: any) {
      setErrors({ file: error.response?.data?.message || 'Failed to parse resume' });
    } finally {
      setParsing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateCandidateDto] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const candidateData: CreateCandidateDto = {
        email: formData.email!,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        phone: formData.phone,
        location: formData.location,
        currentCompany: formData.currentCompany,
        currentTitle: formData.currentTitle,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
        tags: formData.tags,
        source: {
          type: parsedData ? 'resume_upload' : 'manual',
          details: parsedData ? {
            resumeParsed: true,
            parsingConfidence: confidence?.overall,
            parsedAt: new Date().toISOString(),
          } : {},
        },
        gdprConsent: formData.gdprConsent,
        customFields: parsedData ? {
          skills: parsedData.skills,
          workExperience: parsedData.workExperience,
          education: parsedData.education,
          certifications: parsedData.certifications,
          summary: parsedData.summary,
          resumeUrls: fileUrl ? [fileUrl] : [],
        } : {},
      };

      const candidate = await candidatesService.createCandidate(candidateData);
      
      if (onSubmit) {
        onSubmit(candidate);
      } else {
        navigate(`/candidates/${candidate.id}`);
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ email: 'A candidate with this email already exists' });
      } else {
        setErrors({ submit: error.response?.data?.message || 'Failed to create candidate' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resume Upload */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Upload (Optional)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Resume
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={parsing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {parsing && (
              <p className="mt-2 text-sm text-blue-600">Parsing resume...</p>
            )}
            {errors.file && (
              <p className="mt-2 text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Confidence Scores */}
          {showConfidence && confidence && (
            <div className={`p-4 rounded-md ${getConfidenceBgColor(confidence.overall)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Parsing Confidence</h4>
                <button
                  type="button"
                  onClick={() => setShowConfidence(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall:</span>
                  <span className={`font-medium ${getConfidenceColor(confidence.overall)}`}>
                    {confidence.overall}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Personal Info:</span>
                  <span className={`font-medium ${getConfidenceColor(confidence.personalInfo)}`}>
                    {confidence.personalInfo}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Work Experience:</span>
                  <span className={`font-medium ${getConfidenceColor(confidence.workExperience)}`}>
                    {confidence.workExperience}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Education:</span>
                  <span className={`font-medium ${getConfidenceColor(confidence.education)}`}>
                    {confidence.education}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Skills:</span>
                  <span className={`font-medium ${getConfidenceColor(confidence.skills)}`}>
                    {confidence.skills}%
                  </span>
                </div>
              </div>
              {parsedData?.needsManualReview && (
                <p className="mt-2 text-sm text-yellow-700">
                  ⚠️ Please review and correct the auto-populated fields below
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="location.city"
              value={formData.location?.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="location.state"
              value={formData.location?.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="location.country"
              value={formData.location?.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Current Position */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Position</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              name="currentCompany"
              value={formData.currentCompany}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="currentTitle"
              value={formData.currentTitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio URL
            </label>
            <input
              type="url"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tags / Skills</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags?.join(', ')}
            onChange={handleTagsChange}
            placeholder="JavaScript, React, Node.js"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter skills or tags separated by commas
          </p>
        </div>
      </div>

      {/* GDPR Consent */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-start">
          <input
            type="checkbox"
            name="gdprConsent"
            checked={formData.gdprConsent}
            onChange={handleChange}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Candidate has provided GDPR consent for data processing
          </label>
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel || (() => navigate('/candidates'))}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Candidate'}
        </button>
      </div>
    </form>
  );
}
