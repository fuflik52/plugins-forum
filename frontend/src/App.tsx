import { useState, useEffect } from 'react';
import type { PluginIndex } from './types/plugin';
import { type SearchOptions, getDefaultSearchOptions } from './types/plugin';
import { ApiService } from './services/api';
import { SearchBar } from './components/SearchBar';
import { PluginGrid } from './components/PluginGrid';
import { StatsBar } from './components/StatsBar';
import { AlertCircle, RefreshCw, Zap, Sparkles, Code } from 'lucide-react';
import { Pagination } from './components/Pagination';

function App() {
  const [pluginIndex, setPluginIndex] = useState<PluginIndex | null>(null);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginIndex | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(getDefaultSearchOptions());
  const [sortBy, setSortBy] = useState<
    'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc' | 'indexed_desc' | 'indexed_asc'
  >('updated_desc');

  useEffect(() => {
    loadPlugins();
  }, []);

  useEffect(() => {
    if (pluginIndex) {
      const filtered = ApiService.searchPlugins(searchQuery, pluginIndex, searchOptions);
      setFilteredPlugins(filtered);
      setCurrentPage(1);
    }
  }, [searchQuery, pluginIndex, searchOptions]);

  const loadPlugins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.fetchPluginIndex();
      setPluginIndex(data);
      setFilteredPlugins(data);
    } catch (err) {
      setError('Failed to load plugins. Please try again later.');
      console.error('Error loading plugins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleRefresh = () => {
    loadPlugins();
  };

  const pagedItems = (() => {
    if (!filteredPlugins) return [];
    const getTs = (p: any, mode: 'updated' | 'created' | 'indexed'): number => {
      try {
        if (mode === 'updated') {
          const d = p?.commits?.latest?.committed_at ?? p?.indexed_at ?? p?.repository?.created_at;
          return d ? new Date(d).getTime() : 0;
        }
        if (mode === 'created') {
          const d = p?.commits?.created?.committed_at ?? p?.repository?.created_at ?? p?.indexed_at;
          return d ? new Date(d).getTime() : 0;
        }
        // indexed
        const d = p?.indexed_at ?? p?.commits?.latest?.committed_at ?? p?.repository?.created_at;
        return d ? new Date(d).getTime() : 0;
      } catch {
        return 0;
      }
    };

    const [field, dir] = (() => {
      if (sortBy.startsWith('updated')) return ['updated', sortBy.endsWith('asc') ? 'asc' : 'desc'] as const;
      if (sortBy.startsWith('created')) return ['created', sortBy.endsWith('asc') ? 'asc' : 'desc'] as const;
      return ['indexed', sortBy.endsWith('asc') ? 'asc' : 'desc'] as const;
    })();

    const sorted = [...filteredPlugins.items].sort((a, b) => {
      const ta = getTs(a, field as any);
      const tb = getTs(b, field as any);
      const diff = tb - ta;
      return dir === 'asc' ? -diff : diff;
    });

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  })();

  const totalPages = filteredPlugins ? Math.max(1, Math.ceil(filteredPlugins.count / pageSize)) : 1;

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
            onChange={handleSearchChange}
            options={searchOptions}
            onOptionsChange={setSearchOptions}
            placeholder="Search by plugin name, author, repository, or description..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {pluginIndex && filteredPlugins && (
          <>
            <StatsBar
              totalCount={pluginIndex.count}
              filteredCount={filteredPlugins.count}
              generatedAt={pluginIndex.generated_at}
              searchQuery={searchQuery}
            />
            
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="text-sm text-gray-600">
                Showing {(filteredPlugins.count === 0 ? 0 : (currentPage - 1) * pageSize + 1).toLocaleString()}–
                {Math.min(filteredPlugins.count, currentPage * pageSize).toLocaleString()} of {filteredPlugins.count.toLocaleString()}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
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
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
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
              </div>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <PluginGrid
              plugins={pagedItems}
              loading={loading}
            />

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
