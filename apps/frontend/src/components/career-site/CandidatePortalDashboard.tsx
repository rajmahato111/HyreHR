import React, { useState, useEffect } from 'react';
import { careerSiteService } from '../../services/career-site';

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    department: string;
    locations: string;
  };
  stage: {
    id: string;
    name: string;
  };
  status: string;
  appliedAt: string;
  stageEnteredAt: string;
}

interface Interview {
  id: string;
  job: {
    id: string;
    title: string;
  };
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  locationType: string;
  locationDetails?: string;
  meetingLink?: string;
  interviewers: Array<{
    name: string;
    role: string;
  }>;
}

interface CandidatePortalDashboardProps {
  candidate: any;
  onLogout: () => void;
}

export const CandidatePortalDashboard: React.FC<CandidatePortalDashboardProps> = ({
  candidate,
  onLogout,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'interviews' | 'documents'>(
    'applications',
  );
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, interviewsData] = await Promise.all([
        careerSiteService.getCandidateApplications(),
        careerSiteService.getCandidateInterviews(),
      ]);
      setApplications(appsData);
      setInterviews(interviewsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentUrl) return;

    setUploadingDocument(true);
    try {
      await careerSiteService.uploadCandidateDocument('resume', documentUrl);
      setDocumentUrl('');
      alert('Document uploaded successfully');
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingDocument(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidate Portal</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {candidate.firstName} {candidate.lastName}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['applications', 'interviews', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Applications</h2>
            {applications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                You haven't applied to any positions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{app.job.title}</h3>
                        <p className="text-sm text-gray-600">
                          {app.job.department} • {app.job.locations}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Stage</p>
                        <p className="font-medium">{app.stage.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Applied On</p>
                        <p className="font-medium">{formatDate(app.appliedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Interviews</h2>
            {interviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                No interviews scheduled yet.
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{interview.job.title}</h3>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(interview.scheduledAt)} • {interview.durationMinutes}{' '}
                          minutes
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}
                      >
                        {interview.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium capitalize">{interview.locationType}</p>
                      </div>
                      {interview.meetingLink && (
                        <div>
                          <p className="text-gray-600">Meeting Link</p>
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                      {interview.locationDetails && (
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium">{interview.locationDetails}</p>
                        </div>
                      )}
                      {interview.interviewers && interview.interviewers.length > 0 && (
                        <div>
                          <p className="text-gray-600">Interviewers</p>
                          <ul className="list-disc list-inside">
                            {interview.interviewers.map((interviewer, idx) => (
                              <li key={idx} className="font-medium">
                                {interviewer.name} ({interviewer.role})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Documents</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Additional Documents</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your resume, cover letter, or other supporting documents
              </p>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleUploadDocument}
                  disabled={!documentUrl || uploadingDocument}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingDocument ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload your document to a cloud storage service and paste the link here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
