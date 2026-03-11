import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Syne } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, useMessages } from 'next-intl'
import { unstable_setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { locales, type SupportedLocale } from '@/i18n/request'
import '@/styles/globals.css'

// =============================================================================
// Fonts — loaded via next/font for zero layout shift
// =============================================================================

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
  fallback: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
})

// =============================================================================
// Static params — tell Next.js which locales to pre-render
// =============================================================================

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// =============================================================================
// Metadata
// =============================================================================

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourportfolio.vercel.app'
const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Your Name'
const authorTitle = process.env.NEXT_PUBLIC_AUTHOR_TITLE ?? 'Full-Stack Developer & UI Engineer'
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'
const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com'
const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL ?? ''

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const isId = locale === 'id'

  const title = isId
    ? `${authorName} — Full-Stack Developer`
    : `${authorName} — Full-Stack Developer`
  const description = isId
    ? `Portofolio pribadi ${authorName} — Full-Stack Developer yang membangun pengalaman web yang cepat, indah, dan aksesibel menggunakan Next.js, TypeScript, dan Three.js.`
    : `Personal portfolio of ${authorName}, a ${authorTitle} building fast, beautiful, and accessible web experiences with Next.js, TypeScript, and Three.js.`

  return {
    title: {
      default: title,
      template: `%s | ${authorName}`,
    },
    description,
    keywords: [
      'portfolio',
      'full-stack developer',
      'frontend developer',
      'Next.js',
      'React',
      'TypeScript',
      'Three.js',
      'UI engineer',
      'web development',
      authorName,
    ],
    authors: [{ name: authorName, url: siteUrl }],
    creator: authorName,
    publisher: authorName,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        id: '/id',
        'x-default': '/en',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
      url: siteUrl,
      siteName: `${authorName}'s Portfolio`,
      title,
      description,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${authorName} — Portfolio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: twitterUrl ? `@${twitterUrl.split('/').pop()}` : undefined,
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'technology',
    classification: 'Personal Portfolio',
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      other: [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#00f5ff' }],
    },
    other: {
      'msapplication-TileColor': '#050816',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#050816',
    },
  }
}

// =============================================================================
// Viewport configuration
// =============================================================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#050816' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
  colorScheme: 'dark light',
}

// =============================================================================
// JSON-LD structured data
// =============================================================================

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    jobTitle: authorTitle,
    url: siteUrl,
    email: contactEmail,
    sameAs: [githubUrl, process.env.NEXT_PUBLIC_LINKEDIN_URL, twitterUrl].filter(Boolean),
    knowsAbout: [
      'TypeScript',
      'JavaScript',
      'React',
      'Next.js',
      'Node.js',
      'Three.js',
      'Web Development',
      'UI/UX Engineering',
    ],
    nationality: 'Indonesian',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jakarta',
      addressCountry: 'ID',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// =============================================================================
// Theme initialiser script — prevents flash of wrong theme on load
// Runs synchronously before React hydrates
// =============================================================================

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('portfolio-ui-store');
    var theme = 'dark';
    if (stored) {
      var parsed = JSON.parse(stored);
      if (parsed && parsed.state && parsed.state.theme) {
        theme = parsed.state.theme;
      }
    }
    var root = document.documentElement;
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`

// =============================================================================
// Root layout
// =============================================================================

interface RootLayoutProps {
  children: ReactNode
  params: { locale: string }
}

export default function RootLayout({ children, params: { locale } }: RootLayoutProps) {
  // Validate locale
  if (!locales.includes(locale as SupportedLocale)) {
    notFound()
  }

  // Enable static rendering for this locale
  unstable_setRequestLocale(locale)

  // Get messages for the client — this runs on the server
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const messages = useMessages()

  const typedLocale = locale as SupportedLocale

  return (
    <html lang={locale} className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Inline theme initialiser — runs before paint to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Structured data */}
        <JsonLd />

        {/* DNS prefetch for GitHub API */}
        <link rel="dns-prefetch" href="//api.github.com" />
        <link rel="preconnect" href="https://api.github.com" />
        <link rel="dns-prefetch" href="//avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />

        {/* Preload critical font files (next/font handles the rest) */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap"
        />
      </head>

      <body
        className={` ${syne.variable} ${jetbrainsMono.variable} min-h-screen overflow-x-hidden bg-[#050816] text-slate-200 antialiased selection:bg-cyan-500/25 selection:text-white`}
        suppressHydrationWarning
      >
        {/* next-intl provider — makes translations available to all client components */}
        <NextIntlClientProvider locale={typedLocale} messages={messages}>
          {/* Skip navigation (accessibility) */}
          <a
            href="#main-content"
            className="sr-only fixed left-4 top-4 z-[200] rounded-xl bg-cyan-500 px-5 py-3 font-syne text-sm font-bold text-[#050816] shadow-lg focus:not-sr-only focus:outline-none"
          >
            Skip to main content
          </a>

          {/* Navigation */}
          <Navbar locale={typedLocale} />

          {/* Main content */}
          <main id="main-content" className="relative flex flex-col" tabIndex={-1}>
            {children}
          </main>

          {/* Footer */}
          <Footer locale={typedLocale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
