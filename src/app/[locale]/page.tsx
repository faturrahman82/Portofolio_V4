import type { Metadata } from 'next'
import { unstable_setRequestLocale } from 'next-intl/server'

import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { GithubStats } from '@/components/sections/GithubStats'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { locales, type SupportedLocale } from '@/i18n/request'

// =============================================================================
// Static params
// =============================================================================

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const isId = locale === 'id'
  const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Your Name'

  return {
    title: isId ? `Beranda — ${authorName}` : `Home — ${authorName}`,
    description: isId
      ? `Selamat datang di portofolio ${authorName}. Saya membangun pengalaman web yang cepat, indah, dan aksesibel.`
      : `Welcome to ${authorName}'s portfolio. I build fast, beautiful, and accessible web experiences using Next.js, TypeScript, and Three.js.`,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        id: '/id',
      },
    },
  }
}

// =============================================================================
// Page props
// =============================================================================

interface HomePageProps {
  params: {
    locale: string
  }
}

// =============================================================================
// Home page
// =============================================================================

export default function HomePage({ params: { locale } }: HomePageProps) {
  // Enable static rendering for this locale
  unstable_setRequestLocale(locale)

  const typedLocale = locale as SupportedLocale

  return (
    <>
      {/* ── 1. Hero — full-viewport, Three.js particle background ── */}
      <HeroSection locale={typedLocale} />

      {/* ── 2. About — bio, quick facts, timeline ── */}
      <AboutSection />

      {/* ── 3. Skills — animated skill grid by category ── */}
      <SkillsSection />

      {/* ── 4. Projects — top repos from GitHub via SWR ── */}
      <ProjectsSection locale={typedLocale} limit={6} />

      {/* ── 5. GitHub Stats — live counters, languages, calendar ── */}
      <GithubStats locale={typedLocale} />

      {/* ── 6. Contact — form UI + social links ── */}
      <ContactSection />
    </>
  )
}
