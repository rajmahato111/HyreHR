import React, { useState, useEffect } from 'react';
import {
  Mail,
  FileText,
  Calendar,
  UserCheck,
  ArrowRight,
  MessageSquare,
  Filter,
  Clock,
  User,
  Send,
} from 'lucide-react';
import {
  getCandidateActivityFeed,
  getApplicationActivityFeed,
  ActivityFeedItem,
  createNote,
} from '../../services/communication';
import { CreateNoteDto } from '../../types/note';

interface ActivityTimelineProps {
  candidateId?: string;
  applicationId?: string;
  limit?: number;
}

type ActivityType = 'all' | 'email' | 'note' | 'status_change' | 'interview' | 'application';

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  candidateId,
  applicationId,
  limit = 50,
}) => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [candidateId, applicationId, limit]);

  useEffect(() => {
    applyFilters();
  }, [activities, filterType]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      let data: ActivityFeedItem[];
      if (applicationId) {
        data = await getApplicationActivityFeed(applicationId);
      } else if (candidateId) {
        data = await getCandidateActivityFeed(candidateId, limit);
      } else {
        data = [];
      }
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (filterType === 'all') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter((activity) => activity.type === filterType));
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !candidateId) return;

    setSavingNote(true);
    try {
      const dto: CreateNoteDto = {
        candidateId,
        applicationId,
        content: noteContent,
      };
      await createNote(dto);
      setNoteContent('');
      setShowNoteInput(false);
      await loadActivities();
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'note':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'status_change':
        return <ArrowRight className="w-5 h-5 text-orange-500" />;
      case 'interview':
        return <Calendar className="w-5 h-5 text-green-500" />;
      case 'application':
        return <UserCheck className="w-5 h-5 text-indigo-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityTitle = (activity: ActivityFeedItem): string => {
    switch (activity.type) {
      case 'email':
        return activity.data.subject || 'Email sent';
      case 'note':
        return 'Note added';
      case 'status_change':
        return `Status changed: ${activity.data.fromStatus} → ${activity.data.toStatus}`;
      case 'interview':
        return `Interview ${activity.data.action || 'scheduled'}`;
      case 'application':
        return `Application ${activity.data.action || 'created'}`;
      default:
        return 'Activity';
    }
  };

  const getActivityDescription = (activity: ActivityFeedItem): string => {
    switch (activity.type) {
      case 'email':
        return activity.data.body?.substring(0, 150) || '';
      case 'note':
        return activity.data.content || '';
      case 'status_change':
        return activity.data.reason || '';
      case 'interview':
        return activity.data.interviewType
          ? `${activity.data.interviewType} interview`
          : '';
      case 'application':
        return activity.data.jobTitle || '';
      default:
        return '';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getFilterCount = (type: ActivityType): number => {
    if (type === 'all') return activities.length;
    return activities.filter((activity) => activity.type === type).length;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Activity Timeline</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Add Note
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Note Input */}
        {showNoteInput && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add a note about this candidate..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNoteInput(false);
                  setNoteContent('');
                }}
                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteContent.trim() || savingNote}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({getFilterCount('all')})
            </button>
            <button
              onClick={() => setFilterType('email')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterType === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Emails ({getFilterCount('email')})
            </button>
            <button
              onClick={() => setFilterType('note')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterType === 'note'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notes ({getFilterCount('note')})
            </button>
            <button
              onClick={() => setFilterType('status_change')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterType === 'status_change'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Status Changes ({getFilterCount('status_change')})
            </button>
            <button
              onClick={() => setFilterType('interview')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterType === 'interview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Interviews ({getFilterCount('interview')})
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
            <p className="text-sm">No activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < filteredActivities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                  )}
                </div>

                {/* Activity Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {getActivityTitle(activity)}
                        </h4>
                        {activity.user && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <User className="w-3 h-3" />
                            <span>
                              {activity.user.firstName} {activity.user.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>

                    {getActivityDescription(activity) && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {getActivityDescription(activity)}
                      </p>
                    )}

                    {/* Activity-specific details */}
                    {activity.type === 'email' && activity.data.toEmails && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Send className="w-3 h-3" />
                        To: {activity.data.toEmails.join(', ')}
                      </div>
                    )}

                    {activity.type === 'interview' && activity.data.scheduledAt && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(activity.data.scheduledAt).toLocaleString()}
                      </div>
                    )}

                    {activity.type === 'status_change' && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          {activity.data.fromStatus}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {activity.data.toStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
