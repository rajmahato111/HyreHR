import { useState } from 'react';
import { Note, CreateNoteDto } from '../../types/note';

interface NotesSectionProps {
  candidateId: string;
  notes: Note[];
  onAddNote: (note: CreateNoteDto) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export function NotesSection({ candidateId, notes, onAddNote, onDeleteNote }: NotesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote({
        candidateId,
        content: newNoteContent,
      });
      setNewNoteContent('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Add Note
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Add Note Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-4">
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add a note..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteContent('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting || !newNoteContent.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>
        )}

        {/* Notes List */}
        {notes.length === 0 && !isAdding ? (
          <p className="text-gray-500 text-center py-8">No notes yet</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {note.user?.avatarUrl ? (
                      <img
                        src={note.user.avatarUrl}
                        alt={`${note.user.firstName} ${note.user.lastName}`}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {note.user?.firstName?.[0]}
                          {note.user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {note.user?.firstName} {note.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap ml-10">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
