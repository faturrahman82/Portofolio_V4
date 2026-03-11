// =============================================================================
// GitHub API — TypeScript Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Raw GitHub REST API response shapes
// -----------------------------------------------------------------------------

export interface GitHubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: 'User' | 'Organization'
  site_admin: boolean
  name: string | null
  company: string | null
  blog: string | null
  location: string | null
  email: string | null
  hireable: boolean | null
  bio: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepo {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: GitHubRepoOwner
  html_url: string
  description: string | null
  fork: boolean
  url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  teams_url: string
  hooks_url: string
  issue_events_url: string
  events_url: string
  assignees_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  git_tags_url: string
  git_refs_url: string
  trees_url: string
  statuses_url: string
  languages_url: string
  stargazers_url: string
  contributors_url: string
  subscribers_url: string
  subscription_url: string
  commits_url: string
  git_commits_url: string
  comments_url: string
  issue_comment_url: string
  contents_url: string
  compare_url: string
  merges_url: string
  archive_url: string
  downloads_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  deployments_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  svn_url: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  mirror_url: string | null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: GitHubLicense | null
  allow_forking: boolean
  is_template: boolean
  web_commit_signoff_required: boolean
  topics: string[]
  visibility: 'public' | 'private' | 'internal'
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
}

export interface GitHubRepoOwner {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: 'User' | 'Organization'
  site_admin: boolean
}

export interface GitHubLicense {
  key: string
  name: string
  spdx_id: string
  url: string | null
  node_id: string
}

// -----------------------------------------------------------------------------
// Processed / aggregated data shapes (used by the API route and UI)
// -----------------------------------------------------------------------------

/** A summarised repo card used in the Projects section */
export interface PinnedRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  stars: number
  forks: number
  watchers: number
  language: string | null
  topics: string[]
  url: string
  homepage: string | null
  is_fork: boolean
  is_archived: boolean
  is_template: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  open_issues: number
  visibility: 'public' | 'private' | 'internal'
  license: string | null
  size: number
}

/** Top language entry with computed percentage */
export interface TopLanguage {
  name: string
  /** Raw byte count from GitHub's language breakdown */
  bytes: number
  /** Percentage share of total bytes (0–100) */
  percentage: number
  /** Hex colour code for this language (optional, provided by GitHub linguist) */
  color?: string
}

/** The unified JSON payload returned by /api/github */
export interface GitHubStats {
  username: string
  name: string | null
  avatar_url: string
  bio: string | null
  location: string | null
  blog: string | null
  company: string | null
  twitter_username: string | null
  html_url: string
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  /** Sum of stargazers_count across all public repos */
  total_stars: number
  /** Sum of forks_count across all public repos */
  total_forks: number
  /** Top languages sorted by byte count */
  top_languages: TopLanguage[]
  /** Top repos sorted by stars, capped at 6 */
  pinned_repos: PinnedRepo[]
  /** Total number of repos fetched (may differ from public_repos due to pagination) */
  fetched_repos_count: number
  /** ISO timestamp of when this data was generated */
  generated_at: string
}

// -----------------------------------------------------------------------------
// API route response wrappers
// -----------------------------------------------------------------------------

export interface GitHubApiSuccess {
  ok: true
  data: GitHubStats
}

export interface GitHubApiError {
  ok: false
  error: string
  status?: number
}

export type GitHubApiResponse = GitHubApiSuccess | GitHubApiError

// -----------------------------------------------------------------------------
// Language colour map (GitHub Linguist palette — partial)
// -----------------------------------------------------------------------------

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Clojure: '#db5855',
  'F#': '#b845fc',
  Lua: '#000080',
  Shell: '#89e051',
  PowerShell: '#012456',
  Dockerfile: '#384d54',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Astro: '#ff5a03',
  MDX: '#fcb32c',
  Markdown: '#083fa1',
  JSON: '#292929',
  YAML: '#cb171e',
  TOML: '#9c4221',
  Nix: '#7e7eff',
  OCaml: '#3be133',
  Zig: '#ec915c',
  Assembly: '#6E4C13',
  Solidity: '#AA6746',
  'Jupyter Notebook': '#DA5B0B',
  R: '#198CE7',
  MATLAB: '#e16737',
}

// -----------------------------------------------------------------------------
// Utility type helpers
// -----------------------------------------------------------------------------

/** Extract the keys whose values are strings */
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

/** Make selected keys required */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/** SWR hook return shape for GitHub stats */
export interface UseGitHubStatsReturn {
  data: GitHubStats | undefined
  error: Error | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: () => void
}
