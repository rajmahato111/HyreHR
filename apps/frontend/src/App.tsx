import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { JobsPage } from './pages/JobsPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { EditJobPage } from './pages/EditJobPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { PipelinePage } from './pages/PipelinePage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import { CreateCandidatePage } from './pages/CreateCandidatePage';
import { InterviewsPage } from './pages/InterviewsPage';
import CandidateSchedulingPage from './pages/CandidateSchedulingPage';
import RescheduleInterviewPage from './pages/RescheduleInterviewPage';
import { TalentPoolsPage } from './pages/TalentPoolsPage';
import { CreateTalentPoolPage } from './pages/CreateTalentPoolPage';
import { TalentPoolDetailPage } from './pages/TalentPoolDetailPage';
import { EmailSequencesPage } from './pages/EmailSequencesPage';
import { CreateEmailSequencePage } from './pages/CreateEmailSequencePage';
import { EmailSequenceDetailPage } from './pages/EmailSequenceDetailPage';
import { GDPRPage } from './pages/GDPRPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import { CareerSitePage } from './pages/CareerSitePage';
import { CareerSiteJobDetailPage } from './pages/CareerSiteJobDetailPage';
import { CareerSiteApplicationPage } from './pages/CareerSiteApplicationPage';
import AIChatbot from './components/AIChatbot';
import HyreHRLogo from './components/HyreHRLogo';

function AppContent() {
  const location = useLocation();
  const hideNavigation = location.pathname === '/' ||
    location.pathname === '/pricing' ||
    location.pathname.startsWith('/careers/');

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && (
        <nav className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link
                  to="/"
                  className="flex items-center gap-2 px-2 py-2"
                >
                  <HyreHRLogo className="h-8" />
                  <span className="text-white font-bold text-xl">HyreHR</span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white border-b-2 border-white/50 hover:border-white transition-colors"
                  >
                    Jobs
                  </Link>
                  <Link
                    to="/candidates"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white/80 hover:text-white border-b-2 border-transparent hover:border-white/30 transition-colors"
                  >
                    Candidates
                  </Link>
                  <Link
                    to="/interviews"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white/80 hover:text-white border-b-2 border-transparent hover:border-white/30 transition-colors"
                  >
                    Interviews
                  </Link>
                  <Link
                    to="/talent-pools"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white/80 hover:text-white border-b-2 border-transparent hover:border-white/30 transition-colors"
                  >
                    Talent Pools
                  </Link>
                  <Link
                    to="/email-sequences"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white/80 hover:text-white border-b-2 border-transparent hover:border-white/30 transition-colors"
                  >
                    Sequences
                  </Link>
                  <Link
                    to="/gdpr"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white/80 hover:text-white border-b-2 border-transparent hover:border-white/30 transition-colors"
                  >
                    GDPR
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        {/* Public Career Site Routes */}
        <Route path="/careers/:slug" element={<CareerSitePage />} />
        <Route path="/careers/:slug/jobs/:jobId" element={<CareerSiteJobDetailPage />} />
        <Route path="/careers/:slug/jobs/:jobId/apply" element={<CareerSiteApplicationPage />} />

        {/* Internal Dashboard Routes */}
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/new" element={<CreateJobPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/jobs/:id/edit" element={<EditJobPage />} />
        <Route path="/jobs/:jobId/pipeline" element={<PipelinePage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/new" element={<CreateCandidatePage />} />
        <Route path="/candidates/:candidateId" element={<CandidateProfilePage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/schedule/:token" element={<CandidateSchedulingPage />} />
        <Route path="/reschedule/:rescheduleToken" element={<RescheduleInterviewPage />} />
        <Route path="/talent-pools" element={<TalentPoolsPage />} />
        <Route path="/talent-pools/new" element={<CreateTalentPoolPage />} />
        <Route path="/talent-pools/:id" element={<TalentPoolDetailPage />} />
        <Route path="/talent-pools/:id/edit" element={<CreateTalentPoolPage />} />
        <Route path="/email-sequences" element={<EmailSequencesPage />} />
        <Route path="/email-sequences/new" element={<CreateEmailSequencePage />} />
        <Route path="/email-sequences/:id" element={<EmailSequenceDetailPage />} />
        <Route path="/email-sequences/:id/edit" element={<CreateEmailSequencePage />} />
        <Route path="/gdpr" element={<GDPRPage />} />
      </Routes>

      {/* AI Chatbot - Available on all pages */}
      <AIChatbot />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
