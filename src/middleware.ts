import createMiddleware from 'next-intl/middleware'

import { defaultLocale, locales } from '@/i18n/request'

// =============================================================================
// next-intl Middleware — Locale Routing
// =============================================================================
//
// This middleware intercepts every incoming request and:
//   1. Detects the best matching locale from the Accept-Language header,
//      a locale cookie, or the URL prefix.
//   2. Redirects unprefixed URLs to the locale-prefixed equivalent
//      (e.g. /projects → /en/projects).
//   3. Serves locale-specific content by setting the `x-next-intl-locale`
//      header consumed by the server components.
//
// Routing strategy: "always" prefix — every URL includes the locale segment.
//   /en/...   → English
//   /id/...   → Bahasa Indonesia
//
// =============================================================================

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // The default locale to use when no locale prefix is present in the URL
  defaultLocale,

  // Always show the locale prefix in the URL (e.g. /en/about, /id/about)
  // Use 'as-needed' if you want the default locale to have no prefix
  localePrefix: 'always',

  // Locale detection order:
  // 1. URL prefix  (/en/... or /id/...)
  // 2. Cookie      (NEXT_LOCALE)
  // 3. Accept-Language header from the browser
  localeDetection: true,
})

// =============================================================================
// Matcher — which paths the middleware runs on
// =============================================================================
//
// We exclude:
//   - Next.js internals (_next/*)
//   - Static files in /public (images, fonts, robots.txt, sitemap.xml, etc.)
//   - API routes (/api/*)  — these don't need locale routing
//   - Favicon
//
// Everything else (pages, dynamic routes) goes through locale detection.
//
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static   (Next.js static assets)
     *   - _next/image    (Next.js image optimization)
     *   - favicon.ico
     *   - robots.txt
     *   - sitemap.xml
     *   - /api/*         (internal API routes — not locale-prefixed)
     *   - Files with an extension (e.g. .png, .svg, .woff2, .mp4 …)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|api/|.*\\.[^/]+$).*)',
  ],
}
