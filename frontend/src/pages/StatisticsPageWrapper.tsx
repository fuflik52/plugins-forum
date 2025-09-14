import React, { useState, useEffect } from 'react';
import { StatisticsPage } from './StatisticsPage';
import { ApiService } from '../services/api';
import type { IndexedPlugin } from '../types/plugin';

export const StatisticsPageWrapper: React.FC = () => {
  const [plugins, setPlugins] = useState<IndexedPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlugins = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const data = await ApiService.fetchPluginIndex();
        setPlugins(data.items);
      } catch (err) {
        setError('Failed to load plugin data for statistics');
        console.error('Error loading plugins for statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlugins();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-red-600 text-lg mb-4">⚠️ Error Loading Statistics</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <StatisticsPage plugins={plugins} loading={loading} />;
};