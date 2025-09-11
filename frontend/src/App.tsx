import React, { useState, useEffect } from 'react';
import type { PluginIndex, IndexedPlugin } from './types/plugin';
import { ApiService } from './services/api';
import { FilterService } from './services/filterService';
import type { FilterValue } from './services/filterService';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { PluginGrid } from './components/PluginGrid';
import { GroupedPluginView } from './components/GroupedPluginView';
import { StatsBar } from './components/StatsBar';
import { EmptyState } from './components/EmptyState';
import { AlertCircle, RefreshCw, Zap, Sparkles, Code, Grid, Package } from 'lucide-react';
import { Pagination } from './components/Pagination';
import { useUrlState } from './hooks/useUrlState';
import { getPluginTimestamp } from './utils/dateUtils';

function App(): React.JSX.Element {
  const [pluginIndex, setPluginIndex] = useState<PluginIndex | null>(null);
  const [searchFilteredPlugins, setSearchFilteredPlugins] = useState<PluginIndex | null>(null);
  const [finalFilteredPlugins, setFinalFilteredPlugins] = useState<PluginIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);

  // Use URL state management
  const {
    searchQuery,
    viewMode,
    sortBy,
    currentPage,
    pageSize,
    searchOptions,
    setSearchQuery,
    setViewMode,
    setSortBy,
    setCurrentPage,
    setPageSize,
    setSearchOptions
  } = useUrlState();

  useEffect(() => {
    void loadPlugins();
  }, []);

  // First effect: Apply text search only
  useEffect(() => {
    if (pluginIndex) {
      const searchFiltered = ApiService.searchPlugins(searchQuery, pluginIndex, searchOptions);
      setSearchFilteredPlugins(searchFiltered);
    }
  }, [searchQuery, pluginIndex, searchOptions]);

  // Second effect: Apply field filters to search results
  useEffect(() => {
    if (searchFilteredPlugins) {
      if (activeFilters.length > 0) {
        const filteredItems = FilterService.applyFilters(searchFilteredPlugins.items, activeFilters);
        setFinalFilteredPlugins({
          ...searchFilteredPlugins,
          items: filteredItems,
          count: filteredItems.length
        });
      } else {
        setFinalFilteredPlugins(searchFilteredPlugins);
      }
    }
  }, [searchFilteredPlugins, activeFilters]);

  const loadPlugins = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.fetchPluginIndex();
      setPluginIndex(data);
      setSearchFilteredPlugins(data);
      setFinalFilteredPlugins(data);
    } catch (err) {
      setError('Failed to load plugins. Please try again later.');
      console.error('Error loading plugins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (): void => {
    void loadPlugins();
  };

  // Calculate unique plugin count for stats
  const uniquePluginCount = finalFilteredPlugins ? 
    new Set(finalFilteredPlugins.items.map(p => p.plugin_name || 'Unknown')).size : 0;

  // For grouped view, we need to group and paginate groups
  const groupedData = React.useMemo(() => {
    if (!finalFilteredPlugins || viewMode !== 'grouped') return null;
    
    const groups: Record<string, IndexedPlugin[]> = {};
    
    finalFilteredPlugins.items.forEach(plugin => {
      const name = plugin.plugin_name || 'Unknown';
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(plugin);
    });

    // Parse sort parameters
    const [field, dir]: ['updated' | 'created' | 'indexed', 'asc' | 'desc'] = ((): ['updated' | 'created' | 'indexed', 'asc' | 'desc'] => {
      if (sortBy.startsWith('updated')) return ['updated', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      if (sortBy.startsWith('created')) return ['created', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      return ['indexed', sortBy.endsWith('asc') ? 'asc' : 'desc'];
    })();


    // Sort groups by their representative plugin
    const sortedGroups = Object.entries(groups)
      .map(([name, pluginList]) => {
        // Sort plugins within each group
        const sortedPlugins = [...pluginList].sort((a, b) => {
          const ta = getPluginTimestamp(a, field);
          const tb = getPluginTimestamp(b, field);
          const diff = tb - ta;
          return dir === 'asc' ? -diff : diff;
        });

        return {
          name,
          plugins: sortedPlugins,
          representativePlugin: sortedPlugins[0]
        };
      })
      .sort((a, b) => {
        const ta = getPluginTimestamp(a.representativePlugin, field);
        const tb = getPluginTimestamp(b.representativePlugin, field);
        const diff = tb - ta;
        return dir === 'asc' ? -diff : diff;
      });

    return {
      allGroups: sortedGroups,
      totalGroups: sortedGroups.length,
      pagedGroups: sortedGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    };
  }, [finalFilteredPlugins, viewMode, sortBy, currentPage, pageSize]);

  const pagedItems = ((): IndexedPlugin[] => {
    if (!finalFilteredPlugins) return [];
    
    if (viewMode === 'grouped') {
      // Return plugins from paginated groups
      if (!groupedData) return [];
      const plugins: IndexedPlugin[] = [];
      groupedData.pagedGroups.forEach(group => {
        plugins.push(...group.plugins);
      });
      return plugins;
    }

    // For grid view, sort and paginate individual plugins

    const [field, dir]: ['updated' | 'created' | 'indexed', 'asc' | 'desc'] = ((): ['updated' | 'created' | 'indexed', 'asc' | 'desc'] => {
      if (sortBy.startsWith('updated')) return ['updated', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      if (sortBy.startsWith('created')) return ['created', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      return ['indexed', sortBy.endsWith('asc') ? 'asc' : 'desc'];
    })();

    const sorted = [...finalFilteredPlugins.items].sort((a, b) => {
      const ta = getPluginTimestamp(a, field);
      const tb = getPluginTimestamp(b, field);
      const diff = tb - ta;
      return dir === 'asc' ? -diff : diff;
    });

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  })();

  const totalPages = ((): number => {
    if (!finalFilteredPlugins) return 1;
    
    if (viewMode === 'grouped') {
      return groupedData ? Math.max(1, Math.ceil(groupedData.totalGroups / pageSize)) : 1;
    }
    
    return Math.max(1, Math.ceil(finalFilteredPlugins.count / pageSize));
  })();

  if (loading && !pluginIndex) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
              <span className="text-lg font-semibold gradient-text">Loading plugins...</span>
              <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
            </div>
          </div>
          <div className="text-gray-600">Fetching the latest data from GitHub</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="button-primary flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with gradient background */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Rust Oxide Plugins
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover and explore the best Rust plugins from GitHub repositories
            </p>
          </div>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            options={searchOptions}
            onOptionsChange={setSearchOptions}
            placeholder="Search by plugin name, author, repository, or description..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pluginIndex && finalFilteredPlugins && (
          <>
            <StatsBar
              totalCount={pluginIndex.count}
              filteredCount={finalFilteredPlugins.count}
              generatedAt={pluginIndex.generated_at}
              searchQuery={searchQuery}
            />
            
            <div className="flex gap-8">
              {/* Left Sidebar - Filters */}
              <div className="w-72 flex-shrink-0">
                <FilterPanel
                  plugins={searchFilteredPlugins ? searchFilteredPlugins.items : []}
                  activeFilters={activeFilters}
                  onFiltersChange={setActiveFilters}
                />
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-6">
              <div className="text-sm text-gray-600">
                {viewMode === 'grouped' ? (
                  <span>
                    Showing {(uniquePluginCount === 0 ? 0 : (currentPage - 1) * pageSize + 1).toLocaleString()}–
                    {Math.min(uniquePluginCount, currentPage * pageSize).toLocaleString()} of {uniquePluginCount.toLocaleString()} unique plugins 
                    ({finalFilteredPlugins.count.toLocaleString()} total instances)
                  </span>
                ) : (
                  <span>
                    Showing {(finalFilteredPlugins.count === 0 ? 0 : (currentPage - 1) * pageSize + 1).toLocaleString()}–
                    {Math.min(finalFilteredPlugins.count, currentPage * pageSize).toLocaleString()} of {finalFilteredPlugins.count.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">View:</span>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 flex items-center gap-1 transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="h-3 w-3" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`px-3 py-1 flex items-center gap-1 transition-colors border-l border-gray-300 ${
                        viewMode === 'grouped' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Package className="h-3 w-3" />
                      Grouped
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e): void => setSortBy(e.target.value as 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'indexed_desc' | 'indexed_asc')}
                    className="border border-gray-300 rounded-md px-2 py-1 bg-white"
                  >
                    <option value="updated_desc">Last updated — newest</option>
                    <option value="updated_asc">Last updated — oldest</option>
                    <option value="created_desc">Created — newest</option>
                    <option value="created_asc">Created — oldest</option>
                    <option value="indexed_desc">Indexed — newest</option>
                    <option value="indexed_asc">Indexed — oldest</option>
                  </select>
                </div>
                {viewMode === 'grid' && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-2 py-1 bg-white"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={30}>30</option>
                      <option value={48}>48</option>
                      <option value={60}>60</option>
                      <option value={96}>96</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {finalFilteredPlugins.count > 0 ? (
              <>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

                {viewMode === 'grid' ? (
                  <PluginGrid
                    plugins={pagedItems}
                    loading={loading}
                  />
                ) : (
                  <GroupedPluginView
                    plugins={pagedItems}
                    loading={loading}
                    sortBy={sortBy}
                  />
                )}

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
            ) : (
              <EmptyState
                type={activeFilters.length > 0 ? 'filter' : searchQuery ? 'search' : 'general'}
                title={
                  activeFilters.length > 0 
                    ? 'No plugins match your filters' 
                    : searchQuery 
                      ? 'No plugins found' 
                      : 'No plugins available'
                }
                description={
                  activeFilters.length > 0 
                    ? 'Try removing some filters or adjusting your criteria to see more results.'
                    : searchQuery 
                      ? `No plugins found matching "${searchQuery}". Try different keywords or check your spelling.`
                      : 'There are currently no plugins available to display.'
                }
                onReset={() => {
                  setSearchQuery('');
                  setActiveFilters([]);
                }}
              />
            )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer with modern design */}
      <footer className="relative mt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Code className="h-6 w-6 text-white" />
              <span className="text-white font-semibold">Rust Oxide Plugins</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Data sourced from GitHub repositories containing Oxide plugins.
            </p>
            <p className="text-gray-400 text-xs">
              Last updated: {pluginIndex ? new Date(pluginIndex.generated_at).toLocaleString() : 'Loading...'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
