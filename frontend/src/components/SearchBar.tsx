import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import type { SearchOptions, SearchFieldKey } from '../types/plugin';
import { getDefaultSearchOptions } from '../types/plugin';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchOptions;
  onOptionsChange: (opts: SearchOptions) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange,
  options,
  onOptionsChange,
  placeholder = "Search plugins..." 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(true);
  const toggleField = (field: SearchFieldKey) => {
    const has = options.fields.includes(field);
    const next = has ? options.fields.filter((f) => f !== field) : [...options.fields, field];
    onOptionsChange({ ...options, fields: next });
  };
  const resetOptions = () => onOptionsChange(getDefaultSearchOptions());

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input pl-16 pr-16"
        placeholder={placeholder}
      />
      
      <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          <span className="text-sm text-gray-400 font-medium">AI Powered</span>
        </div>
      </div>
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>

      {/* Advanced options */}
      <div className="mt-4 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-medium text-gray-700">Advanced filters</div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetOptions}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {showAdvanced ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {showAdvanced && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Match</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={options.matchMode}
                  onChange={(e) => onOptionsChange({ ...options, matchMode: e.target.value as SearchOptions['matchMode'] })}
                >
                  <option value="contains">Contains</option>
                  <option value="startsWith">Starts with</option>
                  <option value="exact">Exact</option>
                  <option value="regex">RegExp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Logic</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={options.logic}
                  onChange={(e) => onOptionsChange({ ...options, logic: e.target.value as SearchOptions['logic'] })}
                >
                  <option value="any">Match any field</option>
                  <option value="all">Match all fields</option>
                </select>
              </div>
              <div className="flex items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">Case sensitivity</label>
                  <button
                    onClick={() => onOptionsChange({ ...options, caseSensitive: !options.caseSensitive })}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${options.caseSensitive ? 'bg-blue-600' : 'bg-gray-300'}`}
                    aria-pressed={options.caseSensitive}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${options.caseSensitive ? 'translate-x-7' : 'translate-x-1'}`}
                    />
                    <span className="sr-only">Toggle case sensitivity</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-600 mb-2">Fields</div>
              <div className="flex flex-wrap gap-2">
                {([
                  ['plugin_name', 'Plugin name'],
                  ['plugin_author', 'Author'],
                  ['repo_name', 'Repo name'],
                  ['repo_full_name', 'Repo full name'],
                  ['repo_description', 'Description'],
                  ['repo_owner', 'Repo owner'],
                  ['file_path', 'File path'],
                ] as [SearchFieldKey, string][]) .map(([key, label]) => {
                  const active = options.fields.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleField(key)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

