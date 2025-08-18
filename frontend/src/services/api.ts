import type { PluginIndex } from '../types/plugin';

const API_BASE_URL = 'https://raw.githubusercontent.com/publicrust/plugins-forum/main/output';

export class ApiService {
  static async fetchPluginIndex(): Promise<PluginIndex> {
    try {
      const response = await fetch(`${API_BASE_URL}/oxide_plugins.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch plugin index:', error);
      throw error;
    }
  }

  static searchPlugins(query: string, plugins: PluginIndex): PluginIndex {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      return plugins;
    }

    const filteredItems = plugins.items.filter(plugin => {
      const searchFields = [
        plugin.plugin_name,
        plugin.plugin_author,
        plugin.repository.name,
        plugin.repository.full_name,
        plugin.repository.description,
        plugin.repository.owner_login,
        plugin.file.path
      ].filter(Boolean).map(field => field?.toLowerCase());

      return searchFields.some(field => field?.includes(searchTerm));
    });

    return {
      ...plugins,
      items: filteredItems,
      count: filteredItems.length
    };
  }
}

