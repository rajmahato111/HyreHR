import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Candidate } from '../types/candidate';
import { Application } from '../types/application';
import { Communication } from '../types/communication';
import { Note, CreateNoteDto } from '../types/note';
import { CandidateOverview } from '../components/candidates/CandidateOverview';
import { ApplicationHistory } from '../components/candidates/ApplicationHistory';
import { CommunicationTimeline } from '../components/candidates/CommunicationTimeline';
import { NotesSection } from '../components/candidates/NotesSection';
import { TagsManager } from '../components/candidates/TagsManager';
import candidatesService from '../services/candidates';
import applicationsService from '../services/applications';
import api from '../services/api';

export function CandidateProfilePage() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'activity'>('overview');

  useEffect(() => {
    if (candidateId) {
      loadCandidateData(candidateId);
    }
  }, [candidateId]);

  const loadCandidateData = async (id: string) => {
    try {
      setLoading(true);
      const [candidateData, applicationsData, communicationsData, notesData] = await Promise.all([
        candidatesService.getCandidate(id),
        applicationsService.getApplications({ candidateId: id, limit: 100 }),
        api.get(`/communications?candidateId=${id}`).then((res) => res.data.data || []),
        api.get(`/notes?candidateId=${id}`).then((res) => res.data.data || []),
      ]);

      setCandidate(candidateData);
      setApplications(applicationsData.data);
      setCommunications(communicationsData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (noteData: CreateNoteDto) => {
    try {
      const response = await api.post('/notes', noteData);
      setNotes([response.data, ...notes]);
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const handleAddTag = async (tag: string) => {
    if (!candidate) return;

    try {
      const updatedTags = [...(candidate.tags || []), tag];
      const updatedCandidate = await candidatesService.updateCandidate(candidate.id, {
        tags: updatedTags,
      });
      setCandidate(updatedCandidate);
    } catch (error) {
      console.error('Failed to add tag:', error);
      throw error;
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!candidate) return;

    try {
      const updatedTags = (candidate.tags || []).filter((t) => t !== tag);
      const updatedCandidate = await candidatesService.updateCandidate(candidate.id, {
        tags: updatedTags,
      });
      setCandidate(updatedCandidate);
    } catch (error) {
      console.error('Failed to remove tag:', error);
      throw error;
    }
  };

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    window.location.href = `/candidates/${candidateId}/edit`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!candidate || !candidateId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate not found</h2>
          <Link to="/candidates" className="text-blue-600 hover:underline">
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/candidates" className="hover:text-gray-700">
              Candidates
            </Link>
            <span>/</span>
            <span className="text-gray-900">
              {candidate.firstName} {candidate.lastName}
            </span>
          </div>

          {/* Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Applications ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Activity
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <CandidateOverview 
              candidate={candidate} 
              application={applications[0]} 
              onEdit={handleEdit} 
            />
            <TagsManager
              tags={candidate.tags || []}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
            />
            <NotesSection
              candidateId={candidateId}
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        )}

        {activeTab === 'applications' && (
          <ApplicationHistory applications={applications} />
        )}

        {activeTab === 'activity' && (
          <CommunicationTimeline communications={communications} notes={notes} />
        )}
      </div>
    </div>
  );
}
