declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

/**
 * Google Analytics 4 tracking utilities
 */
export class Analytics {
  private static isEnabled(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  /**
   * Track page view
   */
  static trackPageView(path: string, title?: string): void {
    if (!this.isEnabled()) return;

    window.gtag('config', 'G-CKP8G29QS3', {
      page_path: path,
      page_title: title || document.title,
    });
  }

  /**
   * Track custom events
   */
  static trackEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isEnabled()) return;

    window.gtag('event', eventName, {
      custom_parameter: true,
      ...parameters,
    });
  }

  /**
   * Track plugin-specific events
   */
  static trackPluginView(pluginName: string, repository: string): void {
    this.trackEvent('plugin_view', {
      plugin_name: pluginName,
      repository: repository,
      event_category: 'plugin_interaction',
    });
  }

  static trackPluginSearch(query: string, resultCount: number): void {
    this.trackEvent('search', {
      search_term: query,
      result_count: resultCount,
      event_category: 'search',
    });
  }

  static trackFilterUse(filterType: string, filterValue: string): void {
    this.trackEvent('filter_use', {
      filter_type: filterType,
      filter_value: filterValue,
      event_category: 'filter',
    });
  }

  static trackExternalLink(url: string, linkType: 'github' | 'discord' | 'other'): void {
    this.trackEvent('click', {
      link_url: url,
      link_type: linkType,
      event_category: 'external_link',
      outbound: true,
    });
  }
}