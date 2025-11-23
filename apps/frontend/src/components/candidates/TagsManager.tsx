import { useState } from 'react';

interface TagsManagerProps {
  tags: string[];
  onAddTag: (tag: string) => Promise<void>;
  onRemoveTag: (tag: string) => Promise<void>;
}

export function TagsManager({ tags, onAddTag, onRemoveTag }: TagsManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTag(newTag.trim());
      setNewTag('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (tag: string) => {
    try {
      await onRemoveTag(tag);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Add Tag
          </button>
        )}
      </div>

      {/* Add Tag Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTag('');
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting || !newTag.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Tags List */}
      {tags.length === 0 && !isAdding ? (
        <p className="text-gray-500 text-center py-4">No tags yet</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                onClick={() => handleRemove(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
