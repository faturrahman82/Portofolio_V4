import useSWR from 'swr'

import type { GitHubStats } from '@/types/github'

// =============================================================================
// Fetcher
// =============================================================================

class FetchError extends Error {
  status: number
  info: unknown

  constructor(message: string, status: number, info: unknown) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.info = info
  }
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)

  if (!res.ok) {
    let info: unknown
    try {
      info = await res.json()
    } catch {
      info = await res.text().catch(() => '')
    }
    throw new FetchError(`Request failed with status ${res.status}: ${url}`, res.status, info)
  }

  const json = await res.json()

  // The /api/github route wraps the payload in { ok, data }.
  // Unwrap it so SWR consumers receive GitHubStats directly.
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T
  }

  return json as T
}

// =============================================================================
// Return type
// =============================================================================

export interface UseGithubStatsReturn {
  /** Aggregated GitHub stats payload */
  data: GitHubStats | undefined
  /** Error thrown during fetch, if any */
  error: FetchError | Error | undefined
  /** True on the first load before any data is available */
  isLoading: boolean
  /** True while a revalidation is in-flight (including initial load) */
  isValidating: boolean
  /** True when data has loaded at least once and is not currently loading */
  isReady: boolean
  /** Programmatically revalidate / refresh the data */
  mutate: () => void
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Fetches aggregated GitHub statistics from the internal `/api/github` route.
 *
 * Features:
 * - SWR cache with 10-minute deduplication interval
 * - No revalidation on window focus (stats don't change frequently)
 * - No revalidation on reconnect (avoids unnecessary bursts)
 * - Retries up to 2 times on failure with exponential back-off
 * - Exposes typed `isLoading`, `isReady`, and `error` for easy UI branching
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGithubStats()
 *
 * if (isLoading) return <Skeleton />
 * if (error)     return <ErrorMessage />
 * return <StatsGrid data={data} />
 * ```
 */
export function useGithubStats(): UseGithubStatsReturn {
  const { data, error, isLoading, isValidating, mutate } = useSWR<GitHubStats, FetchError | Error>(
    '/api/github',
    fetcher,
    {
      // -----------------------------------------------------------------------
      // Caching / revalidation strategy
      // -----------------------------------------------------------------------

      /** Don't re-fetch when the user tabs back into the window. */
      revalidateOnFocus: false,

      /** Don't re-fetch when the browser reconnects to the internet. */
      revalidateOnReconnect: false,

      /**
       * De-duplicate identical requests within a 10-minute window.
       * Matches the ISR revalidation interval on the API route.
       */
      dedupingInterval: 10 * 60 * 1_000,

      /**
       * Keep stale data visible while revalidating in the background
       * (avoids flash of skeleton on subsequent visits).
       */
      revalidateIfStale: true,

      // -----------------------------------------------------------------------
      // Error retry
      // -----------------------------------------------------------------------

      /** Retry up to 2 times. */
      errorRetryCount: 2,

      /**
       * Custom back-off: 3 s, then 8 s.
       * Avoids hammering the GitHub API on transient failures.
       */
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        // Never retry on 404 — the username simply doesn't exist
        if (err instanceof FetchError && err.status === 404) {
          return
        }

        // Stop after 2 retries
        if (retryCount >= 2) {
          return
        }

        const delay = retryCount === 0 ? 3_000 : 8_000
        setTimeout(() => void revalidate({ retryCount }), delay)
      },

      // -----------------------------------------------------------------------
      // Suspense (disabled — consumers handle loading state manually)
      // -----------------------------------------------------------------------
      suspense: false,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    /** Considered "ready" when we have data and are not on the first load */
    isReady: !isLoading && data !== undefined,
    mutate,
  }
}

// =============================================================================
// Granular selector hooks
// (avoid re-renders when only a specific part of the data changes)
// =============================================================================

/** Returns only the top-level stats numbers (repos, stars, followers). */
export function useGithubSummary() {
  const { data, isLoading, error } = useGithubStats()

  return {
    username: data?.username,
    name: data?.name,
    avatarUrl: data?.avatar_url,
    publicRepos: data?.public_repos,
    followers: data?.followers,
    following: data?.following,
    totalStars: data?.total_stars,
    totalForks: data?.total_forks,
    htmlUrl: data?.html_url,
    bio: data?.bio,
    location: data?.location,
    isLoading,
    error,
  }
}

/** Returns only the pinned / top repos. */
export function useGithubRepos() {
  const { data, isLoading, error } = useGithubStats()

  return {
    repos: data?.pinned_repos ?? [],
    fetchedCount: data?.fetched_repos_count ?? 0,
    isLoading,
    error,
  }
}

/** Returns only the top languages breakdown. */
export function useGithubLanguages() {
  const { data, isLoading, error } = useGithubStats()

  return {
    languages: data?.top_languages ?? [],
    isLoading,
    error,
  }
}
