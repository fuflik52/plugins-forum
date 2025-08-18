export interface PluginFile {
  path: string;
  html_url: string;
  raw_url: string;
  sha?: string | null;
}

export interface PluginRepository {
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  owner_login: string;
  owner_url: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at?: string | null;
}

export interface PluginCommit {
  sha: string;
  author_name: string;
  author_login: string;
  author_url: string;
  committed_at: string;
  html_url: string;
}

export interface PluginCommits {
  created: PluginCommit;
  latest: PluginCommit;
}

export interface IndexedPlugin {
  plugin_name: string;
  plugin_author?: string | null;
  language: string;
  file: PluginFile;
  repository: PluginRepository;
  commits?: PluginCommits | null;
  indexed_at?: string | null;
}

export interface PluginIndex {
  generated_at: string;
  query: string;
  count: number;
  items: IndexedPlugin[];
}

