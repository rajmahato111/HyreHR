import { useState } from 'react';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  createdAt: string;
}

interface SavedSearchesProps {
  searches: SavedSearch[];
  onLoad: (search: SavedSearch) => void;
  onSave: (name: string, query: string, filters: Record<string, any>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentQuery: string;
  currentFilters: Record<string, any>;
}

export function SavedSearches({
  searches,
  onLoad,
  onSave,
  onDelete,
  currentQuery,
  currentFilters,
}: SavedSearchesProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) return;

    try {
      await onSave(searchName, currentQuery, currentFilters);
      setSearchName('');
      setIsSaving(false);
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Saved Searches</h3>
          {!isSaving && (
            <button
              onClick={() => setIsSaving(true)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Save Current
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Save Form */}
        {isSaving && (
          <form onSubmit={handleSave} className="mb-4 pb-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Name
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., Senior React Developers"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsSaving(false);
                  setSearchName('');
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                disabled={!searchName.trim()}
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Saved Searches List */}
        {searches.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No saved searches yet</p>
        ) : (
          <div className="space-y-2">
            {searches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group"
              >
                <button
                  onClick={() => onLoad(search)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium text-gray-900">{search.name}</p>
                  {search.query && (
                    <p className="text-xs text-gray-500 mt-1 truncate font-mono">
                      {search.query}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Saved {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </button>
                <button
                  onClick={() => onDelete(search.id)}
                  className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
