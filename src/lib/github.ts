import type { GitHubRepo, GitHubStats, GitHubUser, PinnedRepo, TopLanguage } from '@/types/github'
import { LANGUAGE_COLORS } from '@/types/github'

// =============================================================================
// GitHub API Helper
// =============================================================================

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'octocat'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

// ---------------------------------------------------------------------------
// Request builder
// ---------------------------------------------------------------------------

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'portfolio-v4/1.0',
  }

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }

  return headers
}

async function githubFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${GITHUB_API_BASE}${path}`

  const res = await fetch(url, {
    ...init,
    headers: {
      ...buildHeaders(),
      ...(init?.headers ?? {}),
    },
    // ISR: revalidate every 10 minutes in production
    next: { revalidate: 600 },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new GitHubApiError(`GitHub API error ${res.status} for ${url}: ${body}`, res.status)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'GitHubApiError'
  }
}

// ---------------------------------------------------------------------------
// Individual fetch functions
// ---------------------------------------------------------------------------

/** Fetches the authenticated user's public profile. */
export async function fetchGitHubUser(username = GITHUB_USERNAME): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${encodeURIComponent(username)}`)
}

/**
 * Fetches ALL public repositories for a user, handling GitHub's pagination
 * (max 100 per page). Returns up to 1 000 repos.
 */
export async function fetchAllRepos(username = GITHUB_USERNAME): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const repos = await githubFetch<GitHubRepo[]>(
      `/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`
    )

    allRepos.push(...repos)

    // Stop when we get fewer items than the page size (last page)
    if (repos.length < perPage || allRepos.length >= 1000) {
      break
    }
    page++
  }

  return allRepos
}

/**
 * Fetches the language breakdown (in bytes) for a single repo.
 * Returns an empty object on failure (some repos have no language data).
 */
export async function fetchRepoLanguages(
  username: string,
  repoName: string
): Promise<Record<string, number>> {
  try {
    return await githubFetch<Record<string, number>>(
      `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/languages`
    )
  } catch {
    return {}
  }
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

/**
 * Computes the top N languages across all repos, sorted by total byte count.
 * If aggregated language bytes are unavailable it falls back to counting
 * repos per primary language.
 */
export function computeTopLanguages(repos: GitHubRepo[], topN = 8): TopLanguage[] {
  const byteCounts: Record<string, number> = {}

  for (const repo of repos) {
    if (!repo.language || repo.fork || repo.archived) {
      continue
    }
    byteCounts[repo.language] = (byteCounts[repo.language] ?? 0) + (repo.size ?? 1)
  }

  const totalBytes = Object.values(byteCounts).reduce((sum, b) => sum + b, 0)
  if (totalBytes === 0) {
    return []
  }

  return Object.entries(byteCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      color: LANGUAGE_COLORS[name],
    }))
}

/**
 * Selects the top N repos by star count, excluding forks and archived repos
 * unless there aren't enough original repos.
 */
export function selectPinnedRepos(repos: GitHubRepo[], topN = 6): PinnedRepo[] {
  // First try: non-fork, non-archived, with stars or activity
  const candidates = repos
    .filter((r) => !r.fork && !r.archived && !r.disabled)
    .sort((a, b) => {
      // Primary sort: stars desc
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count
      }
      // Secondary sort: recently updated
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

  // If we don't have enough, include forks too
  const pool =
    candidates.length >= topN
      ? candidates
      : [
          ...candidates,
          ...repos
            .filter((r) => r.fork && !r.archived)
            .sort((a, b) => b.stargazers_count - a.stargazers_count),
        ]

  return pool.slice(0, topN).map(repoToPinnedRepo)
}

/** Maps a raw GitHubRepo to the leaner PinnedRepo shape used in the UI. */
function repoToPinnedRepo(repo: GitHubRepo): PinnedRepo {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    language: repo.language,
    topics: repo.topics ?? [],
    url: repo.html_url,
    homepage: repo.homepage,
    is_fork: repo.fork,
    is_archived: repo.archived,
    is_template: repo.is_template,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    open_issues: repo.open_issues_count,
    visibility: repo.visibility,
    license: repo.license?.name ?? null,
    size: repo.size,
  }
}

// ---------------------------------------------------------------------------
// Main aggregation function
// ---------------------------------------------------------------------------

/**
 * Fetches all GitHub data for a user and returns a unified {@link GitHubStats}
 * payload.  This is called by the `/api/github` route handler.
 *
 * @param username — GitHub username (defaults to NEXT_PUBLIC_GITHUB_USERNAME)
 */
export async function fetchGitHubStats(username = GITHUB_USERNAME): Promise<GitHubStats> {
  // Fetch user profile and repos in parallel
  const [user, repos] = await Promise.all([fetchGitHubUser(username), fetchAllRepos(username)])

  // Aggregate stats
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0)
  const topLanguages = computeTopLanguages(repos)
  const pinnedRepos = selectPinnedRepos(repos, 6)

  return {
    username: user.login,
    name: user.name,
    avatar_url: user.avatar_url,
    bio: user.bio,
    location: user.location,
    blog: user.blog,
    company: user.company,
    twitter_username: user.twitter_username,
    html_url: user.html_url,
    public_repos: user.public_repos,
    public_gists: user.public_gists,
    followers: user.followers,
    following: user.following,
    created_at: user.created_at,
    updated_at: user.updated_at,
    total_stars: totalStars,
    total_forks: totalForks,
    top_languages: topLanguages,
    pinned_repos: pinnedRepos,
    fetched_repos_count: repos.length,
    generated_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Cache wrapper (in-memory, server-side only)
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const serverCache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL_MS = 10 * 60 * 1_000 // 10 minutes

/**
 * Returns cached GitHub stats if available and fresh, otherwise fetches and
 * caches new data.  Uses an in-memory Map so it survives multiple requests
 * within the same server process lifetime.
 */
export async function getCachedGitHubStats(username = GITHUB_USERNAME): Promise<GitHubStats> {
  const cacheKey = `github:stats:${username}`
  const cached = serverCache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as GitHubStats
  }

  const fresh = await fetchGitHubStats(username)
  serverCache.set(cacheKey, { data: fresh, expiresAt: Date.now() + CACHE_TTL_MS })
  return fresh
}

/**
 * Invalidates the server-side cache for a user.
 * Useful for webhook-triggered revalidation.
 */
export function invalidateGitHubCache(username = GITHUB_USERNAME): void {
  serverCache.delete(`github:stats:${username}`)
}

// ---------------------------------------------------------------------------
// Utility: language colour lookup
// ---------------------------------------------------------------------------

/**
 * Returns the hex colour for a given language name, falling back to a
 * deterministic grey derived from the language name's char codes.
 */
export function getLanguageColor(language: string | null): string {
  if (!language) {
    return '#64748b'
  }
  if (LANGUAGE_COLORS[language]) {
    return LANGUAGE_COLORS[language]
  }

  // Deterministic fallback: hash the name into a hue
  let hash = 0
  for (let i = 0; i < language.length; i++) {
    hash = language.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 55%)`
}
