'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useMemo, useState, useCallback, useRef, type ChangeEvent } from 'react'
import {
  FiSearch,
  FiFilter,
  FiGithub,
  FiExternalLink,
  FiStar,
  FiGitBranch,
  FiPackage,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiCode,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'

import { useGithubStats } from '@/hooks/useGithubStats'
import type { SupportedLocale } from '@/i18n/request'
import { getLanguageColor } from '@/lib/github'
import { cn, formatCompactNumber, timeAgo, truncate, debounce } from '@/lib/utils'
import type { PinnedRepo } from '@/types/github'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SortKey = 'stars' | 'updated' | 'name' | 'forks'
type SortDir = 'desc' | 'asc'

interface FilterState {
  search: string
  language: string
  topic: string
  sortKey: SortKey
  sortDir: SortDir
  showArchived: boolean
  showForks: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Animation variants
// ─────────────────────────────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.25 },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterPill
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string
  count?: number
  color?: string
  isActive: boolean
  onClick: () => void
}

function FilterPill({ label, count, color, isActive, onClick }: FilterPillProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={isActive}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
        'font-jetbrains text-[11px] font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
        isActive
          ? 'bg-cyan-500/12 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
          : 'border-white/8 bg-white/4 hover:border-white/14 hover:bg-white/6 text-slate-500 hover:text-slate-300'
      )}
    >
      {color && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px]',
            isActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/6 text-slate-600'
          )}
        >
          {count}
        </span>
      )}
      {isActive && (
        <motion.span
          layoutId="projects-filter-active"
          className="bg-cyan-500/6 absolute inset-0 rounded-full border border-cyan-500/25"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SortButton
// ─────────────────────────────────────────────────────────────────────────────

interface SortButtonProps {
  label: string
  sortKey: SortKey
  activeSortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
}

function SortButton({ label, sortKey, activeSortKey, sortDir, onSort }: SortButtonProps) {
  const isActive = sortKey === activeSortKey

  return (
    <button
      onClick={() => onSort(sortKey)}
      aria-pressed={isActive}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2',
        'font-jetbrains text-[11px] font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
        isActive
          ? 'border-violet-500/30 bg-violet-500/10 text-violet-300'
          : 'border-white/8 bg-white/4 hover:border-white/12 hover:bg-white/6 text-slate-500 hover:text-slate-300'
      )}
    >
      {label}
      {isActive &&
        (sortDir === 'desc' ? (
          <FiArrowDown className="h-3 w-3" aria-label="descending" />
        ) : (
          <FiArrowUp className="h-3 w-3" aria-label="ascending" />
        ))}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ProjectCard
// ─────────────────────────────────────────────────────────────────────────────

function ProjectCard({ repo, index }: { repo: PinnedRepo; index: number }) {
  const langColor = getLanguageColor(repo.language)
  const visibleTopics = repo.topics.slice(0, 4)
  const extraTopics = repo.topics.length - visibleTopics.length

  return (
    <motion.article
      variants={cardVariants}
      layout
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl',
        'border-white/6 border bg-white/[0.025]',
        'backdrop-blur-sm',
        'transition-all duration-300',
        'hover:-translate-y-1.5',
        'hover:border-cyan-500/20',
        'hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(0,245,255,0.07)]',
        repo.is_archived && 'opacity-70'
      )}
      aria-label={`Repository: ${repo.name}`}
      role="article"
    >
      {/* Top gradient accent on hover */}
      <div
        className="absolute left-0 right-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${langColor}70 40%, rgba(124,58,237,0.5) 70%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Radial glow behind top edge */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${langColor}08, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-1 flex-col gap-3.5 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                'border-white/8 border bg-white/5',
                'transition-all duration-300',
                'group-hover:bg-cyan-500/8 group-hover:border-cyan-500/20'
              )}
            >
              <FiPackage className="h-3.5 w-3.5 text-slate-500 transition-colors duration-300 group-hover:text-cyan-400" />
            </div>
            <h3 className="truncate font-syne text-sm font-bold text-slate-200 transition-colors duration-300 group-hover:text-white">
              {repo.name}
            </h3>
          </div>

          {/* Action icons */}
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${repo.name} source on GitHub`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                'border-white/8 border bg-white/5 text-slate-500',
                'transition-all duration-200',
                'hover:bg-cyan-500/8 hover:border-cyan-500/25 hover:text-cyan-400'
              )}
            >
              <FiGithub className="h-3 w-3" />
            </a>
            {repo.homepage && (
              <a
                href={repo.homepage}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${repo.name} live demo`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg',
                  'border-white/8 border bg-white/5 text-slate-500',
                  'transition-all duration-200',
                  'hover:bg-violet-500/8 hover:border-violet-500/25 hover:text-violet-400'
                )}
              >
                <FiExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="flex-1 text-[13px] leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-400">
          {repo.description ? (
            truncate(repo.description, 120)
          ) : (
            <span className="italic text-slate-700">No description provided.</span>
          )}
        </p>

        {/* Topics */}
        {visibleTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTopics.map((topic) => (
              <span
                key={topic}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5',
                  'bg-violet-500/8 border border-violet-500/15',
                  'font-jetbrains text-[10px] font-medium text-violet-400'
                )}
              >
                {topic}
              </span>
            ))}
            {extraTopics > 0 && (
              <span className="border-white/6 bg-white/4 inline-flex items-center rounded-full border px-2.5 py-0.5 font-jetbrains text-[10px] text-slate-600">
                +{extraTopics}
              </span>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {repo.is_archived && (
            <span className="bg-amber-500/8 inline-flex items-center rounded-full border border-amber-500/20 px-2.5 py-0.5 font-jetbrains text-[10px] text-amber-400">
              Archived
            </span>
          )}
          {repo.is_fork && (
            <span className="bg-slate-500/8 inline-flex items-center gap-1 rounded-full border border-slate-500/20 px-2.5 py-0.5 font-jetbrains text-[10px] text-slate-500">
              <FiGitBranch className="h-2.5 w-2.5" aria-hidden="true" />
              Fork
            </span>
          )}
          {repo.license && (
            <span className="border-white/6 bg-white/4 inline-flex items-center rounded-full border px-2.5 py-0.5 font-jetbrains text-[10px] text-slate-600">
              {repo.license}
            </span>
          )}
        </div>

        {/* Footer: language + stats */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          {/* Language */}
          {repo.language ? (
            <span className="flex items-center gap-1.5 font-jetbrains text-[11px] text-slate-500">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: langColor, boxShadow: `0 0 5px ${langColor}50` }}
                aria-hidden="true"
              />
              {repo.language}
            </span>
          ) : (
            <span />
          )}

          {/* Stats */}
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1 font-jetbrains text-[11px] text-slate-600"
              aria-label={`${repo.stars} stars`}
            >
              <FiStar className="h-3 w-3 text-slate-700" />
              {formatCompactNumber(repo.stars)}
            </span>
            <span
              className="flex items-center gap-1 font-jetbrains text-[11px] text-slate-600"
              aria-label={`${repo.forks} forks`}
            >
              <FiGitBranch className="h-3 w-3 text-slate-700" />
              {formatCompactNumber(repo.forks)}
            </span>
            {repo.updated_at && (
              <span className="hidden font-jetbrains text-[11px] text-slate-700 sm:block">
                {timeAgo(repo.updated_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Featured ribbon for top-starred repos */}
      {repo.stars >= 5 && (
        <div
          className="bg-amber-500/8 absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-500/20 px-2 py-0.5"
          aria-label="Popular project"
        >
          <HiSparkles className="h-2.5 w-2.5 text-amber-400" aria-hidden="true" />
          <span className="font-jetbrains text-[9px] font-semibold uppercase tracking-wide text-amber-400/80">
            Popular
          </span>
        </div>
      )}
    </motion.article>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton grid
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-56 rounded-2xl"
          style={{ animationDelay: `${i * 60}ms` }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-white/6 flex flex-col items-center gap-5 rounded-2xl border bg-white/[0.02] px-8 py-20 text-center"
    >
      <div className="border-white/8 bg-white/4 flex h-16 w-16 items-center justify-center rounded-2xl border">
        <FiCode className="h-7 w-7 text-slate-600" />
      </div>
      <div>
        <p className="mb-1.5 font-syne text-base font-semibold text-slate-400">
          {hasFilters ? 'No matching projects' : 'No projects found'}
        </p>
        <p className="max-w-xs text-sm text-slate-600">
          {hasFilters
            ? 'Try adjusting your filters or search query.'
            : 'GitHub data is unavailable right now.'}
        </p>
      </div>
      {hasFilters && (
        <button
          onClick={onClear}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5',
            'px-4 py-2 font-jetbrains text-xs text-slate-400',
            'transition-all duration-200 hover:bg-white/10 hover:text-slate-200'
          )}
        >
          <FiX className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/15 bg-red-500/5 px-8 py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <FiAlertCircle className="h-5 w-5 text-red-400" />
      </div>
      <div>
        <p className="mb-1 font-syne text-sm font-semibold text-slate-300">
          Failed to load repositories
        </p>
        <p className="font-jetbrains text-xs text-slate-500">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5',
          'px-4 py-2 font-jetbrains text-xs text-slate-400',
          'transition-all duration-200 hover:bg-white/10 hover:text-slate-200'
        )}
      >
        <FiRefreshCw className="h-3.5 w-3.5" />
        Try again
      </button>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Results count badge
// ─────────────────────────────────────────────────────────────────────────────

function ResultsBadge({ count, total }: { count: number; total: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className="border-white/8 bg-white/4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-jetbrains text-[11px] text-slate-500"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="font-semibold text-slate-300">{count}</span>
        <span>/ {total} repos</span>
      </motion.span>
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats strip
// ─────────────────────────────────────────────────────────────────────────────

function StatsStrip({ repos }: { repos: PinnedRepo[] }) {
  const totalStars = repos.reduce((s, r) => s + r.stars, 0)
  const totalForks = repos.reduce((s, r) => s + r.forks, 0)
  const langs = new Set(repos.map((r) => r.language).filter(Boolean)).size

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="border-white/6 flex flex-wrap items-center gap-6 rounded-xl border bg-white/[0.02] px-6 py-4"
      role="region"
      aria-label="Repository statistics"
    >
      {[
        { label: 'Repos', value: repos.length, icon: FiPackage, color: 'text-cyan-400' },
        {
          label: 'Total Stars',
          value: formatCompactNumber(totalStars),
          icon: FiStar,
          color: 'text-amber-400',
        },
        {
          label: 'Total Forks',
          value: formatCompactNumber(totalForks),
          icon: FiGitBranch,
          color: 'text-violet-400',
        },
        { label: 'Languages', value: langs, icon: FiCode, color: 'text-emerald-400' },
      ].map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <stat.icon className={cn('h-3.5 w-3.5', stat.color)} aria-hidden="true" />
          <span className={cn('font-syne text-sm font-bold', stat.color)}>{stat.value}</span>
          <span className="font-jetbrains text-[11px] uppercase tracking-widest text-slate-600">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Projects Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectsPage({ params: { locale } }: { params: { locale: string } }) {


  const t = useTranslations('projects')
  const typedLocale = locale as SupportedLocale

  // ── SWR data ──────────────────────────────────────────────────────────────
  const { data, error, isLoading, mutate } = useGithubStats()
  const allRepos: PinnedRepo[] = data?.pinned_repos ?? []

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    language: 'all',
    topic: 'all',
    sortKey: 'stars',
    sortDir: 'desc',
    showArchived: false,
    showForks: false,
  })

  // Debounced search input ref (to avoid re-render on every keystroke)
  const searchRef = useRef<HTMLInputElement>(null)
  const setSearch = useMemo(
    () =>
      debounce((val: string) => {
        setFilters((f) => ({ ...f, search: val }))
      }, 200),
    []
  )

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
    },
    [setSearch]
  )

  // ── Derived filter options ────────────────────────────────────────────────
  const languages = useMemo(() => {
    const counts: Record<string, number> = {}
    allRepos.forEach((r) => {
      if (r.language) {
        counts[r.language] = (counts[r.language] ?? 0) + 1
      }
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }))
  }, [allRepos])

  const topics = useMemo(() => {
    const counts: Record<string, number> = {}
    allRepos.forEach((r) => {
      r.topics.forEach((t) => {
        counts[t] = (counts[t] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }))
  }, [allRepos])

  // ── Filtered + sorted repos ───────────────────────────────────────────────
  const filteredRepos = useMemo(() => {
    let result = [...allRepos]

    // Archived filter
    if (!filters.showArchived) {
      result = result.filter((r) => !r.is_archived)
    }

    // Fork filter
    if (!filters.showForks) {
      result = result.filter((r) => !r.is_fork)
    }

    // Language filter
    if (filters.language !== 'all') {
      result = result.filter((r) => r.language === filters.language)
    }

    // Topic filter
    if (filters.topic !== 'all') {
      result = result.filter((r) => r.topics.includes(filters.topic))
    }

    // Search
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q) ||
          r.topics.some((t) => t.toLowerCase().includes(q)) ||
          (r.language ?? '').toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (filters.sortKey) {
        case 'stars':
          cmp = a.stars - b.stars
          break
        case 'forks':
          cmp = a.forks - b.forks
          break
        case 'updated':
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
      }
      return filters.sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [allRepos, filters])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSort = useCallback((key: SortKey) => {
    setFilters((f) => ({
      ...f,
      sortKey: key,
      sortDir: f.sortKey === key ? (f.sortDir === 'desc' ? 'asc' : 'desc') : 'desc',
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      language: 'all',
      topic: 'all',
      sortKey: 'stars',
      sortDir: 'desc',
      showArchived: false,
      showForks: false,
    })
    if (searchRef.current) {
      searchRef.current.value = ''
    }
  }, [])

  const hasActiveFilters =
    filters.search !== '' ||
    filters.language !== 'all' ||
    filters.topic !== 'all' ||
    filters.showArchived ||
    filters.showForks

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden pt-[72px]">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[130px]" />
        <div className="absolute -left-24 bottom-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* ── Page header ── */}
          <div className="max-w-2xl">
            <motion.div variants={headerVariants} className="mb-4 inline-flex items-center gap-2">
              <span className="font-jetbrains text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
                <span className="opacity-50">// </span>
                {t('section_label')}
              </span>
            </motion.div>

            <motion.h1
              variants={headerVariants}
              className="mb-4 font-syne font-black leading-tight tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              {t('page.title')}
            </motion.h1>

            <motion.p
              variants={headerVariants}
              className="text-base leading-relaxed text-slate-400"
            >
              {t('page.subtitle')}
            </motion.p>
          </div>

          {/* ── Stats strip (once data loads) ── */}
          {!isLoading && allRepos.length > 0 && <StatsStrip repos={allRepos} />}

          {/* ── Search + sort controls ── */}
          <motion.div
            variants={headerVariants}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Search box */}
            <div className="relative max-w-sm flex-1">
              <FiSearch
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600"
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                type="search"
                placeholder={t('page.search_placeholder')}
                onChange={handleSearchChange}
                className={cn(
                  'border-white/8 bg-white/4 w-full rounded-xl border py-2.5 pl-10 pr-4',
                  'font-jetbrains text-sm text-slate-200 placeholder:text-slate-600',
                  'outline-none transition-all duration-200',
                  'focus:bg-white/6 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10'
                )}
                aria-label="Search repositories"
              />
              {filters.search && (
                <button
                  onClick={() => {
                    setFilters((f) => ({ ...f, search: '' }))
                    if (searchRef.current) {
                      searchRef.current.value = ''
                    }
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-slate-300"
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort buttons */}
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label={t('page.sort_by')}
            >
              <span className="font-jetbrains text-[11px] uppercase tracking-widest text-slate-600">
                {t('page.sort_by')}
              </span>
              {(
                [
                  { key: 'stars' as SortKey, label: t('page.sort_stars') },
                  { key: 'updated' as SortKey, label: t('page.sort_updated') },
                  { key: 'name' as SortKey, label: t('page.sort_name') },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <SortButton
                  key={key}
                  label={label}
                  sortKey={key}
                  activeSortKey={filters.sortKey}
                  sortDir={filters.sortDir}
                  onSort={handleSort}
                />
              ))}
            </div>
          </motion.div>

          {/* ── Language filter pills ── */}
          {!isLoading && languages.length > 0 && (
            <motion.div
              variants={headerVariants}
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label={t('filter_label')}
            >
              <FiFilter className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />

              <FilterPill
                label={t('filter_all')}
                count={allRepos.length}
                isActive={filters.language === 'all'}
                onClick={() => setFilters((f) => ({ ...f, language: 'all' }))}
              />

              {languages.map(({ name, count }) => (
                <FilterPill
                  key={name}
                  label={name}
                  count={count}
                  color={getLanguageColor(name)}
                  isActive={filters.language === name}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      language: f.language === name ? 'all' : name,
                    }))
                  }
                />
              ))}

              {/* Toggle checkboxes */}
              <div className="ml-auto flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-1.5 font-jetbrains text-[11px] text-slate-600 transition-colors hover:text-slate-400">
                  <input
                    type="checkbox"
                    checked={filters.showForks}
                    onChange={(e) => setFilters((f) => ({ ...f, showForks: e.target.checked }))}
                    className="h-3 w-3 accent-cyan-500"
                  />
                  Show forks
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 font-jetbrains text-[11px] text-slate-600 transition-colors hover:text-slate-400">
                  <input
                    type="checkbox"
                    checked={filters.showArchived}
                    onChange={(e) => setFilters((f) => ({ ...f, showArchived: e.target.checked }))}
                    className="h-3 w-3 accent-cyan-500"
                  />
                  Show archived
                </label>
              </div>
            </motion.div>
          )}

          {/* ── Topic pills ── */}
          {!isLoading && topics.length > 0 && (
            <motion.div
              variants={headerVariants}
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter by topic"
            >
              <span className="font-jetbrains text-[11px] uppercase tracking-widest text-slate-600">
                Topics
              </span>
              {topics.map(({ name, count }) => (
                <FilterPill
                  key={name}
                  label={name}
                  count={count}
                  isActive={filters.topic === name}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      topic: f.topic === name ? 'all' : name,
                    }))
                  }
                />
              ))}
            </motion.div>
          )}

          {/* ── Results count + clear ── */}
          {!isLoading && (
            <div className="flex items-center justify-between">
              <ResultsBadge count={filteredRepos.length} total={allRepos.length} />
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={clearFilters}
                  className={cn(
                    'border-white/8 bg-white/4 inline-flex items-center gap-1.5 rounded-lg border',
                    'px-3 py-1.5 font-jetbrains text-[11px] text-slate-500',
                    'hover:bg-red-500/8 transition-all duration-200 hover:border-red-500/25 hover:text-red-400'
                  )}
                  aria-label="Clear all filters"
                >
                  <FiX className="h-3.5 w-3.5" />
                  Clear all
                </motion.button>
              )}
            </div>
          )}

          {/* ── Content area ── */}
          {isLoading ? (
            <SkeletonGrid count={9} />
          ) : error ? (
            <ErrorState message={error.message} onRetry={() => void mutate()} />
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${filters.language}-${filters.topic}-${filters.search}-${filters.sortKey}-${filters.sortDir}`}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label={`${filteredRepos.length} repositories`}
              >
                {filteredRepos.length > 0 ? (
                  filteredRepos.map((repo, i) => (
                    <ProjectCard key={repo.id} repo={repo} index={i} />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Footer: link back to GitHub ── */}
          {!isLoading && data && (
            <motion.div variants={headerVariants} className="flex justify-center pt-4">
              <a
                href={data.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group inline-flex items-center gap-2.5 rounded-xl',
                  'border border-white/10 bg-white/5 px-6 py-3.5',
                  'text-sm font-semibold text-slate-400',
                  'transition-all duration-300',
                  'hover:bg-cyan-500/8 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:text-cyan-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50'
                )}
              >
                <FiGithub className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                <span>View all on GitHub</span>
                <FiExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
