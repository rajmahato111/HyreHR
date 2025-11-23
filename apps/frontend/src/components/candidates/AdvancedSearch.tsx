import { useState } from 'react';

interface AdvancedSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function AdvancedSearch({ onSearch, initialQuery = '' }: AdvancedSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const insertOperator = (operator: string) => {
    setQuery((prev) => prev + (prev ? ' ' : '') + operator + ' ');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Advanced Search</h3>
      </div>

      <div className="px-4 py-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g., (JavaScript OR TypeScript) AND React AND NOT Angular'
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          {/* Boolean Operators */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Boolean Operators
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => insertOperator('AND')}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
              >
                AND
              </button>
              <button
                type="button"
                onClick={() => insertOperator('OR')}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
              >
                OR
              </button>
              <button
                type="button"
                onClick={() => insertOperator('NOT')}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
              >
                NOT
              </button>
              <button
                type="button"
                onClick={() => insertOperator('(')}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
              >
                (
              </button>
              <button
                type="button"
                onClick={() => insertOperator(')')}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
              >
                )
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showHelp ? 'Hide' : 'Show'} search help
            </button>
            {showHelp && (
              <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-gray-700">
                <p className="font-medium mb-2">Boolean Search Examples:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <code className="bg-white px-1 rounded">JavaScript AND React</code> - Find
                    candidates with both skills
                  </li>
                  <li>
                    <code className="bg-white px-1 rounded">Python OR Ruby</code> - Find candidates
                    with either skill
                  </li>
                  <li>
                    <code className="bg-white px-1 rounded">Java NOT JavaScript</code> - Find Java
                    candidates excluding JavaScript
                  </li>
                  <li>
                    <code className="bg-white px-1 rounded">(React OR Vue) AND TypeScript</code> -
                    Use parentheses for complex queries
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
