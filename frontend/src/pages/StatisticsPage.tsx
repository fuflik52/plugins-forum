import React, { useMemo } from 'react';
import type { IndexedPlugin } from '../types/plugin';
import { BarChart3, Users, Package, GitFork, Star, Calendar, TrendingUp, Database } from 'lucide-react';

interface StatisticsPageProps {
  plugins: IndexedPlugin[];
  loading?: boolean;
}

interface StatisticsData {
  totalPlugins: number;
  uniquePlugins: number;
  totalAuthors: number;
  totalRepositories: number;
  topAuthors: Array<{ name: string; count: number }>;
  topRepositories: Array<{ name: string; count: number }>;
  versionDistribution: Array<{ version: string; count: number }>;
  languageDistribution: Array<{ language: string; count: number }>;
  repositoryStats: {
    totalStars: number;
    totalForks: number;
    avgStarsPerRepo: number;
  };
  timeStats: {
    newestPlugin: string;
    oldestPlugin: string;
    pluginsThisYear: number;
  };
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({ plugins, loading = false }) => {
  const statistics: StatisticsData = useMemo(() => {
    if (plugins.length === 0) {
      return {
        totalPlugins: 0,
        uniquePlugins: 0,
        totalAuthors: 0,
        totalRepositories: 0,
        topAuthors: [],
        topRepositories: [],
        versionDistribution: [],
        languageDistribution: [],
        repositoryStats: { totalStars: 0, totalForks: 0, avgStarsPerRepo: 0 },
        timeStats: { newestPlugin: 'N/A', oldestPlugin: 'N/A', pluginsThisYear: 0 }
      };
    }

    // Count unique plugins by name
    const uniquePluginNames = new Set(plugins.map(p => p.plugin_name));
    
    // Count authors
    const authorCounts = new Map<string, number>();
    plugins.forEach(plugin => {
      if (plugin.plugin_author) {
        authorCounts.set(plugin.plugin_author, (authorCounts.get(plugin.plugin_author) || 0) + 1);
      }
    });

    // Count repositories
    const repositoryCounts = new Map<string, number>();
    const repositoryStats = new Map<string, { stars: number; forks: number }>();
    plugins.forEach(plugin => {
      const repoName = plugin.repository.full_name;
      repositoryCounts.set(repoName, (repositoryCounts.get(repoName) || 0) + 1);
      
      if (!repositoryStats.has(repoName)) {
        repositoryStats.set(repoName, {
          stars: plugin.repository.stargazers_count || 0,
          forks: plugin.repository.forks_count || 0
        });
      }
    });

    // Version distribution
    const versionCounts = new Map<string, number>();
    plugins.forEach(plugin => {
      if (plugin.plugin_version) {
        versionCounts.set(plugin.plugin_version, (versionCounts.get(plugin.plugin_version) || 0) + 1);
      }
    });

    // Language distribution
    const languageCounts = new Map<string, number>();
    plugins.forEach(plugin => {
      languageCounts.set(plugin.language, (languageCounts.get(plugin.language) || 0) + 1);
    });

    // Repository stats
    const totalStars = Array.from(repositoryStats.values()).reduce((sum, stats) => sum + stats.stars, 0);
    const totalForks = Array.from(repositoryStats.values()).reduce((sum, stats) => sum + stats.forks, 0);
    const avgStarsPerRepo = repositoryStats.size > 0 ? totalStars / repositoryStats.size : 0;

    // Time stats
    const currentYear = new Date().getFullYear();
    const pluginsThisYear = plugins.filter(plugin => {
      const date = plugin.indexed_at || plugin.repository.created_at;
      return date && new Date(date).getFullYear() === currentYear;
    }).length;

    const sortedByDate = plugins
      .filter(p => p.indexed_at || p.repository.created_at)
      .sort((a, b) => {
        const dateA = new Date(a.indexed_at || a.repository.created_at || 0).getTime();
        const dateB = new Date(b.indexed_at || b.repository.created_at || 0).getTime();
        return dateB - dateA;
      });

    const newestPlugin = sortedByDate[0]?.plugin_name || 'N/A';
    const oldestPlugin = sortedByDate[sortedByDate.length - 1]?.plugin_name || 'N/A';

    // Top 10 lists
    const topAuthors = Array.from(authorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topRepositories = Array.from(repositoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topVersions = Array.from(versionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([version, count]) => ({ version, count }));

    const topLanguages = Array.from(languageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([language, count]) => ({ language, count }));

    return {
      totalPlugins: plugins.length,
      uniquePlugins: uniquePluginNames.size,
      totalAuthors: authorCounts.size,
      totalRepositories: repositoryCounts.size,
      topAuthors,
      topRepositories,
      versionDistribution: topVersions,
      languageDistribution: topLanguages,
      repositoryStats: {
        totalStars,
        totalForks,
        avgStarsPerRepo: Math.round(avgStarsPerRepo * 10) / 10
      },
      timeStats: {
        newestPlugin,
        oldestPlugin,
        pluginsThisYear
      }
    };
  }, [plugins]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Plugin Statistics
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Comprehensive analytics for Rust Oxide plugins ecosystem
          </p>
          
          {/* Navigation Links */}
          <div className="flex items-center justify-center space-x-4">
            <a
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-all duration-200 text-sm font-medium"
            >
              🏠 Home
            </a>
            <a
              href="/statistics"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              📊 Statistics
            </a>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plugins</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalPlugins.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Plugins</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.uniquePlugins.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Authors</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalAuthors.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Repositories</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalRepositories.toLocaleString()}</p>
              </div>
              <GitFork className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Repository Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stars</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.repositoryStats.totalStars.toLocaleString()}</p>
              </div>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Forks</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.repositoryStats.totalForks.toLocaleString()}</p>
              </div>
              <GitFork className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Stars/Repo</p>
                <p className="text-2xl font-bold text-green-600">{statistics.repositoryStats.avgStarsPerRepo}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Authors */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Top Authors
            </h2>
            <div className="space-y-3">
              {statistics.topAuthors.map((author, index) => (
                <div key={author.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900 ml-3">{author.name}</span>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {author.count} plugins
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Repositories */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <GitFork className="h-5 w-5 mr-2 text-orange-600" />
              Top Repositories
            </h2>
            <div className="space-y-3">
              {statistics.topRepositories.map((repo, index) => (
                <div key={repo.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900 ml-3 truncate">{repo.name}</span>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {repo.count} plugins
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Version Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Version Distribution
            </h2>
            <div className="space-y-3">
              {statistics.versionDistribution.map((version, index) => (
                <div key={version.version} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900 ml-3">v{version.version}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(version.count / statistics.versionDistribution[0]?.count || 1) * 100}%` }}
                      ></div>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {version.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-600" />
              Languages
            </h2>
            <div className="space-y-4">
              {statistics.languageDistribution.map((language) => (
                <div key={language.language} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{language.language}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full" 
                        style={{ width: `${(language.count / plugins.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {((language.count / plugins.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Statistics */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
            Time Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Newest Plugin</p>
              <p className="text-lg font-bold text-indigo-600">{statistics.timeStats.newestPlugin}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Oldest Plugin</p>
              <p className="text-lg font-bold text-indigo-600">{statistics.timeStats.oldestPlugin}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Plugins This Year</p>
              <p className="text-lg font-bold text-indigo-600">{statistics.timeStats.pluginsThisYear}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Statistics updated in real-time based on indexed plugins</p>
          <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};