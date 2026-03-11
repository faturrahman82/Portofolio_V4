'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useRef, useState, useMemo } from 'react'
import {
  FiGithub,
  FiExternalLink,
  FiStar,
  FiGitBranch,
  FiPackage,
  FiArrowRight,
  FiFilter,
  FiCode,
} from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'

import { useGithubRepos } from '@/hooks/useGithubStats'
import type { SupportedLocale } from '@/i18n/request'
import { getLanguageColor } from '@/lib/github'
import { cn, formatCompactNumber, timeAgo, truncate } from '@/lib/utils'
import type { PinnedRepo } from '@/types/github'

// =============================================================================
// Types
// =============================================================================

interface ProjectsSectionProps {
  locale: SupportedLocale
  /** Maximum number of repos to show (default: 6) */
  limit?: number
}

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.97,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

// =============================================================================
// Language filter pill
// =============================================================================

interface FilterPillProps {
  label: string
  isActive: boolean
  count: number
  color?: string
  onClick: () => void
}

function FilterPill({ label, isActive, count, color, onClick }: FilterPillProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5',
        'font-jetbrains text-xs font-medium',
        'border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
        isActive
          ? 'bg-cyan-500/12 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
          : 'border-white/8 bg-white/4 hover:border-white/14 hover:bg-white/6 text-slate-500 hover:text-slate-300'
      )}
      aria-pressed={isActive}
    >
      {color && (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 font-jetbrains text-[10px]',
          isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/6 text-slate-600'
        )}
      >
        {count}
      </span>

      {/* Active glow */}
      {isActive && (
        <motion.span
          layoutId="filter-pill-active"
          className="bg-cyan-500/8 absolute inset-0 rounded-full border border-cyan-500/30"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  )
}

// =============================================================================
// Topic chip
// =============================================================================

function TopicChip({ topic }: { topic: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'bg-violet-500/8 border border-violet-500/15',
        'font-jetbrains text-[10px] font-medium text-violet-400',
        'hover:bg-violet-500/12 transition-colors duration-200 hover:border-violet-500/25'
      )}
    >
      {topic}
    </span>
  )
}

// =============================================================================
// Language badge
// =============================================================================

function LanguageBadge({ language }: { language: string | null }) {
  if (!language) {
    return null
  }
  const color = getLanguageColor(language)

  return (
    <span
      className="inline-flex items-center gap-1.5 font-jetbrains text-[11px] text-slate-500"
      aria-label={`Language: ${language}`}
    >
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}50` }}
        aria-hidden="true"
      />
      {language}
    </span>
  )
}

// =============================================================================
// Project card skeleton
// =============================================================================

function ProjectCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="skeleton h-52 rounded-2xl"
      aria-hidden="true"
    />
  )
}

// =============================================================================
// Project card
// =============================================================================

interface ProjectCardProps {
  repo: PinnedRepo
  index: number
  t: ReturnType<typeof useTranslations>
}

function ProjectCard({ repo, index, t }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const color = getLanguageColor(repo.language)

  // Top 3 topics only (to avoid card overflow)
  const visibleTopics = repo.topics.slice(0, 3)
  const extraTopics = repo.topics.length - visibleTopics.length

  return (
    <motion.article
      variants={cardVariants}
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'border-white/6 border bg-white/[0.03]',
        'backdrop-blur-sm',
        'transition-all duration-400',
        'hover:-translate-y-1.5 hover:border-cyan-500/20',
        'hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,245,255,0.08)]',
        'cursor-pointer',
        'focus-within:ring-2 focus-within:ring-cyan-500/30'
      )}
      aria-label={`${t('card.language') ?? 'Project'}: ${repo.name}`}
      role="article"
    >
      {/* Gradient top accent */}
      <div
        className="absolute left-0 right-0 top-0 h-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}60 40%, rgba(124,58,237,0.5) 70%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Background glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color}06, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Card body */}
      <div className="relative flex flex-1 flex-col gap-3 p-5">
        {/* ── Header: icon + name + external link ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Repo icon */}
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                'border-white/8 border bg-white/5',
                'group-hover:bg-cyan-500/8 transition-all duration-300 group-hover:border-cyan-500/20'
              )}
              style={{ boxShadow: isHovered ? `0 0 12px ${color}30` : undefined }}
            >
              <FiPackage className="h-3.5 w-3.5 text-slate-500 transition-colors duration-300 group-hover:text-cyan-400" />
            </div>

            <h3 className="truncate font-syne text-sm font-bold text-slate-200 transition-colors duration-300 group-hover:text-white">
              {repo.name}
            </h3>
          </div>

          {/* External links */}
          <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source code of ${repo.name} on GitHub`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'border-white/8 border bg-white/5 text-slate-500',
                'hover:bg-cyan-500/8 transition-all duration-200 hover:border-cyan-500/25 hover:text-cyan-400',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50'
              )}
            >
              <FiGithub className="h-3.5 w-3.5" />
            </a>

            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit live demo of ${repo.name}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg',
                  'border-white/8 border bg-white/5 text-slate-500',
                  'hover:bg-violet-500/8 transition-all duration-200 hover:border-violet-500/25 hover:text-violet-400',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50'
                )}
              >
                <FiExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        <p className="flex-1 text-[13px] leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-400">
          {repo.description ? (
            truncate(repo.description, 110)
          ) : (
            <span className="italic text-slate-600">No description provided.</span>
          )}
        </p>

        {/* ── Topics ── */}
        {visibleTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTopics.map((topic) => (
              <TopicChip key={topic} topic={topic} />
            ))}
            {extraTopics > 0 && (
              <span className="border-white/6 bg-white/4 inline-flex items-center rounded-full border px-2.5 py-0.5 font-jetbrains text-[10px] text-slate-600">
                +{extraTopics}
              </span>
            )}
          </div>
        )}

        {/* ── Footer: language + stats ── */}
        <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-3">
          <LanguageBadge language={repo.language} />

          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1 font-jetbrains text-[11px] text-slate-600"
              aria-label={`${repo.stars} ${t('card.stars')}`}
            >
              <FiStar className="h-3 w-3 text-slate-700" />
              {formatCompactNumber(repo.stars)}
            </span>
            <span
              className="flex items-center gap-1 font-jetbrains text-[11px] text-slate-600"
              aria-label={`${repo.forks} ${t('card.forks')}`}
            >
              <FiGitBranch className="h-3 w-3 text-slate-700" />
              {formatCompactNumber(repo.forks)}
            </span>
            {repo.updated_at && (
              <span
                className="hidden font-jetbrains text-[11px] text-slate-700 sm:inline"
                aria-label={`Updated ${timeAgo(repo.updated_at)}`}
              >
                {timeAgo(repo.updated_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pinned / featured badge */}
      {index < 3 && (
        <div
          className="bg-amber-500/8 absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-500/20 px-2 py-0.5"
          aria-label="Featured project"
        >
          <HiSparkles className="h-2.5 w-2.5 text-amber-400" aria-hidden="true" />
          <span className="font-jetbrains text-[9px] font-semibold uppercase tracking-wide text-amber-400/80">
            {t('featured_label')}
          </span>
        </div>
      )}
    </motion.article>
  )
}

// =============================================================================
// Empty state
// =============================================================================

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-white/6 col-span-full flex flex-col items-center gap-4 rounded-2xl border bg-white/[0.02] px-8 py-16 text-center"
    >
      <div className="border-white/8 bg-white/4 flex h-14 w-14 items-center justify-center rounded-2xl border">
        <FiCode className="h-6 w-6 text-slate-600" />
      </div>
      <p className="max-w-xs text-sm text-slate-500">{message}</p>
    </motion.div>
  )
}

// =============================================================================
// Main ProjectsSection
// =============================================================================

export function ProjectsSection({ locale, limit = 6 }: ProjectsSectionProps) {
  const t = useTranslations('projects')
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const { repos, isLoading, error } = useGithubRepos()

  // ──────────────────────────────────────────────
  // Compute unique languages for the filter
  // ──────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const languages = useMemo(() => {
    const counts: Record<string, number> = {}
    repos.forEach((r) => {
      if (r.language) {
        counts[r.language] = (counts[r.language] ?? 0) + 1
      }
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8) // max 8 filter options
      .map(([name, count]) => ({ name, count }))
  }, [repos])

  // ──────────────────────────────────────────────
  // Filtered & limited repos
  // ──────────────────────────────────────────────
  const filteredRepos = useMemo(() => {
    const base = activeFilter === 'all' ? repos : repos.filter((r) => r.language === activeFilter)
    return base.slice(0, limit)
  }, [repos, activeFilter, limit])

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <section
      ref={ref}
      id="projects"
      className="relative overflow-hidden py-24 lg:py-32"
      aria-label="Projects section"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-violet-600/4 absolute right-0 top-0 h-[500px] w-[500px] rounded-full blur-[120px]" />
        <div className="bg-cyan-500/3 absolute -left-24 bottom-1/4 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* ──────────────────────────────────────────────
              Section header
              ────────────────────────────────────────────── */}
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              {/* Label */}
              <motion.div variants={itemVariants} className="mb-4 inline-flex items-center gap-2">
                <span className="font-jetbrains text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
                  <span className="opacity-50">// </span>
                  {t('section_label')}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                variants={itemVariants}
                className="mb-3 font-syne font-black leading-tight tracking-tight text-white"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                {t('title')} <span className="text-gradient">{t('title_highlight')}</span>
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                variants={itemVariants}
                className="text-sm leading-relaxed text-slate-400 sm:text-base"
              >
                {t('subtitle')}
              </motion.p>
            </div>

            {/* View all link */}
            <motion.div variants={itemVariants} className="shrink-0">
              <Link
                href={`/${locale}/projects`}
                className={cn(
                  'group inline-flex items-center gap-2 rounded-xl',
                  'border border-white/10 bg-white/5 px-5 py-2.5',
                  'text-sm font-semibold text-slate-400',
                  'transition-all duration-300',
                  'hover:bg-cyan-500/8 hover:border-cyan-500/25 hover:text-cyan-300',
                  'hover:shadow-cyan-500/8 hover:-translate-y-0.5 hover:shadow-lg',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40'
                )}
              >
                <span>{t('view_all')}</span>
                <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </div>

          {/* ──────────────────────────────────────────────
              Language filters
              ────────────────────────────────────────────── */}
          {!isLoading && languages.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="mb-8 flex flex-wrap items-center gap-2"
              role="group"
              aria-label={t('filter_label')}
            >
              <div className="mr-1 flex items-center gap-1.5 text-slate-600">
                <FiFilter className="h-3.5 w-3.5" />
                <span className="font-jetbrains text-[11px] uppercase tracking-widest">
                  {t('filter_label')}
                </span>
              </div>

              {/* All filter */}
              <FilterPill
                label={t('filter_all')}
                isActive={activeFilter === 'all'}
                count={repos.length}
                onClick={() => setActiveFilter('all')}
              />

              {/* Language-specific filters */}
              {languages.map(({ name, count }) => (
                <FilterPill
                  key={name}
                  label={name}
                  isActive={activeFilter === name}
                  count={count}
                  color={getLanguageColor(name)}
                  onClick={() => setActiveFilter(name)}
                />
              ))}
            </motion.div>
          )}

          {/* ──────────────────────────────────────────────
              Cards grid
              ────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: limit }).map((_, i) => (
                <ProjectCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : error ? (
            <div className="grid">
              <EmptyState message={t('error')} />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeFilter}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label={`${filteredRepos.length} projects`}
              >
                {filteredRepos.length > 0 ? (
                  filteredRepos.map((repo, i) => (
                    <ProjectCard key={repo.id} repo={repo} index={i} t={t} />
                  ))
                ) : (
                  <EmptyState message={t('no_results')} />
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ──────────────────────────────────────────────
              "View all" bottom CTA
              ────────────────────────────────────────────── */}
          {!isLoading && filteredRepos.length > 0 && (
            <motion.div variants={itemVariants} className="mt-12 flex justify-center">
              <Link
                href={`/${locale}/projects`}
                className={cn(
                  'group relative inline-flex items-center gap-3 overflow-hidden',
                  'rounded-xl px-7 py-3.5 text-sm font-bold',
                  'bg-gradient-to-r from-cyan-500/10 to-violet-600/10',
                  'border-white/8 border',
                  'text-slate-300',
                  'transition-all duration-300',
                  'hover:-translate-y-0.5 hover:border-cyan-500/25 hover:from-cyan-500/15 hover:to-violet-600/15',
                  'hover:text-white hover:shadow-lg hover:shadow-cyan-500/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50'
                )}
              >
                {/* shimmer */}
                <span
                  className="via-white/6 pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  aria-hidden="true"
                />
                <FiPackage className="relative h-4 w-4 text-cyan-400" />
                <span className="relative">{t('view_all')}</span>
                <FiArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection
