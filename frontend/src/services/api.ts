import type { PluginIndex, SearchOptions, SearchFieldKey } from '../types/plugin';

const API_BASE_URL = 'https://raw.githubusercontent.com/publicrust/plugins-forum/main/backend/output';

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

  static searchPlugins(query: string, plugins: PluginIndex, options?: SearchOptions): PluginIndex {
    const q = query.trim();
    if (!q) return plugins;

    const fieldsToPick: SearchFieldKey[] = options?.fields ?? [
      'plugin_name',
      'plugin_author',
      'repo_name',
      'repo_full_name',
      'repo_description',
      'repo_owner',
      'file_path'
    ];
    const matchMode = options?.matchMode ?? 'contains';
    const logic = options?.logic ?? 'any';
    const caseSensitive = options?.caseSensitive ?? false;

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

    const norm = (v: string | null | undefined) => {
      if (v == null) return '';
      return caseSensitive ? String(v) : String(v).toLowerCase();
    };

    const queryNorm = caseSensitive ? q : q.toLowerCase();

    const pickField = (key: SearchFieldKey, p: any): string => {
      switch (key) {
        case 'plugin_name':
          return norm(p.plugin_name);
        case 'plugin_author':
          return norm(p.plugin_author ?? '');
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
}

