import { useState } from 'react';
import { CandidateFilters } from '../../types/candidate';

interface SearchFiltersProps {
  filters: CandidateFilters;
  onFiltersChange: (filters: CandidateFilters) => void;
  onClear: () => void;
}

export function SearchFilters({ filters, onFiltersChange, onClear }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof CandidateFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleTagsChange = (tags: string) => {
    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    handleChange('tags', tagArray.length > 0 ? tagArray : undefined);
  };

  const handleSkillsChange = (skills: string) => {
    const skillArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    handleChange('skills', skillArray.length > 0 ? skillArray : undefined);
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => key !== 'page' && key !== 'limit' && filters[key as keyof CandidateFilters]
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg
              className={`mr-2 h-5 w-5 transform transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-4 space-y-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) => handleChange('location', e.target.value || undefined)}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={filters.skills?.join(', ') || ''}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="e.g., senior, remote, full-stack"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level
            </label>
            <select
              value={filters.experience || ''}
              onChange={(e) => handleChange('experience', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All levels</option>
              <option value="entry">Entry Level (0-2 years)</option>
              <option value="mid">Mid Level (3-5 years)</option>
              <option value="senior">Senior (6-10 years)</option>
              <option value="lead">Lead (10+ years)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Added</option>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="updatedAt">Last Updated</option>
              </select>
              <select
                value={filters.sortOrder || 'DESC'}
                onChange={(e) => handleChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
