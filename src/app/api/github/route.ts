import { type NextRequest, NextResponse } from 'next/server'

import { getCachedGitHubStats, GitHubApiError } from '@/lib/github'

// =============================================================================
// /api/github — Aggregated GitHub Stats Route Handler
// =============================================================================
//
// GET /api/github
//   → Returns aggregated GitHub stats for the configured username.
//   → Reads NEXT_PUBLIC_GITHUB_USERNAME from env (falls back to 'octocat').
//   → Uses GITHUB_TOKEN if present for higher rate limits (5 000 req/hr vs 60).
//   → Results are cached in-memory for 10 minutes (server-side) and the
//     response carries Cache-Control headers so the CDN / browser also caches.
//
// GET /api/github?username=torvalds
//   → Fetches stats for a different username (useful for testing).
//
// POST /api/github (with secret header)
//   → Invalidates the in-memory cache for the username.
//
// =============================================================================

// Edge runtime is NOT used here because we use Node.js APIs (Map-based cache).
// If you need edge, replace the in-memory cache with KV (Vercel KV / Redis).
export const runtime = 'nodejs'

// ISR: revalidate the route segment cache every 10 minutes on Vercel
export const revalidate = 600

// ---------------------------------------------------------------------------
// CORS headers (allow the frontend origin in development)
// ---------------------------------------------------------------------------

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL ?? '',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean)

  const isAllowed = !origin || allowedOrigins.some((o) => origin.startsWith(o))

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin ?? '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Revalidate-Secret',
    'Access-Control-Max-Age': '86400',
  }
}

// ---------------------------------------------------------------------------
// Cache-Control headers
// ---------------------------------------------------------------------------

const CACHE_MAX_AGE = 600 // 10 minutes
const STALE_WHILE_REVALIDATE = 300 // 5 minutes grace

function cacheHeaders(isError = false): Record<string, string> {
  if (isError) {
    return {
      'Cache-Control': 'no-store',
      'CDN-Cache-Control': 'no-store',
    }
  }

  return {
    // Browser: cache for 10 min, then serve stale while revalidating for 5 min
    'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
    // Vercel Edge Network: same policy
    'CDN-Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
    // Vercel-specific: more aggressive CDN caching
    'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`,
  }
}

// ---------------------------------------------------------------------------
// OPTIONS — preflight for CORS
// ---------------------------------------------------------------------------

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}

// ---------------------------------------------------------------------------
// GET — main handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin')
  const { searchParams } = new URL(request.url)

  // Allow overriding the username via query param (useful for demos / testing)
  const usernameOverride = searchParams.get('username')
  const username = usernameOverride ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'octocat'

  // Basic validation
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid GitHub username format.',
        status: 400,
      },
      {
        status: 400,
        headers: {
          ...corsHeaders(origin),
          ...cacheHeaders(true),
        },
      }
    )
  }

  try {
    const data = await getCachedGitHubStats(username)

    return NextResponse.json(
      { ok: true, data },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Expose the username used so the client can verify
          'X-GitHub-Username': data.username,
          // Expose when the data was generated (ISO string)
          'X-Generated-At': data.generated_at,
          ...corsHeaders(origin),
          ...cacheHeaders(false),
        },
      }
    )
  } catch (error: unknown) {
    console.error('[/api/github] Failed to fetch GitHub stats:', error)

    // GitHub API-specific errors
    if (error instanceof GitHubApiError) {
      const isNotFound = error.statusCode === 404
      const isRateLimited = error.statusCode === 403 || error.statusCode === 429

      if (isNotFound) {
        return NextResponse.json(
          {
            ok: false,
            error: `GitHub user '${username}' not found.`,
            status: 404,
          },
          {
            status: 404,
            headers: { ...corsHeaders(origin), ...cacheHeaders(true) },
          }
        )
      }

      if (isRateLimited) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'GitHub API rate limit exceeded. Add a GITHUB_TOKEN to your .env.local to get 5 000 requests/hour.',
            status: 429,
          },
          {
            status: 429,
            headers: {
              ...corsHeaders(origin),
              ...cacheHeaders(true),
              'Retry-After': '3600',
            },
          }
        )
      }

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          status: error.statusCode ?? 502,
        },
        {
          status: error.statusCode ?? 502,
          headers: { ...corsHeaders(origin), ...cacheHeaders(true) },
        }
      )
    }

    // Generic / network errors
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'

    return NextResponse.json(
      { ok: false, error: message, status: 500 },
      {
        status: 500,
        headers: { ...corsHeaders(origin), ...cacheHeaders(true) },
      }
    )
  }
}

// ---------------------------------------------------------------------------
// POST — cache invalidation endpoint
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin')

  // Require a secret header to prevent abuse
  const secret = request.headers.get('x-revalidate-secret')
  const expectedSecret = process.env.REVALIDATE_SECRET

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized.' },
      {
        status: 401,
        headers: { ...corsHeaders(origin), ...cacheHeaders(true) },
      }
    )
  }

  const { searchParams } = new URL(request.url)
  const username =
    searchParams.get('username') ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'octocat'

  // Invalidate the in-memory cache
  const { invalidateGitHubCache } = await import('@/lib/github')
  invalidateGitHubCache(username)

  return NextResponse.json(
    {
      ok: true,
      message: `Cache invalidated for '${username}'. Next GET will fetch fresh data.`,
    },
    {
      status: 200,
      headers: { ...corsHeaders(origin), 'Cache-Control': 'no-store' },
    }
  )
}
