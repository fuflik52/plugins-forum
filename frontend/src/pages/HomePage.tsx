import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { PluginIndex, IndexedPlugin } from '../types/plugin';
import { ApiService } from '../services/api';
import { FilterService } from '../services/filterService';
import { enableDOMMonitoring } from '../utils/domAnalytics';
import {
  optimizeAnimations,
  optimizeScrollHandlers,
  optimizeReactPerformance,
  enableMemoryOptimization,
  preventLayoutShift
} from '../utils/performanceOptimizer';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { PluginGrid } from '../components/PluginGrid';
import { GroupedPluginView } from '../components/GroupedPluginView';
import { StatsBar } from '../components/StatsBar';
import { EmptyState } from '../components/EmptyState';
import { AlertCircle, RefreshCw, Zap, Sparkles, Code, Grid, Package } from 'lucide-react';
import { Pagination } from '../components/Pagination';
import { useUrlState } from '../hooks/useUrlState';
import { getPluginTimestamp } from '../utils/dateUtils';
import { debugSortOrder } from '../utils/debugSort';
import { Analytics } from '../utils/analytics';

export const HomePage: React.FC = () => {
  const [pluginIndex, setPluginIndex] = useState<PluginIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    searchQuery,
    viewMode,
    sortBy,
    currentPage,
    pageSize,
    searchOptions,
    activeFilters,
    setSearchQuery,
    setViewMode,
    setSortBy,
    setCurrentPage,
    setPageSize,
    setSearchOptions,
    setActiveFilters
  } = useUrlState();

  useEffect(() => {
    void loadPlugins();

    optimizeAnimations();
    optimizeReactPerformance();
    preventLayoutShift();

    const scrollCleanup = optimizeScrollHandlers();
    const memoryCleanup = enableMemoryOptimization();
    const domCleanup = enableDOMMonitoring();

    return (): void => {
      scrollCleanup();
      memoryCleanup();
      domCleanup();
    };
  }, []);

  useEffect(() => {
    return (): void => {
      setPluginIndex(null);
      setError(null);
    };
  }, []);

  const filteredData = useMemo((): {
    searchFiltered: IndexedPlugin[];
    finalFiltered: IndexedPlugin[];
    totalCount: number;
    filteredCount: number;
  } | null => {
    if (!pluginIndex) return null;

    const searchFiltered = searchQuery.trim()
      ? ApiService.searchPlugins(searchQuery, pluginIndex, searchOptions)
      : pluginIndex;

    const finalItems = activeFilters.length > 0
      ? FilterService.applyFilters(searchFiltered.items, activeFilters)
      : searchFiltered.items;

    if (searchQuery.trim()) {
      Analytics.trackPluginSearch(searchQuery.trim(), finalItems.length);
    }

    return {
      searchFiltered: searchFiltered.items,
      finalFiltered: finalItems,
      totalCount: pluginIndex.count,
      filteredCount: finalItems.length
    };
  }, [pluginIndex, searchQuery, searchOptions, activeFilters]);

  const loadPlugins = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.fetchPluginIndex();
      setPluginIndex(data);
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

  const uniquePluginCount = useMemo(() => {
    if (!filteredData) return 0;
    const uniqueNames = new Set<string>();
    for (const plugin of filteredData.finalFiltered) {
      uniqueNames.add(plugin.plugin_name || 'Unknown');
    }
    return uniqueNames.size;
  }, [filteredData]);

  const groupedData = useMemo(() => {
    if (!filteredData || viewMode !== 'grouped') return null;

    const groups: Record<string, IndexedPlugin[]> = {};

    filteredData.finalFiltered.forEach(plugin => {
      const name = plugin.plugin_name || 'Unknown';
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(plugin);
    });

    const [field, dir]: ['updated' | 'created' | 'indexed', 'asc' | 'desc'] = ((): ['updated' | 'created' | 'indexed', 'asc' | 'desc'] => {
      if (sortBy.startsWith('updated')) return ['updated', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      if (sortBy.startsWith('created')) return ['created', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      return ['indexed', sortBy.endsWith('asc') ? 'asc' : 'desc'];
    })();

    const sortedGroups = Object.entries(groups)
      .map(([name, pluginList]) => {
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
  }, [filteredData, viewMode, sortBy, currentPage, pageSize]);

  const pagedItems = useMemo((): IndexedPlugin[] => {
    if (!filteredData) return [];

    if (viewMode === 'grouped') {
      if (!groupedData) return [];
      const plugins: IndexedPlugin[] = [];
      groupedData.pagedGroups.forEach(group => {
        plugins.push(...group.plugins);
      });
      return plugins;
    }

    const [field, dir]: ['updated' | 'created' | 'indexed', 'asc' | 'desc'] = ((): ['updated' | 'created' | 'indexed', 'asc' | 'desc'] => {
      if (sortBy.startsWith('updated')) return ['updated', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      if (sortBy.startsWith('created')) return ['created', sortBy.endsWith('asc') ? 'asc' : 'desc'];
      return ['indexed', sortBy.endsWith('asc') ? 'asc' : 'desc'];
    })();

    const sortedIndices = filteredData.finalFiltered
      .map((_, index) => index)
      .sort((indexA, indexB) => {
        const pluginA = filteredData.finalFiltered[indexA];
        const pluginB = filteredData.finalFiltered[indexB];
        const ta = getPluginTimestamp(pluginA, field);
        const tb = getPluginTimestamp(pluginB, field);
        const diff = tb - ta;
        return dir === 'asc' ? -diff : diff;
      });

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const result = sortedIndices
      .slice(start, end)
      .map(index => filteredData.finalFiltered[index]);

    if (field === 'created' && dir === 'desc') {
      const allSorted = sortedIndices.map(index => filteredData.finalFiltered[index]);
      debugSortOrder(allSorted);
    }

    return result;
  }, [filteredData, viewMode, groupedData, sortBy, currentPage, pageSize]);

  const totalPages = useMemo((): number => {
    if (!filteredData) return 1;

    if (viewMode === 'grouped') {
      return groupedData ? Math.max(1, Math.ceil(groupedData.totalGroups / pageSize)) : 1;
    }

    return Math.max(1, Math.ceil(filteredData.filteredCount / pageSize));
  }, [filteredData, groupedData, viewMode, pageSize]);

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
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-4">
              Discover and explore the best Rust plugins from GitHub repositories
            </p>

            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                🏠 Home
              </Link>
              <Link
                to="/statistics"
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-sm font-medium"
              >
                📊 Statistics
              </Link>
            </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pluginIndex && filteredData && (
          <>
            <StatsBar
              totalCount={filteredData.totalCount}
              filteredCount={filteredData.filteredCount}
              generatedAt={pluginIndex.generated_at}
              searchQuery={searchQuery}
            />

            <div className="flex gap-8">
              <div className="w-72 flex-shrink-0">
                <FilterPanel
                  plugins={filteredData.searchFiltered}
                  activeFilters={activeFilters}
                  onFiltersChange={setActiveFilters}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="text-sm text-gray-600">
                    {viewMode === 'grouped' ? (
                      <span>
                        Showing {(uniquePluginCount === 0 ? 0 : (currentPage - 1) * pageSize + 1).toLocaleString()}–
                        {Math.min(uniquePluginCount, currentPage * pageSize).toLocaleString()} of {uniquePluginCount.toLocaleString()} unique plugins
                        ({filteredData.filteredCount.toLocaleString()} total instances)
                      </span>
                    ) : (
                      <span>
                        Showing {(filteredData.filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1).toLocaleString()}–
                        {Math.min(filteredData.filteredCount, currentPage * pageSize).toLocaleString()} of {filteredData.filteredCount.toLocaleString()}
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

                {filteredData.filteredCount > 0 ? (
                  <>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

                    {viewMode === 'grid' ? (
                      <PluginGrid
                        plugins={pagedItems}
                        loading={loading}
                        allPlugins={pluginIndex.items}
                      />
                    ) : (
                      <GroupedPluginView
                        plugins={pagedItems}
                        loading={loading}
                        sortBy={sortBy}
                        allPlugins={pluginIndex.items}
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
};