import type { IndexedPlugin } from '../types/plugin';

export interface FilterValue {
  field: keyof IndexedPlugin | 'repo_name' | 'repo_full_name' | 'repo_description' | 'repo_owner' | 'file_path';
  value: string;
}

export class FilterService {
  static applyFilters(plugins: IndexedPlugin[], filters: FilterValue[]): IndexedPlugin[] {
    if (filters.length === 0) return plugins;

    return plugins.filter(plugin => {
      return filters.every(filter => {
        const value = this.getFieldValue(plugin, filter.field);
        return value === filter.value;
      });
    });
  }

  private static getFieldValue(plugin: IndexedPlugin, field: FilterValue['field']): string | null {
    switch (field) {
      case 'plugin_name':
        return plugin.plugin_name || null;
      case 'plugin_author':
        return plugin.plugin_author || null;
      case 'plugin_version':
        return plugin.plugin_version || null;
      case 'plugin_description':
        return plugin.plugin_description || null;
      case 'language':
        return plugin.language || null;
      case 'repo_name':
        return plugin.repository?.name || null;
      case 'repo_full_name':
        return plugin.repository?.full_name || null;
      case 'repo_description':
        return plugin.repository?.description || null;
      case 'repo_owner':
        return plugin.repository?.owner_login || null;
      case 'file_path':
        return plugin.file?.path || null;
      default:
        return null;
    }
  }

  static getUniqueValues(plugins: IndexedPlugin[], field: FilterValue['field']): string[] {
    const values = plugins
      .map(plugin => this.getFieldValue(plugin, field))
      .filter((value): value is string => value !== null && value.trim() !== '');
    
    return Array.from(new Set(values)).sort();
  }

  static getFilterStats(plugins: IndexedPlugin[], filters: FilterValue[]): {
    total: number;
    filtered: number;
    authors: number;
    versions: number;
    repositories: number;
  } {
    const filteredPlugins = this.applyFilters(plugins, filters);
    
    return {
      total: plugins.length,
      filtered: filteredPlugins.length,
      authors: this.getUniqueValues(filteredPlugins, 'plugin_author').length,
      versions: this.getUniqueValues(filteredPlugins, 'plugin_version').length,
      languages: this.getUniqueValues(filteredPlugins, 'language').length,
      repositories: this.getUniqueValues(filteredPlugins, 'repo_full_name').length,
    };
  }
}