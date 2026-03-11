'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useRef, useState, useEffect } from 'react'
import {
  FiStar,
  FiGitBranch,
  FiUsers,
  FiPackage,
  FiExternalLink,
  FiRefreshCw,
  FiAlertCircle,
  FiGithub,
} from 'react-icons/fi'
import { HiOutlineCode } from 'react-icons/hi'

import { useGithubStats } from '@/hooks/useGithubStats'
import type { SupportedLocale } from '@/i18n/request'
import { getLanguageColor } from '@/lib/github'
import { cn, formatCompactNumber } from '@/lib/utils'
import type { TopLanguage, PinnedRepo } from '@/types/github'

// =============================================================================
// Lazy-load the contribution calendar (large dependency, not SSR-safe)
// =============================================================================

const GitHubCalendar = dynamic(() => import('react-github-calendar'), {
  ssr: false,
  loading: () => (
    <div className="skeleton h-32 w-full rounded-xl" aria-label="Loading contribution calendar" />
  ),
})

// =============================================================================
// Types
// =============================================================================

interface GithubStatsProps {
  locale: SupportedLocale
}

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// =============================================================================
// Animated number counter
// =============================================================================

interface CounterProps {
  target: number
  duration?: number
  suffix?: string
  className?: string
  trigger?: boolean
}

function AnimatedCounter({
  target,
  duration = 1600,
  suffix = '',
  className,
  trigger = true,
}: CounterProps) {
  const [value, setValue] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!trigger || hasRun.current) {
      return
    }
    hasRun.current = true

    const start = performance.now()

    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [target, duration, trigger])

  return (
    <span className={className}>
      {formatCompactNumber(value)}
      {suffix}
    </span>
  )
}

// =============================================================================
// Stat card
// =============================================================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  suffix?: string
  color: 'cyan' | 'violet' | 'emerald' | 'rose'
  index: number
  isInView: boolean
}

const COLOR_MAP = {
  cyan: {
    icon: 'text-cyan-400',
    glow: 'shadow-glow-sm-cyan',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/15',
    value: 'text-cyan-300',
    ring: 'group-hover:ring-cyan-500/20',
  },
  violet: {
    icon: 'text-violet-400',
    glow: 'shadow-glow-sm-violet',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/15',
    value: 'text-violet-300',
    ring: 'group-hover:ring-violet-500/20',
  },
  emerald: {
    icon: 'text-emerald-400',
    glow: '',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/15',
    value: 'text-emerald-300',
    ring: 'group-hover:ring-emerald-500/20',
  },
  rose: {
    icon: 'text-rose-400',
    glow: '',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/15',
    value: 'text-rose-300',
    ring: 'group-hover:ring-rose-500/20',
  },
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  color,
  index,
  isInView,
}: StatCardProps) {
  const colors = COLOR_MAP[color]

  return (
    <motion.div
      variants={scaleInVariants}
      custom={index}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 sm:p-5',
        'glass transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-glass-hover',
        colors.border,
        'ring-1 ring-transparent',
        colors.ring
      )}
      aria-label={`${label}: ${value}${suffix}`}
      role="figure"
    >
      {/* Background tint */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          colors.bg
        )}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className={cn(
          'mb-3 sm:mb-4 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl',
          colors.bg,
          'border',
          colors.border
        )}
      >
        <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', colors.icon)} />
      </div>

      {/* Value */}
      <div className="mb-1">
        <AnimatedCounter
          target={value}
          suffix={suffix}
          trigger={isInView}
          duration={1400 + index * 150}
          className={cn('font-syne text-2xl sm:text-3xl font-black leading-none tracking-tight', colors.value)}
        />
      </div>

      {/* Label */}
      <p className="font-jetbrains text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-slate-500">
        {label}
      </p>

      {/* Subtle bottom accent line */}
      <div
        className={cn(
          'absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full',
          color === 'cyan'
            ? 'from-cyan-500/60 to-transparent'
            : color === 'violet'
              ? 'from-violet-500/60 to-transparent'
              : color === 'emerald'
                ? 'from-emerald-500/60 to-transparent'
                : 'from-rose-500/60 to-transparent'
        )}
        aria-hidden="true"
      />
    </motion.div>
  )
}

// =============================================================================
// Language bar
// =============================================================================

interface LanguageBarProps {
  languages: TopLanguage[]
  isInView: boolean
}

function LanguageBar({ languages, isInView }: LanguageBarProps) {
  return (
    <div className="space-y-1.5">
      {/* Segmented bar */}
      <div
        className="flex h-2.5 overflow-hidden rounded-full"
        role="presentation"
        aria-hidden="true"
      >
        {languages.map((lang, i) => (
          <motion.div
            key={lang.name}
            initial={{ scaleX: 0, originX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3 + i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${lang.percentage}%`,
              backgroundColor: getLanguageColor(lang.name),
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
        {languages.map((lang, i) => (
          <motion.div
            key={lang.name}
            initial={{ opacity: 0, x: -8 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
            className="flex items-center gap-1.5"
            aria-label={`${lang.name}: ${lang.percentage}%`}
          >
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: getLanguageColor(lang.name) }}
              aria-hidden="true"
            />
            <span className="font-jetbrains text-[11px] text-slate-400">{lang.name}</span>
            <span className="font-jetbrains text-[11px] text-slate-600">{lang.percentage}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Language row (detailed breakdown)
// =============================================================================

interface LanguageRowProps {
  lang: TopLanguage
  index: number
  maxBytes: number
  isInView: boolean
}

function LanguageRow({ lang, index, maxBytes, isInView }: LanguageRowProps) {
  const widthPct = maxBytes > 0 ? (lang.bytes / maxBytes) * 100 : 0
  const color = getLanguageColor(lang.name)

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{ duration: 0.45, delay: 0.2 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3"
      role="listitem"
    >
      {/* Rank */}
      <span className="w-4 shrink-0 font-jetbrains text-[10px] text-slate-600">{index + 1}</span>

      {/* Dot */}
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
        aria-hidden="true"
      />

      {/* Name */}
      <span className="w-24 shrink-0 truncate font-jetbrains text-xs font-medium text-slate-300">
        {lang.name}
      </span>

      {/* Bar */}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${widthPct}%` } : { width: 0 }}
          transition={{ duration: 0.8, delay: 0.35 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Percentage */}
      <span className="w-10 shrink-0 text-right font-jetbrains text-[11px] text-slate-500">
        {lang.percentage}%
      </span>
    </motion.div>
  )
}

// =============================================================================
// Pinned repo mini-card
// =============================================================================

function MiniRepoCard({
  repo,
  index,
  isInView,
}: {
  repo: PinnedRepo
  index: number
  isInView: boolean
}) {
  const color = getLanguageColor(repo.language)

  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.45, delay: 0.1 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        'border-white/6 group relative flex flex-col gap-2.5 rounded-xl border p-4',
        'glass cursor-pointer transition-all duration-300',
        'hover:border-cyan-500/20 hover:shadow-glass-hover'
      )}
      aria-label={`View repository: ${repo.name}`}
    >
      {/* Repo name + icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FiPackage className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-colors duration-200 group-hover:text-cyan-400" />
          <span className="truncate font-syne text-sm font-semibold text-slate-200 transition-colors duration-200 group-hover:text-white">
            {repo.name}
          </span>
        </div>
        <FiExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-700 opacity-0 transition-all duration-200 group-hover:text-cyan-400 group-hover:opacity-100" />
      </div>

      {/* Description */}
      {repo.description && (
        <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-500 transition-colors duration-200 group-hover:text-slate-400">
          {repo.description}
        </p>
      )}

      {/* Footer: language + stars + forks */}
      <div className="mt-auto flex items-center gap-3">
        {repo.language && (
          <span className="flex items-center gap-1.5 font-jetbrains text-[11px] text-slate-500">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1 font-jetbrains text-[11px] text-slate-500">
          <FiStar className="h-3 w-3" />
          {formatCompactNumber(repo.stars)}
        </span>
        <span className="flex items-center gap-1 font-jetbrains text-[11px] text-slate-500">
          <FiGitBranch className="h-3 w-3" />
          {formatCompactNumber(repo.forks)}
        </span>
      </div>
    </motion.a>
  )
}

// =============================================================================
// Loading skeleton grid
// =============================================================================

function StatsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>

      {/* Languages */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>

      {/* Calendar */}
      <div className="skeleton h-36 rounded-2xl" />
    </div>
  )
}

// =============================================================================
// Error state
// =============================================================================

function StatsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/15 bg-red-500/5 px-6 py-12 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <FiAlertCircle className="h-5 w-5 text-red-400" />
      </div>
      <div>
        <p className="mb-1 font-syne text-sm font-semibold text-slate-300">
          Failed to load GitHub data
        </p>
        <p className="font-jetbrains text-xs text-slate-500">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5',
          'px-4 py-2 font-jetbrains text-xs text-slate-400',
          'transition-all duration-200 hover:bg-white/10 hover:text-slate-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50'
        )}
      >
        <FiRefreshCw className="h-3.5 w-3.5" />
        Try again
      </button>
    </motion.div>
  )
}

// =============================================================================
// Calendar theme
// =============================================================================

const calendarTheme = {
  dark: [
    'rgba(255,255,255,0.05)', // level 0 — empty
    'rgba(0,245,255,0.15)', // level 1
    'rgba(0,245,255,0.35)', // level 2
    'rgba(0,245,255,0.60)', // level 3
    'rgba(0,245,255,0.90)', // level 4
  ],
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
}

// =============================================================================
// Section label
// =============================================================================

function SectionLabel({ text }: { text: string }) {
  return (
    <motion.div variants={itemVariants} className="mb-4 inline-flex items-center gap-2">
      <span className="font-jetbrains text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
        <span className="opacity-50">// </span>
        {text}
      </span>
    </motion.div>
  )
}

// =============================================================================
// Main GithubStats component
// =============================================================================

export function GithubStats({ locale: _locale }: GithubStatsProps) {
  const t = useTranslations('github')
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const { data, error, isLoading, mutate } = useGithubStats()

  const username = data?.username ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'octocat'
  const githubUrl = data?.html_url ?? `https://github.com/${username}`

  // Stat cards config
  const stats = data
    ? [
        {
          icon: FiPackage,
          label: t('repos'),
          value: data.public_repos,
          color: 'cyan' as const,
        },
        {
          icon: FiStar,
          label: t('stars'),
          value: data.total_stars,
          color: 'violet' as const,
        },
        {
          icon: FiUsers,
          label: t('followers'),
          value: data.followers,
          color: 'emerald' as const,
        },
        {
          icon: FiGitBranch,
          label: t('following'),
          value: data.following,
          color: 'rose' as const,
        },
      ]
    : []

  const maxLangBytes = data?.top_languages?.[0]?.bytes ?? 1

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <section
      ref={ref}
      id="github-stats"
      className="relative overflow-hidden py-24 lg:py-32"
      aria-label="GitHub statistics"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-cyan-500/4 absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full blur-[120px]" />
        <div className="bg-violet-600/4 absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-12"
        >
          {/* ----------------------------------------------------------------
              Section header
              ---------------------------------------------------------------- */}
          <div className="max-w-2xl">
            <SectionLabel text={t('section_label')} />

            <motion.h2
              variants={itemVariants}
              className="mb-4 font-syne font-black leading-tight tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              {t('title')} <span className="text-gradient">{t('title_highlight')}</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-base leading-relaxed text-slate-400">
              {t('subtitle')}
            </motion.p>
          </div>

          {/* ----------------------------------------------------------------
              Loading / Error / Content
              ---------------------------------------------------------------- */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StatsSkeleton />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StatsError message={error.message} onRetry={() => void mutate()} />
              </motion.div>
            ) : data ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* -------------------------------------------------------
                    Stat cards grid
                    ------------------------------------------------------- */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                  role="list"
                  aria-label="GitHub summary statistics"
                >
                  {stats.map((stat, i) => (
                    <StatCard
                      key={stat.label}
                      icon={stat.icon}
                      label={stat.label}
                      value={stat.value}
                      color={stat.color}
                      index={i}
                      isInView={isInView}
                    />
                  ))}
                </motion.div>

                {/* -------------------------------------------------------
                    Languages + Top Repos (two-column layout)
                    ------------------------------------------------------- */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Languages panel */}
                  <motion.div
                    variants={itemVariants}
                    className="glass border-white/6 rounded-2xl border p-6"
                  >
                    {/* Panel header */}
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/15 bg-cyan-500/10">
                        <HiOutlineCode className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-syne text-sm font-bold text-slate-200">
                          {t('top_languages')}
                        </h3>
                        <p className="font-jetbrains text-[11px] text-slate-600">
                          by repository size
                        </p>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    {(data.top_languages?.length ?? 0) > 0 && (
                      <div className="mb-5">
                        <LanguageBar languages={data.top_languages} isInView={isInView} />
                      </div>
                    )}

                    {/* Detailed rows */}
                    <div className="space-y-2.5" role="list" aria-label="Top programming languages">
                      {data.top_languages?.slice(0, 6).map((lang, i) => (
                        <LanguageRow
                          key={lang.name}
                          lang={lang}
                          index={i}
                          maxBytes={maxLangBytes}
                          isInView={isInView}
                        />
                      ))}
                    </div>
                  </motion.div>

                  {/* Top repos panel */}
                  <motion.div
                    variants={itemVariants}
                    className="glass border-white/6 rounded-2xl border p-6"
                  >
                    {/* Panel header */}
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10">
                          <FiPackage className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-syne text-sm font-bold text-slate-200">
                            Top Repositories
                          </h3>
                          <p className="font-jetbrains text-[11px] text-slate-600">
                            sorted by stars
                          </p>
                        </div>
                      </div>

                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'border-white/8 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5',
                          'font-jetbrains text-[11px] text-slate-500',
                          'transition-all duration-200 hover:border-cyan-500/25 hover:text-cyan-400'
                        )}
                        aria-label="View GitHub profile"
                      >
                        <FiGithub className="h-3 w-3" />
                        <span>Profile</span>
                        <FiExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>

                    {/* Repo mini-cards */}
                    <div className="space-y-2.5" role="list" aria-label="Top GitHub repositories">
                      {data.pinned_repos?.slice(0, 4).map((repo, i) => (
                        <MiniRepoCard key={repo.id} repo={repo} index={i} isInView={isInView} />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* -------------------------------------------------------
                    GitHub contribution calendar
                    ------------------------------------------------------- */}
                <motion.div
                  variants={itemVariants}
                  className="glass border-white/6 rounded-2xl border p-6"
                >
                  {/* Header */}
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/15 bg-cyan-500/10">
                        <FiGithub className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-syne text-sm font-bold text-slate-200">
                          {t('calendar_title')}
                        </h3>
                        <p className="font-jetbrains text-[11px] text-slate-600">
                          @{username} — last 12 months
                        </p>
                      </div>
                    </div>

                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center gap-2 self-start rounded-xl sm:self-auto',
                        'border-white/8 bg-white/4 border px-4 py-2.5',
                        'font-jetbrains text-xs font-semibold text-slate-400',
                        'transition-all duration-200 hover:border-cyan-500/25 hover:text-cyan-300',
                        'hover:shadow-lg hover:shadow-cyan-500/10'
                      )}
                    >
                      <FiGithub className="h-3.5 w-3.5" />
                      {t('view_profile')}
                      <FiExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Calendar */}
                  <div
                    className="overflow-x-auto"
                    role="img"
                    aria-label="GitHub contribution calendar"
                  >
                    {process.env.NEXT_PUBLIC_ENABLE_GITHUB_CALENDAR !== 'false' && (
                      <GitHubCalendar
                        username={username}
                        theme={calendarTheme}
                        colorScheme="dark"
                        fontSize={12}
                        blockSize={12}
                        blockMargin={4}
                        blockRadius={3}
                        hideTotalCount={false}
                        hideColorLegend={false}
                        labels={{
                          totalCount: `{{count}} contributions in the last year`,
                        }}
                        style={{ width: '100%', minWidth: 560 }}
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ----------------------------------------------------------------
              View full profile CTA
              ---------------------------------------------------------------- */}
          {data && (
            <motion.div variants={itemVariants} className="flex justify-center pt-4">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group inline-flex items-center gap-2.5 rounded-xl',
                  'border border-white/10 bg-white/5 px-6 py-3.5',
                  'text-sm font-semibold text-slate-300',
                  'transition-all duration-300',
                  'hover:bg-cyan-500/8 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:text-cyan-300',
                  'hover:shadow-lg hover:shadow-cyan-500/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50'
                )}
              >
                <FiGithub className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                <span>{t('view_profile')}</span>
                <FiExternalLink className="h-3.5 w-3.5 opacity-60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default GithubStats
