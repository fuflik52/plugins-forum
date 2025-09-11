import React, { useState, useMemo, useEffect } from 'react';
import type { IndexedPlugin } from '../types/plugin';
import type { FilterValue } from '../services/filterService';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterSearchInput } from './FilterSearchInput';

interface FilterPanelProps {
  plugins: IndexedPlugin[];
  activeFilters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
}

// Separate search state component to prevent re-renders
const FilterSection = React.memo(({ 
  title, 
  field, 
  allOptions, 
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  isExpanded,
  onToggleExpanded,
  maxVisible = 8,
  getPluginCount
}: {
  title: string;
  field: FilterValue['field'];
  allOptions: string[];
  activeFilters: FilterValue[];
  onAddFilter: (field: FilterValue['field'], value: string) => void;
  onRemoveFilter: (field: FilterValue['field'], value: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  maxVisible?: number;
  getPluginCount: (field: FilterValue['field'], value: string) => number;
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return allOptions;
    return allOptions.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allOptions, searchTerm]);

  const visibleOptions = isExpanded ? filteredOptions : filteredOptions.slice(0, maxVisible);
  const hasMore = filteredOptions.length > maxVisible;
  const showSearch = allOptions.length > 5;

  const isFilterActive = (value: string): boolean => {
    return activeFilters.some(f => f.field === field && f.value === value);
  };

  if (allOptions.length === 0) return null;

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      {/* Header with search */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <span className="text-xs text-gray-500">{allOptions.length}</span>
        </div>
        
        {/* Inline search input */}
        {showSearch && (
          <FilterSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Search ${title.toLowerCase()}...`}
            filterKey={`${field}-search`}
          />
        )}
      </div>

      {/* No results message */}
      {searchTerm && filteredOptions.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-xs mb-2">No results found for "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Filter options */}
      {filteredOptions.length > 0 && (
        <div className="space-y-1">
          {visibleOptions.map(option => {
            const count = getPluginCount(field, option);
            const isActive = isFilterActive(option);
            
            return (
              <button
                key={option}
                onClick={() => isActive ? onRemoveFilter(field, option) : onAddFilter(field, option)}
                className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-all hover:bg-gray-50 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-900 border border-blue-200' 
                    : 'text-gray-700'
                }`}
              >
                <span className="font-medium truncate pr-2">{option}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Expand/Collapse button */}
      {hasMore && (
        <button
          onClick={onToggleExpanded}
          className="w-full mt-2 py-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {filteredOptions.length - maxVisible} more
            </>
          )}
        </button>
      )}
    </div>
  );
});

export const FilterPanel: React.FC<FilterPanelProps> = ({
  plugins,
  activeFilters,
  onFiltersChange
}) => {
  const [expandedSections, setExpandedSections] = useState({
    authors: false,
    versions: false,
    owners: false,
  });

  const [initializedSections, setInitializedSections] = useState(false);

  // Extract base filter options without search filtering
  const baseFilterOptions = useMemo(() => {
    const options = {
      plugin_author: new Set<string>(),
      plugin_version: new Set<string>(),
      repo_owner: new Set<string>(),
    };

    plugins.forEach(plugin => {
      if (plugin.plugin_author) options.plugin_author.add(plugin.plugin_author);
      if (plugin.plugin_version) options.plugin_version.add(plugin.plugin_version);
      if (plugin.repository?.owner_login) options.repo_owner.add(plugin.repository.owner_login);
    });

    // Sort versions properly (semantic version sorting)
    const sortedVersions = Array.from(options.plugin_version).sort((a, b) => {
      const parseVersion = (v: string): number[] => {
        const parts = v.split('.').map(p => parseInt(p, 10) || 0);
        return parts;
      };
      
      const vA = parseVersion(a);
      const vB = parseVersion(b);
      
      for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
        const partA = vA[i] || 0;
        const partB = vB[i] || 0;
        if (partA !== partB) {
          return partB - partA;
        }
      }
      return 0;
    });

    return {
      plugin_author: Array.from(options.plugin_author).sort(),
      plugin_version: sortedVersions,
      repo_owner: Array.from(options.repo_owner).sort(),
    };
  }, [plugins]);

  // Initialize expanded sections only once
  useEffect(() => {
    if (!initializedSections && plugins.length > 0) {
      const totalAuthors = baseFilterOptions.plugin_author.length;
      const totalVersions = baseFilterOptions.plugin_version.length;
      const totalOwners = baseFilterOptions.repo_owner.length;

      setExpandedSections({
        authors: totalAuthors <= 6,
        versions: totalVersions <= 5,
        owners: totalOwners <= 5,
      });
      setInitializedSections(true);
    }
  }, [plugins, initializedSections, baseFilterOptions]);

  const addFilter = (field: FilterValue['field'], value: string): void => {
    const exists = activeFilters.some(f => f.field === field && f.value === value);
    if (!exists) {
      onFiltersChange([...activeFilters, { field, value }]);
    }
  };

  const removeFilter = (field: FilterValue['field'], value: string): void => {
    onFiltersChange(activeFilters.filter(f => !(f.field === field && f.value === value)));
  };

  const clearAllFilters = (): void => {
    onFiltersChange([]);
  };

  const getPluginCount = (field: FilterValue['field'], value: string): number => {
    return plugins.filter(plugin => {
      if (field === 'plugin_author') return plugin.plugin_author === value;
      if (field === 'plugin_version') return plugin.plugin_version === value;
      if (field === 'repo_owner') return plugin.repository?.owner_login === value;
      return false;
    }).length;
  };

  const toggleSection = (section: keyof typeof expandedSections): void => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 sticky top-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="px-4 py-3 bg-blue-50 border-b border-gray-100">
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center space-x-1 bg-white px-2 py-1 rounded-md border border-blue-200 text-xs"
              >
                <span className="text-blue-700 font-medium truncate">
                  {filter.value}
                </span>
                <button
                  onClick={() => removeFilter(filter.field, filter.value)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className="p-4 space-y-4">
        <FilterSection
          title="Authors"
          field="plugin_author"
          allOptions={baseFilterOptions.plugin_author}
          activeFilters={activeFilters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          isExpanded={expandedSections.authors}
          onToggleExpanded={() => toggleSection('authors')}
          maxVisible={6}
          getPluginCount={getPluginCount}
        />
        
        <FilterSection
          title="Versions"
          field="plugin_version"
          allOptions={baseFilterOptions.plugin_version}
          activeFilters={activeFilters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          isExpanded={expandedSections.versions}
          onToggleExpanded={() => toggleSection('versions')}
          maxVisible={5}
          getPluginCount={getPluginCount}
        />
        
        
        <FilterSection
          title="Repository Owners"
          field="repo_owner"
          allOptions={baseFilterOptions.repo_owner}
          activeFilters={activeFilters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          isExpanded={expandedSections.owners}
          onToggleExpanded={() => toggleSection('owners')}
          maxVisible={5}
          getPluginCount={getPluginCount}
        />
      </div>
    </div>
  );
};