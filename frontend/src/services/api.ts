import type { PluginIndex, SearchOptions, SearchFieldKey, IndexedPlugin } from '../types/plugin';
import { PluginMerger } from './pluginMerger';
import { CacheService, type CacheMetadata } from './cacheService';

const API_BASE_URL = 'https://raw.githubusercontent.com/publicrust/plugins-forum/main/backend/output';

export class ApiService {
  static async fetchPluginIndex(): Promise<PluginIndex> {
    try {
      // Fetch both plugin sources in parallel using cache
      const [oxidePlugins, crawledPlugins] = await Promise.all([
        CacheService.fetchWithCache<PluginIndex>(`${API_BASE_URL}/oxide_plugins.json`),
        CacheService.fetchWithCache<PluginIndex>(`${API_BASE_URL}/crawled_plugins.json`)
      ]);

      // Merge the plugin sources
      return PluginMerger.mergePluginSources(oxidePlugins, crawledPlugins);

    } catch (error) {
      console.error('Failed to fetch plugin index:', error);

      // Fallback: try to fetch oxide_plugins.json only
      try {
        console.warn('Falling back to oxide_plugins.json only');
        const oxidePlugins = await CacheService.fetchWithCache<PluginIndex>(`${API_BASE_URL}/oxide_plugins.json`);
        return oxidePlugins;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw error;
      }
    }
  }

  static searchPlugins(query: string, plugins: PluginIndex, options?: SearchOptions): PluginIndex {
    const q = query.trim();
    if (!q) return plugins;

    const fieldsToPick: SearchFieldKey[] = options ? options.fields : [
      'plugin_name',
      'plugin_author',
      'repo_name',
      'repo_full_name',
      'repo_description',
      'repo_owner',
      'file_path'
    ];
    const matchMode = options ? options.matchMode : 'contains';
    const logic = options ? options.logic : 'any';
    const caseSensitive = options ? options.caseSensitive : false;

    // Prepare query for regex mode
    let regex: RegExp | null = null;
    if (matchMode === 'regex') {
      try {
        regex = new RegExp(q, caseSensitive ? undefined : 'i');
      } catch {
        // Invalid regex: fallback to contains
        regex = null;
      }
    }

    const norm = (v: string | null | undefined): string => {
      if (v == null) return '';
      return caseSensitive ? String(v) : String(v).toLowerCase();
    };

    const queryNorm = caseSensitive ? q : q.toLowerCase();

    const pickField = (key: SearchFieldKey, p: IndexedPlugin): string => {
      switch (key) {
        case 'plugin_name':
          return norm(p.plugin_name);
        case 'plugin_author':
          return norm(p.plugin_author ?? '');
        case 'plugin_description':
          return norm(p.plugin_description ?? '');
        case 'plugin_version':
          return norm(p.plugin_version ?? '');
        case 'repo_name':
          return norm(p.repository?.name ?? '');
        case 'repo_full_name':
          return norm(p.repository?.full_name ?? '');
        case 'repo_description':
          return norm(p.repository?.description ?? '');
        case 'repo_owner':
          return norm(p.repository?.owner_login ?? '');
        case 'file_path':
          return norm(p.file?.path ?? '');
      }
    };

    const match = (fieldValue: string): boolean => {
      if (matchMode === 'regex' && regex) return regex.test(fieldValue);
      if (matchMode === 'exact') return fieldValue === queryNorm;
      if (matchMode === 'startsWith') return fieldValue.startsWith(queryNorm);
      // default contains
      return fieldValue.includes(queryNorm);
    };

    const filteredItems = plugins.items.filter((p) => {
      const fieldValues = fieldsToPick.map((key) => pickField(key, p));
      if (logic === 'all') {
        return fieldValues.every((fv) => match(fv));
      }
      return fieldValues.some((fv) => match(fv));
    });

    return { ...plugins, items: filteredItems, count: filteredItems.length };
  }

  static async clearCache(): Promise<void> {
    return CacheService.clearCache();
  }

  static async getCacheInfo(): Promise<Array<{ url: string; metadata: CacheMetadata; size: string }>> {
    return CacheService.getCacheInfo();
  }
}

