import { useState, useEffect } from 'react';
import type { PluginIndex } from './types/plugin';
import { ApiService } from './services/api';
import { SearchBar } from './components/SearchBar';
import { PluginGrid } from './components/PluginGrid';
import { StatsBar } from './components/StatsBar';
import { AlertCircle, RefreshCw, Zap, Sparkles, Code } from 'lucide-react';

function App() {
  const [pluginIndex, setPluginIndex] = useState<PluginIndex | null>(null);
  const [filteredPlugins, setFilteredPlugins] = useState<PluginIndex | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlugins();
  }, []);

  useEffect(() => {
    if (pluginIndex) {
      const filtered = ApiService.searchPlugins(searchQuery, pluginIndex);
      setFilteredPlugins(filtered);
    }
  }, [searchQuery, pluginIndex]);

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
            
            <PluginGrid
              plugins={filteredPlugins.items}
              loading={loading}
            />
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
