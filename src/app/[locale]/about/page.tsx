'use client'

import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import {
  FiCalendar,
  FiBriefcase,
  FiCode,
  FiMapPin,
  FiDownload,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiBookOpen,
  FiAward,
  FiZap,
  FiHeart,
} from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiDocker,
  SiPostgresql,
  SiMysql,
  SiTailwindcss,
  SiFlutter,
  SiGit,
  SiVercel,
} from 'react-icons/si'

import { locales, type SupportedLocale } from '@/i18n/request'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface TimelineEntry {
  year: string
  role: string
  company: string
  companyType: string
  description: string
  tech: string[]
  isCurrent?: boolean
}

interface EducationEntry {
  year: string
  degree: string
  institution: string
  description: string
}

interface ValueCard {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: 'cyan' | 'violet' | 'emerald' | 'amber'
}

interface TechItem {
  name: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  level: 1 | 2 | 3 | 4 | 5
}

// =============================================================================
// Data
// =============================================================================

const TIMELINE: TimelineEntry[] = [
  {
    year: '2025',
    role: 'Junior Developer',
    company: 'Freelance',
    companyType: 'Freelance',
    description:
      'Creating an Islamic boarding school application — managing student data, attendance, and academic progress for a modern pesantren management system.',
    tech: ['React', 'Next.js', 'Laravel', 'MySQL'],
  },
  {
    year: '2024',
    role: 'Junior Developer',
    company: 'UT School DAD',
    companyType: 'Internship',
    description:
      'Developed a monitoring application for vehicle parts — tracking component lifecycle, maintenance schedules, and performance metrics for the fleet management system.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB'],
  },
]

const EDUCATION: EducationEntry[] = [
  {
    year: '2024 — Present',
    degree: 'Informatics Engineering',
    institution: 'UIN Maulana Malik Ibrahim Malang',
    description:
      'Studying informatics engineering with a focus on software development, AI-driven workflows, and modern web technologies.',
  },
  {
    year: '2020 — 2023',
    degree: 'Software Engineering',
    institution: 'SMKS Yosonegoro Magetan',
    description:
      'Graduated from vocational high school majoring in software engineering. Built a strong foundation in programming, web development, and problem solving.',
  },
]

const VALUES: ValueCard[] = [
  {
    icon: FiCode,
    title: 'Clean Code First',
    description:
      "I believe readable, well-structured code is a gift to future developers — including myself six months from now. Writing clean code is not just a habit; it's a discipline.",
    color: 'cyan',
  },
  {
    icon: FiZap,
    title: 'AI-Driven Development',
    description:
      'I embrace the power of AI agents and vibe coding to accelerate my workflow. By leveraging tools like LLMs and code assistants, I focus on solving problems at a higher level while shipping faster.',
    color: 'amber',
  },
  {
    icon: HiOutlineSparkles,
    title: 'Rapid Problem Solver',
    description:
      'I love tackling complex challenges with creative solutions. Whether it\'s architecting a backend system or debugging a tricky issue, I thrive on turning problems into working code.',
    color: 'violet',
  },
  {
    icon: FiHeart,
    title: 'Open Source Contributor',
    description:
      "I give back to the ecosystem that shaped me. Whether it's a bug fix, documentation improvement, or a full feature — contributing is part of my practice.",
    color: 'emerald',
  },
]

const CORE_TECH: TechItem[] = [
  { name: 'TypeScript', icon: SiTypescript, color: '#3178c6', level: 3 },
  { name: 'React', icon: SiReact, color: '#61dafb', level: 3 },
  { name: 'Next.js', icon: SiNextdotjs, color: '#ffffff', level: 3 },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933', level: 3 },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06b6d4', level: 3 },
  { name: 'PostgreSQL', icon: SiPostgresql, color: '#336791', level: 3 },
  { name: 'MySQL', icon: SiMysql, color: '#4479A1', level: 3 },
  { name: 'Flutter', icon: SiFlutter, color: '#02569B', level: 3 },
  { name: 'Docker', icon: SiDocker, color: '#2496ed', level: 3 },
  { name: 'Git', icon: SiGit, color: '#f05032', level: 3 },
  { name: 'Vercel', icon: SiVercel, color: '#ffffff', level: 3 },
]

const INTERESTS = [
  { emoji: '🤖', label: 'AI & LLMs' },
  { emoji: '💻', label: 'Vibe Coding' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '📚', label: 'Tech Books' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '🎵', label: 'Lo-fi Music' },
  { emoji: '🚀', label: 'Open Source' },
  { emoji: '🧩', label: 'Problem Solving' },
]

// =============================================================================
// Color maps
// =============================================================================

const VALUE_COLORS = {
  cyan: {
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/20',
    icon: 'text-cyan-400',
    title: 'text-cyan-300',
  },
  violet: {
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    icon: 'text-violet-400',
    title: 'text-violet-300',
  },
  emerald: {
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    title: 'text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    title: 'text-amber-300',
  },
}

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
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

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

const fadeRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

// =============================================================================
// Sub-components
// =============================================================================

/** Section label with the // prefix */
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2">
      <span className="font-jetbrains text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
        <span className="opacity-50">// </span>
        {text}
      </span>
    </div>
  )
}

/** Gradient horizontal rule */
function GradientDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'via-white/8 h-px w-full bg-gradient-to-r from-transparent to-transparent',
        className
      )}
      aria-hidden="true"
    />
  )
}

/** Timeline card */
function TimelineCard({
  entry,
  index,
  isInView,
}: {
  entry: TimelineEntry
  index: number
  isInView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
      transition={{
        duration: 0.55,
        delay: 0.1 + index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex gap-5"
    >
      {/* Timeline spine */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            entry.isCurrent
              ? 'border-2 border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_16px_rgba(0,245,255,0.3)]'
              : 'border border-slate-700 bg-[#0d1117]'
          )}
        >
          {entry.isCurrent ? (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400" />
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          )}
        </div>

        {/* Vertical line */}
        {index < TIMELINE.length - 1 && (
          <motion.div
            initial={{ scaleY: 0, originY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3 + index * 0.1,
              ease: 'easeInOut',
            }}
            className="mt-1 w-px flex-1 bg-gradient-to-b from-cyan-500/20 to-slate-800"
            style={{ minHeight: '2.5rem' }}
          />
        )}
      </div>

      {/* Content card */}
      <div className="mb-8 min-w-0 flex-1">
        <div
          className={cn(
            'group relative overflow-hidden rounded-2xl border p-5',
            'glass transition-all duration-300',
            'hover:-translate-y-0.5 hover:shadow-glass-hover',
            entry.isCurrent
              ? 'border-cyan-500/20 bg-cyan-500/[0.03]'
              : 'border-white/6 bg-white/[0.02]'
          )}
        >
          {/* Glow on current */}
          {entry.isCurrent && (
            <div
              className="pointer-events-none absolute inset-0 opacity-100"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,245,255,0.04), transparent 70%)',
              }}
              aria-hidden="true"
            />
          )}

          {/* Top row */}
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {/* Year badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
                    'font-jetbrains text-[11px] font-semibold',
                    entry.isCurrent
                      ? 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-400'
                      : 'border-white/8 bg-white/4 border text-slate-500'
                  )}
                >
                  <FiCalendar className="h-3 w-3" aria-hidden="true" />
                  {entry.year}
                </span>

                {/* Company type badge */}
                <span className="border-white/6 bg-white/4 inline-flex items-center rounded-full border px-2.5 py-0.5 font-jetbrains text-[10px] text-slate-600">
                  {entry.companyType}
                </span>

                {entry.isCurrent && (
                  <span className="bg-emerald-500/8 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 px-2.5 py-0.5 font-jetbrains text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    Current
                  </span>
                )}
              </div>

              <h3 className="font-syne text-base font-bold text-slate-100">{entry.role}</h3>
              <p className="font-jetbrains text-[12px] font-medium text-violet-400">
                @ {entry.company}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mb-4 text-[13px] leading-relaxed text-slate-500">{entry.description}</p>

          {/* Tech chips */}
          <div className="flex flex-wrap gap-1.5">
            {entry.tech.map((tech) => (
              <span
                key={tech}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5',
                  'border-white/6 bg-white/4 border',
                  'font-jetbrains text-[10px] text-slate-500',
                  'transition-colors duration-200',
                  'group-hover:border-cyan-500/12 group-hover:text-slate-400'
                )}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/** Value card */
function ValueCard({
  value,
  index,
  isInView,
}: {
  value: ValueCard
  index: number
  isInView: boolean
}) {
  const colors = VALUE_COLORS[value.color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-6',
        'glass transition-all duration-300',
        'hover:shadow-glass-hover',
        colors.border
      )}
    >
      {/* Background tint on hover */}
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
          'relative inline-flex h-11 w-11 items-center justify-center rounded-xl border',
          colors.bg,
          colors.border
        )}
      >
        <value.icon className={cn('h-5 w-5', colors.icon)} />
      </div>

      {/* Title */}
      <h3 className={cn('relative font-syne text-base font-bold', colors.title)}>{value.title}</h3>

      {/* Description */}
      <p className="relative text-[13px] leading-relaxed text-slate-500">{value.description}</p>
    </motion.div>
  )
}

/** Tech pill */
function TechPill({ item, index, isInView }: { item: TechItem; index: number; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.35,
        delay: 0.05 + index * 0.03,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3, scale: 1.05 }}
      className={cn(
        'border-white/6 group flex items-center gap-2.5 rounded-xl border bg-white/[0.03] px-4 py-2.5',
        'cursor-default transition-all duration-300',
        'hover:border-white/12 hover:bg-white/[0.06]'
      )}
      style={{
        boxShadow: undefined,
      }}
    >
      <item.icon
        className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ color: item.color }}
      />
      <span className="font-jetbrains text-[12px] font-medium text-slate-400 transition-colors duration-200 group-hover:text-slate-200">
        {item.name}
      </span>
      {/* Proficiency dots */}
      <div className="ml-auto flex gap-0.5" aria-label={`Level ${item.level} of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 w-2.5 rounded-full transition-colors duration-300',
              i < item.level ? 'bg-cyan-500/70' : 'bg-white/10'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    </motion.div>
  )
}

/** Education card */
function EducationCard({ entry, isInView }: { entry: EducationEntry; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-violet-500/20 p-6',
        'glass transition-all duration-300 hover:shadow-glass-hover',
        'bg-violet-500/[0.025]'
      )}
    >
      {/* Top accent */}
      <div
        className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
        aria-hidden="true"
      />

      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 font-jetbrains text-[11px] font-semibold text-violet-400">
              <FiCalendar className="h-3 w-3" aria-hidden="true" />
              {entry.year}
            </span>
          </div>
          <h3 className="font-syne text-base font-bold text-slate-100">{entry.degree}</h3>
          <p className="font-jetbrains text-[12px] font-medium text-violet-400">
            @ {entry.institution}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
          <FiBookOpen className="h-4.5 w-4.5 text-violet-400" />
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-slate-500">{entry.description}</p>
    </motion.div>
  )
}

/** Stats strip */
function StatsStrip({ isInView }: { isInView: boolean }) {
  const stats = [
    { value: '3+', label: 'Years of Experience', color: 'text-cyan-400' },
    { value: '20+', label: 'Projects Shipped', color: 'text-violet-400' },
    { value: '15+', label: 'Open Source Repos', color: 'text-emerald-400' },
    { value: '100k+', label: 'Lines of Code Written', color: 'text-amber-400' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="list"
      aria-label="Career statistics"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{
            duration: 0.45,
            delay: 0.25 + i * 0.07,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn(
            'border-white/6 flex flex-col items-center gap-1.5 rounded-2xl border',
            'bg-white/[0.02] px-4 py-5 text-center',
            'transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04]'
          )}
          role="listitem"
        >
          <span className={cn('font-syne text-3xl font-black', stat.color)}>{stat.value}</span>
          <span className="font-jetbrains text-[10px] uppercase tracking-widest text-slate-600">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}

/** Interest badge */
function InterestBadge({
  item,
  index,
  isInView,
}: {
  item: { emoji: string; label: string }
  index: number
  isInView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{
        duration: 0.4,
        delay: 0.05 + index * 0.04,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ scale: 1.06, y: -2 }}
      className={cn(
        'border-white/8 bg-white/4 flex items-center gap-2.5 rounded-xl border px-4 py-2.5',
        'cursor-default transition-all duration-200',
        'hover:border-white/14 hover:bg-white/6'
      )}
    >
      <span className="text-lg leading-none" aria-hidden="true">
        {item.emoji}
      </span>
      <span className="font-jetbrains text-[12px] font-medium text-slate-400">{item.label}</span>
    </motion.div>
  )
}

// =============================================================================
// Main About Page
// =============================================================================

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {


  const t = useTranslations('about')

  // Section refs for scroll-triggered animations
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const techRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const educationRef = useRef<HTMLDivElement>(null)
  const interestsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const heroInView = useInView(heroRef, { once: true, margin: '-60px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' })
  const valuesInView = useInView(valuesRef, { once: true, margin: '-60px' })
  const techInView = useInView(techRef, { once: true, margin: '-60px' })
  const timelineInView = useInView(timelineRef, { once: true, margin: '-60px' })
  const educationInView = useInView(educationRef, { once: true, margin: '-60px' })
  const interestsInView = useInView(interestsRef, { once: true, margin: '-60px' })
  const ctaInView = useInView(ctaRef, { once: true, margin: '-60px' })

  const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Your Name'
  const authorTitle = process.env.NEXT_PUBLIC_AUTHOR_TITLE ?? 'Full-Stack Developer & UI Engineer'
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com'
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? 'https://linkedin.com'

  return (
    <div className="relative min-h-screen overflow-hidden pt-[72px]">
      {/* ── Global background decorations ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-violet-600/4 absolute -left-48 top-1/4 h-[700px] w-[700px] rounded-full blur-[150px]" />
        <div className="bg-cyan-500/4 absolute -right-32 top-0 h-[600px] w-[600px] rounded-full blur-[130px]" />
        <div className="bg-violet-500/3 absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-24 px-4 py-16 sm:px-6 lg:px-8">
        {/* ══ HERO INTRO ══════════════════════════════════════════════════════ */}
        <div ref={heroRef}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            className="max-w-3xl"
          >
            <motion.div variants={itemVariants}>
              <SectionLabel text={t('section_label')} />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 font-syne font-black leading-tight tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              {t('title')}{' '}
              <span
                className="text-transparent"
                style={{
                  background: 'linear-gradient(135deg, #00f5ff 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                {t('title_highlight')}
              </span>
            </motion.h1>

            <div className="max-w-2xl space-y-4">
              {(['bio_paragraph_1', 'bio_paragraph_2', 'bio_paragraph_3'] as const).map(
                (key, i) => (
                  <motion.p
                    key={key}
                    variants={itemVariants}
                    className="text-base leading-[1.85] text-slate-400"
                  >
                    {t(key)}
                  </motion.p>
                )
              )}
            </div>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold text-[#050816] shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                <FiMail className="h-4 w-4" />
                Get In Touch
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:text-cyan-300"
              >
                <FiGithub className="h-4 w-4" />
                GitHub Profile
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="border-white/8 bg-white/4 inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium text-slate-500 transition-all duration-300 hover:text-slate-300"
              >
                <FiDownload className="h-4 w-4" />
                Resume
              </a>
            </motion.div>
          </motion.div>
        </div>

        <GradientDivider />

        {/* ══ STATS ══════════════════════════════════════════════════════════ */}
        <div ref={statsRef}>
          <StatsStrip isInView={statsInView} />
        </div>

        <GradientDivider />

        {/* ══ VALUES ═════════════════════════════════════════════════════════ */}
        <div ref={valuesRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <SectionLabel text="What I Believe In" />
            <h2 className="font-syne text-2xl font-black text-white md:text-3xl">
              Engineering with <span className="text-gradient">purpose</span>
            </h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <ValueCard key={value.title} value={value} index={i} isInView={valuesInView} />
            ))}
          </div>
        </div>

        <GradientDivider />

        {/* ══ CORE TECH ══════════════════════════════════════════════════════ */}
        <div ref={techRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={techInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <SectionLabel text={t('skills_label')} />
            <h2 className="font-syne text-2xl font-black text-white md:text-3xl">
              My <span className="text-gradient">core stack</span>
            </h2>
          </motion.div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {CORE_TECH.map((item, i) => (
              <TechPill key={item.name} item={item} index={i} isInView={techInView} />
            ))}
          </div>
        </div>

        <GradientDivider />

        {/* ══ EXPERIENCE TIMELINE ════════════════════════════════════════════ */}
        <div ref={timelineRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <SectionLabel text={t('timeline_label')} />
            <h2 className="font-syne text-2xl font-black text-white md:text-3xl">
              Where I&apos;ve <span className="text-gradient">worked</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl space-y-0">
            {TIMELINE.map((entry, i) => (
              <TimelineCard
                key={`${entry.year}-${entry.company}`}
                entry={entry}
                index={i}
                isInView={timelineInView}
              />
            ))}
          </div>
        </div>

        <GradientDivider />

        {/* ══ EDUCATION ══════════════════════════════════════════════════════ */}
        <div ref={educationRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={educationInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <SectionLabel text={t('education_label')} />
            <h2 className="font-syne text-2xl font-black text-white md:text-3xl">
              Academic <span className="text-gradient">background</span>
            </h2>
          </motion.div>

          <div className="max-w-2xl space-y-4">
            {EDUCATION.map((entry) => (
              <EducationCard key={entry.institution} entry={entry} isInView={educationInView} />
            ))}
          </div>
        </div>

        <GradientDivider />

        {/* ══ INTERESTS ══════════════════════════════════════════════════════ */}
        <div ref={interestsRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={interestsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <SectionLabel text={t('fun_facts_label')} />
            <h2 className="font-syne text-2xl font-black text-white md:text-3xl">
              Beyond the <span className="text-gradient">code</span>
            </h2>
          </motion.div>

          <div className="flex flex-wrap gap-3">
            {INTERESTS.map((item, i) => (
              <InterestBadge key={item.label} item={item} index={i} isInView={interestsInView} />
            ))}
          </div>
        </div>

        <GradientDivider />

        {/* ══ CTA STRIP ══════════════════════════════════════════════════════ */}
        <div ref={ctaRef}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="border-white/6 from-cyan-500/4 to-violet-600/4 flex flex-col items-center justify-between gap-6 rounded-2xl border bg-gradient-to-r via-transparent p-8 text-center backdrop-blur-sm sm:flex-row sm:text-left"
          >
            <div>
              <h3 className="mb-2 font-syne text-xl font-bold text-white">
                Ready to build something great?
              </h3>
              <p className="text-sm text-slate-500">
                I&apos;m open to full-time roles, freelance contracts, and interesting
                collaborations.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-bold text-[#050816] shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              >
                <FiMail className="h-4 w-4" />
                Say Hello
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0a66c2]/30 hover:text-[#0a66c2]"
              >
                <FiLinkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
