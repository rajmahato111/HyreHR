import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Candidate, CandidateFilters } from '../types/candidate';
import { AdvancedSearch } from '../components/candidates/AdvancedSearch';
import { SearchFilters } from '../components/candidates/SearchFilters';
import { SavedSearches, SavedSearch } from '../components/candidates/SavedSearches';
import { CandidateSearchResults } from '../components/candidates/CandidateSearchResults';
import candidatesService from '../services/candidates';
import api from '../services/api';

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CandidateFilters>({
    page: 1,
    limit: 50,
  });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    loadCandidates();
    loadSavedSearches();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery || Object.keys(filters).length > 2) {
        loadCandidates();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = searchQuery
        ? await candidatesService.searchCandidates(searchQuery, filters)
        : await candidatesService.getCandidates(filters);
      setCandidates(data.data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const response = await api.get('/saved-searches?type=candidate');
      setSavedSearches(response.data.data || []);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: CandidateFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
    });
    setSearchQuery('');
  };

  const handleSaveSearch = async (
    name: string,
    query: string,
    searchFilters: Record<string, any>
  ) => {
    try {
      const response = await api.post('/saved-searches', {
        name,
        type: 'candidate',
        query,
        filters: searchFilters,
      });
      setSavedSearches([response.data, ...savedSearches]);
    } catch (error) {
      console.error('Failed to save search:', error);
      throw error;
    }
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setSearchQuery(search.query);
    setFilters({
      ...filters,
      ...search.filters,
    });
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await api.delete(`/saved-searches/${id}`);
      setSavedSearches(savedSearches.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to delete search:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
              <p className="text-sm text-gray-500 mt-1">
                Search and manage your candidate database
              </p>
            </div>
            <Link
              to="/candidates/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              + Add Candidate
            </Link>
          </div>

          {/* Quick Search */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, company, or skills..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  showAdvancedSearch
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Advanced Search */}
            {showAdvancedSearch && (
              <AdvancedSearch onSearch={handleSearch} initialQuery={searchQuery} />
            )}

            {/* Filters */}
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClear={handleClearFilters}
            />

            {/* Saved Searches */}
            <SavedSearches
              searches={savedSearches}
              onLoad={handleLoadSearch}
              onSave={handleSaveSearch}
              onDelete={handleDeleteSearch}
              currentQuery={searchQuery}
              currentFilters={filters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <CandidateSearchResults
              candidates={candidates}
              searchQuery={searchQuery}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
