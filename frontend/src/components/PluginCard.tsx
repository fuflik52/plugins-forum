import React from 'react';
import type { IndexedPlugin } from '../types/plugin';
import { Star, GitFork, MessageCircle, Calendar, User, FileCode, Github, Eye } from 'lucide-react';

interface PluginCardProps {
  plugin: IndexedPlugin;
}

export const PluginCard: React.FC<PluginCardProps> = ({ plugin }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  // Проверяем наличие необходимых данных
  if (!plugin || !plugin.repository || !plugin.file) {
    return (
      <div className="plugin-card">
        <div className="p-8">
          <div className="text-gray-500 text-center">Invalid plugin data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="plugin-card group">
      <div className="p-8">
        {/* Header with gradient background */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">
                  {plugin.plugin_name || 'Unnamed Plugin'}
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <div className="icon-wrapper mr-3">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium">
                    {plugin.plugin_author || plugin.repository.owner_login || 'Unknown Author'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="badge">
                  {plugin.language || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Repository Info */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Github className="h-5 w-5 text-gray-600" />
            <h4 className="text-lg font-semibold text-gray-800">
              {plugin.repository.full_name || 'Unknown Repository'}
            </h4>
          </div>
          {plugin.repository.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {plugin.repository.description}
            </p>
          )}
        </div>

        {/* Stats with modern design */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100/50">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">{plugin.repository.stargazers_count?.toLocaleString() || 0}</div>
            <div className="text-xs text-gray-600">Stars</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100/50">
            <div className="flex items-center justify-center mb-2">
              <GitFork className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">{plugin.repository.forks_count?.toLocaleString() || 0}</div>
            <div className="text-xs text-gray-600">Forks</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100/50">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">{plugin.repository.open_issues_count?.toLocaleString() || 0}</div>
            <div className="text-xs text-gray-600">Issues</div>
          </div>
        </div>

        {/* File Info with modern design */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50">
          <div className="flex items-center text-gray-700 mb-2">
            <FileCode className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-semibold">File:</span>
            <span className="ml-2 text-gray-600 font-mono text-sm">{plugin.file.path || 'Unknown file'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            <span className="text-sm">
              Latest: {plugin.commits?.latest?.committed_at ? formatDate(plugin.commits.latest.committed_at) : 'Unknown date'}
            </span>
          </div>
        </div>

        {/* Actions with modern buttons */}
        <div className="flex items-center space-x-4">
          {plugin.repository.html_url && (
            <a
              href={plugin.repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary flex items-center"
            >
              <Github className="h-4 w-4 mr-2" />
              Repository
            </a>
          )}
          {plugin.file.html_url && (
            <a
              href={plugin.file.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="button-secondary flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              View File
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

