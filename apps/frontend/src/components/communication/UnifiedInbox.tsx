import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  Search,
  Filter,
  RefreshCw,
  Reply,
  Clock,
  CheckCircle,
  MousePointerClick,
  Inbox,
  Send as SendIcon,
} from 'lucide-react';
import {
  getCommunications,
  syncEmails,
  FilterCommunicationDto,
} from '../../services/communication';
import {
  Communication,
  CommunicationType,
  CommunicationDirection,
  CommunicationStatus,
} from '../../types/communication';
import { EmailComposer } from './EmailComposer';

interface UnifiedInboxProps {
  candidateId?: string;
  applicationId?: string;
}

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  candidateId,
  applicationId,
}) => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [filters, setFilters] = useState<FilterCommunicationDto>({
    candidateId,
    applicationId,
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    loadCommunications();
  }, [filters]);

  const loadCommunications = async () => {
    setLoading(true);
    try {
      const response = await getCommunications(filters);
      setCommunications(response.data);
    } catch (err) {
      console.error('Failed to load communications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (provider: 'gmail' | 'outlook') => {
    setSyncing(true);
    try {
      await syncEmails(provider);
      await loadCommunications();
    } catch (err) {
      console.error('Failed to sync emails:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleFilterChange = (key: keyof FilterCommunicationDto, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleQuickReply = () => {
    setShowComposer(true);
    // Pre-fill composer with reply data
  };

  const filteredCommunications = communications.filter((comm) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comm.subject?.toLowerCase().includes(query) ||
      comm.body?.toLowerCase().includes(query) ||
      comm.toEmails.some((email) => email.toLowerCase().includes(query)) ||
      comm.fromEmail?.toLowerCase().includes(query)
    );
  });

  const getStatusIcon = (status: CommunicationStatus) => {
    switch (status) {
      case CommunicationStatus.SENT:
        return <SendIcon className="w-4 h-4 text-blue-500" />;
      case CommunicationStatus.DELIVERED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case CommunicationStatus.OPENED:
        return <MailOpen className="w-4 h-4 text-purple-500" />;
      case CommunicationStatus.CLICKED:
        return <MousePointerClick className="w-4 h-4 text-orange-500" />;
      case CommunicationStatus.FAILED:
        return <Mail className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: CommunicationStatus) => {
    switch (status) {
      case CommunicationStatus.DRAFT:
        return 'Draft';
      case CommunicationStatus.SENT:
        return 'Sent';
      case CommunicationStatus.DELIVERED:
        return 'Delivered';
      case CommunicationStatus.OPENED:
        return 'Opened';
      case CommunicationStatus.CLICKED:
        return 'Clicked';
      case CommunicationStatus.FAILED:
        return 'Failed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Inbox
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSync('gmail')}
                disabled={syncing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sync emails"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'type',
                      e.target.value || undefined
                    )
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="">All Types</option>
                  <option value={CommunicationType.EMAIL}>Email</option>
                  <option value={CommunicationType.SMS}>SMS</option>
                  <option value={CommunicationType.NOTE}>Note</option>
                  <option value={CommunicationType.CALL}>Call</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Direction
                </label>
                <select
                  value={filters.direction || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'direction',
                      e.target.value || undefined
                    )
                  }
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="">All Directions</option>
                  <option value={CommunicationDirection.INBOUND}>Inbound</option>
                  <option value={CommunicationDirection.OUTBOUND}>Outbound</option>
                  <option value={CommunicationDirection.INTERNAL}>Internal</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredCommunications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Mail className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-sm">No emails found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCommunications.map((comm) => (
                <button
                  key={comm.id}
                  onClick={() => setSelectedCommunication(comm)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedCommunication?.id === comm.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {comm.direction === CommunicationDirection.INBOUND ? (
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <SendIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">
                        {comm.direction === CommunicationDirection.INBOUND
                          ? comm.fromEmail
                          : comm.toEmails[0]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDate(comm.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm font-medium text-gray-900 truncate mb-1">
                    {comm.subject || '(No subject)'}
                  </div>

                  <div className="text-xs text-gray-600 truncate mb-2">
                    {comm.body?.substring(0, 100)}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(comm.status)}
                    <span className="text-xs text-gray-500">
                      {getStatusLabel(comm.status)}
                    </span>
                    {comm.openedAt && (
                      <span className="text-xs text-gray-400">
                        • Opened {formatDate(comm.openedAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 flex flex-col">
        {selectedCommunication ? (
          <>
            {/* Email Header */}
            <div className="p-6 border-b space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedCommunication.subject || '(No subject)'}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">
                        {selectedCommunication.fromEmail || 'You'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium">
                        {selectedCommunication.toEmails.join(', ')}
                      </span>
                    </div>
                    {selectedCommunication.ccEmails &&
                      selectedCommunication.ccEmails.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Cc:</span>
                          <span className="font-medium">
                            {selectedCommunication.ccEmails.join(', ')}
                          </span>
                        </div>
                      )}
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {new Date(selectedCommunication.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    {getStatusIcon(selectedCommunication.status)}
                    <span className="text-sm">
                      {getStatusLabel(selectedCommunication.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickReply()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </div>

              {/* Tracking Info */}
              {(selectedCommunication.openedAt || selectedCommunication.clickedAt) && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg text-sm">
                  {selectedCommunication.openedAt && (
                    <div className="flex items-center gap-2">
                      <MailOpen className="w-4 h-4 text-blue-600" />
                      <span>
                        Opened {formatDate(selectedCommunication.openedAt)}
                      </span>
                    </div>
                  )}
                  {selectedCommunication.clickedAt && (
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-orange-600" />
                      <span>
                        Clicked {formatDate(selectedCommunication.clickedAt)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">
                  {selectedCommunication.body}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No email selected</p>
              <p className="text-sm">Select an email to view its contents</p>
            </div>
          </div>
        )}
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <EmailComposer
          candidateId={candidateId || ''}
          applicationId={applicationId}
          onClose={() => setShowComposer(false)}
          onSent={() => {
            setShowComposer(false);
            loadCommunications();
          }}
        />
      )}
    </div>
  );
};
