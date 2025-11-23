import React, { useState } from 'react';
import { ReportDefinition, ReportColumn, ReportFilter, ReportAggregation } from '../../services/analytics';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';

interface ReportBuilderProps {
  initialDefinition?: ReportDefinition;
  onSave: (definition: ReportDefinition) => void;
  onCancel: () => void;
}

const DATA_SOURCES = [
  { value: 'applications', label: 'Applications' },
  { value: 'candidates', label: 'Candidates' },
  { value: 'interviews', label: 'Interviews' },
  { value: 'jobs', label: 'Jobs' },
];

const FIELD_OPTIONS: Record<string, { field: string; label: string; type: string }[]> = {
  applications: [
    { field: 'id', label: 'Application ID', type: 'string' },
    { field: 'candidateName', label: 'Candidate Name', type: 'string' },
    { field: 'jobTitle', label: 'Job Title', type: 'string' },
    { field: 'stage', label: 'Stage', type: 'string' },
    { field: 'status', label: 'Status', type: 'string' },
    { field: 'appliedAt', label: 'Applied Date', type: 'date' },
    { field: 'rating', label: 'Rating', type: 'number' },
    { field: 'source', label: 'Source', type: 'string' },
  ],
  candidates: [
    { field: 'id', label: 'Candidate ID', type: 'string' },
    { field: 'firstName', label: 'First Name', type: 'string' },
    { field: 'lastName', label: 'Last Name', type: 'string' },
    { field: 'email', label: 'Email', type: 'string' },
    { field: 'phone', label: 'Phone', type: 'string' },
    { field: 'location', label: 'Location', type: 'string' },
    { field: 'currentTitle', label: 'Current Title', type: 'string' },
    { field: 'currentCompany', label: 'Current Company', type: 'string' },
    { field: 'createdAt', label: 'Created Date', type: 'date' },
  ],
  interviews: [
    { field: 'id', label: 'Interview ID', type: 'string' },
    { field: 'candidateName', label: 'Candidate Name', type: 'string' },
    { field: 'jobTitle', label: 'Job Title', type: 'string' },
    { field: 'scheduledAt', label: 'Scheduled Date', type: 'date' },
    { field: 'status', label: 'Status', type: 'string' },
    { field: 'locationType', label: 'Location Type', type: 'string' },
    { field: 'overallRating', label: 'Overall Rating', type: 'number' },
    { field: 'decision', label: 'Decision', type: 'string' },
  ],
  jobs: [
    { field: 'id', label: 'Job ID', type: 'string' },
    { field: 'title', label: 'Title', type: 'string' },
    { field: 'department', label: 'Department', type: 'string' },
    { field: 'location', label: 'Location', type: 'string' },
    { field: 'status', label: 'Status', type: 'string' },
    { field: 'employmentType', label: 'Employment Type', type: 'string' },
    { field: 'openedAt', label: 'Opened Date', type: 'date' },
    { field: 'closedAt', label: 'Closed Date', type: 'date' },
  ],
};

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'in', label: 'In' },
];

const AGGREGATION_FUNCTIONS = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
];

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ initialDefinition, onSave, onCancel }) => {
  const [dataSource, setDataSource] = useState(initialDefinition?.dataSource || 'applications');
  const [columns, setColumns] = useState<ReportColumn[]>(initialDefinition?.columns || []);
  const [filters, setFilters] = useState<ReportFilter[]>(initialDefinition?.filters || []);
  const [groupBy, setGroupBy] = useState<string[]>(initialDefinition?.groupBy || []);
  const [orderBy, setOrderBy] = useState(initialDefinition?.orderBy || []);
  const [aggregations, setAggregations] = useState<ReportAggregation[]>(initialDefinition?.aggregations || []);

  const availableFields = FIELD_OPTIONS[dataSource] || [];

  const addColumn = () => {
    if (availableFields.length > 0) {
      const field = availableFields[0];
      setColumns([
        ...columns,
        {
          field: field.field,
          label: field.label,
          type: field.type as any,
        },
      ]);
    }
  };

  const updateColumn = (index: number, updates: Partial<ReportColumn>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const addFilter = () => {
    if (availableFields.length > 0) {
      setFilters([
        ...filters,
        {
          field: availableFields[0].field,
          operator: 'equals',
          value: '',
        },
      ]);
    }
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const addAggregation = () => {
    const numericFields = availableFields.filter(f => f.type === 'number');
    if (numericFields.length > 0) {
      setAggregations([
        ...aggregations,
        {
          field: numericFields[0].field,
          function: 'count',
          label: `Count of ${numericFields[0].label}`,
        },
      ]);
    }
  };

  const updateAggregation = (index: number, updates: Partial<ReportAggregation>) => {
    const newAggregations = [...aggregations];
    newAggregations[index] = { ...newAggregations[index], ...updates };
    setAggregations(newAggregations);
  };

  const removeAggregation = (index: number) => {
    setAggregations(aggregations.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const definition: ReportDefinition = {
      dataSource,
      columns,
      filters: filters.length > 0 ? filters : undefined,
      groupBy: groupBy.length > 0 ? groupBy : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
      aggregations: aggregations.length > 0 ? aggregations : undefined,
    };
    onSave(definition);
  };

  return (
    <div className="space-y-6">
      {/* Data Source Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Source</h3>
        <select
          value={dataSource}
          onChange={(e) => {
            setDataSource(e.target.value);
            setColumns([]);
            setFilters([]);
            setGroupBy([]);
            setOrderBy([]);
            setAggregations([]);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DATA_SOURCES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
      </div>

      {/* Columns */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Columns</h3>
          <button
            onClick={addColumn}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Column
          </button>
        </div>
        <div className="space-y-3">
          {columns.map((column, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
              <select
                value={column.field}
                onChange={(e) => {
                  const field = availableFields.find(f => f.field === e.target.value);
                  if (field) {
                    updateColumn(index, {
                      field: field.field,
                      label: field.label,
                      type: field.type as any,
                    });
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableFields.map((field) => (
                  <option key={field.field} value={field.field}>
                    {field.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={column.label}
                onChange={(e) => updateColumn(index, { label: e.target.value })}
                placeholder="Column Label"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeColumn(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {columns.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No columns added. Click "Add Column" to get started.
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={addFilter}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Filter
          </button>
        </div>
        <div className="space-y-3">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <select
                value={filter.field}
                onChange={(e) => updateFilter(index, { field: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableFields.map((field) => (
                  <option key={field.field} value={field.field}>
                    {field.label}
                  </option>
                ))}
              </select>
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(index, { value: e.target.value })}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeFilter(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {filters.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No filters added. Click "Add Filter" to filter your data.
            </p>
          )}
        </div>
      </div>

      {/* Aggregations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aggregations</h3>
          <button
            onClick={addAggregation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Aggregation
          </button>
        </div>
        <div className="space-y-3">
          {aggregations.map((agg, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <select
                value={agg.function}
                onChange={(e) => updateAggregation(index, { function: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AGGREGATION_FUNCTIONS.map((func) => (
                  <option key={func.value} value={func.value}>
                    {func.label}
                  </option>
                ))}
              </select>
              <select
                value={agg.field}
                onChange={(e) => updateAggregation(index, { field: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableFields.map((field) => (
                  <option key={field.field} value={field.field}>
                    {field.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={agg.label}
                onChange={(e) => updateAggregation(index, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeAggregation(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {aggregations.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No aggregations added. Click "Add Aggregation" to calculate metrics.
            </p>
          )}
        </div>
      </div>

      {/* Group By */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Group By</h3>
        <select
          multiple
          value={groupBy}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setGroupBy(selected);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          size={5}
        >
          {availableFields.map((field) => (
            <option key={field.field} value={field.field}>
              {field.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Hold Ctrl/Cmd to select multiple fields
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={columns.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save Report
        </button>
      </div>
    </div>
  );
};
