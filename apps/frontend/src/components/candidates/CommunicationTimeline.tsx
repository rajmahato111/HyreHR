import { Communication, CommunicationType, CommunicationDirection } from '../../types/communication';
import { Note } from '../../types/note';

interface TimelineItem {
  id: string;
  type: 'communication' | 'note';
  data: Communication | Note;
  timestamp: string;
}

interface CommunicationTimelineProps {
  communications: Communication[];
  notes: Note[];
}

export function CommunicationTimeline({ communications, notes }: CommunicationTimelineProps) {
  // Combine and sort communications and notes by timestamp
  const timelineItems: TimelineItem[] = [
    ...communications.map((comm) => ({
      id: comm.id,
      type: 'communication' as const,
      data: comm,
      timestamp: comm.createdAt,
    })),
    ...notes.map((note) => ({
      id: note.id,
      type: 'note' as const,
      data: note,
      timestamp: note.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case CommunicationType.EMAIL:
        return '📧';
      case CommunicationType.SMS:
        return '💬';
      case CommunicationType.CALL:
        return '📞';
      case CommunicationType.NOTE:
        return '📝';
      default:
        return '📄';
    }
  };

  const getDirectionLabel = (direction: CommunicationDirection) => {
    switch (direction) {
      case CommunicationDirection.INBOUND:
        return 'Received';
      case CommunicationDirection.OUTBOUND:
        return 'Sent';
      case CommunicationDirection.INTERNAL:
        return 'Internal';
      default:
        return '';
    }
  };

  if (timelineItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Timeline</h3>
        <p className="text-gray-500 text-center py-8">No communications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Communication Timeline</h3>
      </div>
      <div className="px-6 py-4">
        <div className="flow-root">
          <ul className="-mb-8">
            {timelineItems.map((item, itemIdx) => (
              <li key={item.id}>
                <div className="relative pb-8">
                  {itemIdx !== timelineItems.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                        {item.type === 'communication'
                          ? getTypeIcon((item.data as Communication).type)
                          : '📝'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.type === 'communication' ? (
                        <CommunicationItem communication={item.data as Communication} />
                      ) : (
                        <NoteItem note={item.data as Note} />
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CommunicationItem({ communication }: { communication: Communication }) {
  const getDirectionLabel = (direction: CommunicationDirection) => {
    switch (direction) {
      case CommunicationDirection.INBOUND:
        return 'Received';
      case CommunicationDirection.OUTBOUND:
        return 'Sent';
      case CommunicationDirection.INTERNAL:
        return 'Internal';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">
          {getDirectionLabel(communication.direction)} {communication.type}
          {communication.user && (
            <span className="text-gray-500 font-normal">
              {' '}
              by {communication.user.firstName} {communication.user.lastName}
            </span>
          )}
        </p>
        <time className="text-xs text-gray-500">
          {new Date(communication.createdAt).toLocaleString()}
        </time>
      </div>
      {communication.subject && (
        <p className="mt-1 text-sm text-gray-700 font-medium">{communication.subject}</p>
      )}
      {communication.body && (
        <p className="mt-1 text-sm text-gray-600 line-clamp-3">{communication.body}</p>
      )}
      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
        <span>To: {communication.toEmails.join(', ')}</span>
        {communication.status && (
          <span className="capitalize">{communication.status}</span>
        )}
        {communication.openedAt && (
          <span className="text-green-600">Opened</span>
        )}
      </div>
    </div>
  );
}

function NoteItem({ note }: { note: Note }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">
          Note
          {note.user && (
            <span className="text-gray-500 font-normal">
              {' '}
              by {note.user.firstName} {note.user.lastName}
            </span>
          )}
        </p>
        <time className="text-xs text-gray-500">
          {new Date(note.createdAt).toLocaleString()}
        </time>
      </div>
      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
