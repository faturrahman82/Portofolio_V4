'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import {
  FiMapPin,
  FiBriefcase,
  FiCode,
  FiCoffee,
  FiChevronRight,
  FiCalendar,
  FiZap,
} from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'
import { SiTypescript, SiReact, SiNextdotjs, SiNodedotjs, SiMysql } from 'react-icons/si'

import { cn } from '@/lib/utils'
import { useGithubStats } from '@/hooks/useGithubStats'

// =============================================================================
// Types
// =============================================================================

interface TimelineEntry {
  year: string
  role: string
  company: string
  description: string
}

interface QuickFact {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: 'cyan' | 'violet' | 'emerald' | 'amber'
}

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

const slideLeftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
}

const slideRightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
}

// =============================================================================
// Quick fact card
// =============================================================================

const FACT_COLORS = {
  cyan: {
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/20',
    icon: 'text-cyan-400',
    value: 'text-cyan-300',
  },
  violet: {
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    icon: 'text-violet-400',
    value: 'text-violet-300',
  },
  emerald: {
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    value: 'text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    icon: 'text-amber-400',
    value: 'text-amber-300',
  },
}

function QuickFactCard({ fact, index }: { fact: QuickFact; index: number }) {
  const colors = FACT_COLORS[fact.color]

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-center gap-3 rounded-xl border p-3.5',
        'glass transition-all duration-300',
        'hover:shadow-glass-hover',
        colors.border
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
          colors.bg,
          colors.border
        )}
      >
        <fact.icon className={cn('h-4 w-4', colors.icon)} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-jetbrains text-[11px] uppercase tracking-widest text-slate-600">
          {fact.label}
        </p>
        <p className={cn('truncate font-syne text-sm font-bold', colors.value)}>{fact.value}</p>
      </div>
    </motion.div>
  )
}

// =============================================================================
// Bio paragraph
// =============================================================================

function BioParagraph({
  text,
  delay = 0,
  isInView,
}: {
  text: string
  delay?: number
  isInView: boolean
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="text-[15px] leading-[1.85] text-slate-400"
    >
      {text}
    </motion.p>
  )
}

// =============================================================================
// Profile image with glow frame
// =============================================================================

function ProfileImage({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-fit"
    >
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-3xl opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,245,255,0.15), transparent 70%)',
          filter: 'blur(20px)',
        }}
        aria-hidden="true"
      />

      {/* Animated border gradient */}
      <div
        className="absolute -inset-0.5 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,245,255,0.4), rgba(124,58,237,0.4))',
          borderRadius: '1.5rem',
        }}
        aria-hidden="true"
      />

      {/* Inner container */}
      <div className="relative overflow-hidden rounded-3xl bg-[#090d1f] p-0.5">
        {/* Placeholder avatar using initials */}
        <div
          className={cn(
            'relative flex h-64 w-64 items-center justify-center rounded-[calc(1.5rem-2px)] sm:h-72 sm:w-72',
            'bg-gradient-to-br from-[#0d1117] to-[#1a1f2e]',
            'overflow-hidden'
          )}
          aria-label="Profile photo"
        >
          <Image
            src="/img/aku.jpg"
            alt="Profile Photo"
            fill
            sizes="(max-width: 640px) 256px, 288px"
            className="object-cover object-[center_20%] transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>
      </div>

      {/* Floating badge — "Available" */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.9 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'absolute -bottom-4 left-1/2 -translate-x-1/2',
          'flex items-center gap-2 rounded-full',
          'border border-emerald-500/20 bg-[#090d1f]/90 px-4 py-2',
          'shadow-lg backdrop-blur-md'
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-jetbrains text-[11px] font-semibold text-emerald-400">
          Available for hire
        </span>
      </motion.div>

      {/* Floating badge — stack icons */}
      <motion.div
        initial={{ opacity: 0, x: 16, scale: 0.9 }}
        animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 16, scale: 0.9 }}
        transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'absolute -right-6 top-1/3',
          'flex flex-col items-center gap-2 rounded-2xl',
          'border-white/8 border bg-[#090d1f]/90 p-3',
          'shadow-lg backdrop-blur-md'
        )}
      >
        <SiTypescript className="h-4 w-4 text-blue-400" />
        <SiReact className="h-4 w-4 text-cyan-400" />
        <SiNextdotjs className="h-4 w-4 text-white" />
        <SiNodedotjs className="h-4 w-4 text-green-400" />
        <SiMysql className="h-4 w-4 text-blue-400" />
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// Timeline item
// =============================================================================

function TimelineItem({
  entry,
  index,
  isLast,
  isInView,
}: {
  entry: TimelineEntry
  index: number
  isLast: boolean
  isInView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{
        duration: 0.5,
        delay: 0.15 + index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative flex gap-5"
    >
      {/* Timeline spine */}
      <div className="relative flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            'border border-cyan-500/30 bg-[#090d1f]',
            'shadow-[0_0_12px_rgba(0,245,255,0.2)]'
          )}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
        </div>

        {/* Vertical line */}
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0, originY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: 'easeInOut' }}
            className="mt-1 w-px flex-1 bg-gradient-to-b from-cyan-500/30 to-violet-500/10"
            style={{ minHeight: '2rem' }}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn('pb-8', isLast && 'pb-0', 'min-w-0 flex-1')}>
        {/* Year badge */}
        <div className="bg-cyan-500/8 mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/15 px-2.5 py-0.5">
          <FiCalendar className="h-3 w-3 text-cyan-500" />
          <span className="font-jetbrains text-[11px] font-semibold text-cyan-400">
            {entry.year}
          </span>
        </div>

        {/* Role + Company */}
        <h4 className="mb-0.5 font-syne text-sm font-bold text-slate-200">{entry.role}</h4>
        <p className="mb-2 font-jetbrains text-[12px] text-violet-400">@ {entry.company}</p>

        {/* Description */}
        <p className="text-[13px] leading-relaxed text-slate-500">{entry.description}</p>
      </div>
    </motion.div>
  )
}

// =============================================================================
// Fun fact card
// =============================================================================

function FunFactCard({
  fact,
  index,
  isInView,
}: {
  fact: string
  index: number
  isInView: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
      transition={{
        duration: 0.45,
        delay: 0.1 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={cn(
        'group relative flex gap-3 overflow-hidden rounded-xl border p-4',
        'border-white/6 bg-white/[0.02]',
        'cursor-default transition-all duration-300',
        'hover:border-cyan-500/15 hover:bg-cyan-500/[0.03]',
        'hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
      )}
    >
      {/* Accent dot */}
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <motion.span
          animate={hovered ? { scale: 1.3 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="h-2 w-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500"
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <p className="text-[13px] leading-relaxed text-slate-500 transition-colors duration-200 group-hover:text-slate-400">
        {fact}
      </p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-cyan-500/40 to-violet-500/40 transition-all duration-400 group-hover:w-full"
        aria-hidden="true"
      />
    </motion.div>
  )
}

// =============================================================================
// Section label
// =============================================================================

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

// =============================================================================
// Main AboutSection
// =============================================================================

export function AboutSection() {
  const t = useTranslations('about')
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { data } = useGithubStats()

  // ─── Build timeline from translations ───────────────────────────────────
  const timeline: TimelineEntry[] = t.raw('timeline') as TimelineEntry[]
  const funFacts: string[] = t.raw('fun_facts') as string[]

  // ─── Quick facts ────────────────────────────────────────────────────────
  const quickFacts: QuickFact[] = [
    {
      icon: FiMapPin,
      label: 'Location',
      value: t('quick_facts.location'),
      color: 'cyan',
    },
    {
      icon: FiBriefcase,
      label: 'Experience',
      value: t('quick_facts.experience'),
      color: 'violet',
    },
    {
      icon: FiCode,
      label: 'Projects',
      value: data?.public_repos 
        ? `${data.public_repos}+ ${t('quick_facts.projects').split(' ').slice(1).join(' ')}` 
        : t('quick_facts.projects'),
      color: 'emerald',
    },
    {
      icon: FiCoffee,
      label: 'Fuel',
      value: t('quick_facts.coffee'),
      color: 'amber',
    },
  ]

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <section
      ref={ref}
      id="about"
      className="relative overflow-hidden py-24 lg:py-32"
      aria-label="About section"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[130px]" />
        <div className="bg-cyan-500/4 absolute -right-16 bottom-1/3 h-[400px] w-[400px] rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ══════════════════════════════════════════════════════════════════
            SECTION HEADER
            ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="mb-16 max-w-2xl"
        >
          <motion.div variants={itemVariants}>
            <SectionLabel text={t('section_label')} />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="mb-4 font-syne font-black leading-tight tracking-tight text-white"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t('title')} <span className="text-gradient">{t('title_highlight')}</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-base leading-relaxed text-slate-400">
            A little bit about who I am, what drives me, and the path that led me here.
          </motion.p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            MAIN CONTENT — two-column layout
            ══════════════════════════════════════════════════════════════════ */}
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          {/* ── Left column: profile + quick facts ── */}
          <motion.div
            variants={slideLeftVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex flex-col gap-10"
          >
            {/* Profile image */}
            <div className="flex justify-center lg:justify-start">
              <ProfileImage isInView={isInView} />
            </div>

            {/* Quick facts grid */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-4 font-jetbrains text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600"
              >
                {t('quick_facts_title')}
              </motion.p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="grid grid-cols-2 gap-3"
              >
                {quickFacts.map((fact, i) => (
                  <QuickFactCard key={fact.label} fact={fact} index={i} />
                ))}
              </motion.div>
            </div>

            {/* Decorative code block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="border-white/6 hidden rounded-2xl border bg-[#0d1117]/80 p-5 backdrop-blur-sm lg:block"
              aria-hidden="true"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 font-jetbrains text-[10px] text-slate-600">about.json</span>
              </div>
              <pre className="overflow-x-auto font-jetbrains text-[12px] leading-relaxed">
                <code>
                  <span className="text-white">{'{'}</span>
                  {'\n'}
                  <span className="text-cyan-300"> &quot;passions&quot;</span>
                  <span className="text-white">: [</span>
                  {'\n'}
                  <span className="text-green-400"> &quot;Clean Architecture&quot;</span>
                  <span className="text-white">,</span>
                  {'\n'}
                  <span className="text-green-400"> &quot;Atomic Design&quot;</span>
                  <span className="text-white">,</span>
                  {'\n'}
                  <span className="text-green-400"> &quot;Web Performance&quot;</span>
                  {'\n'}
                  <span className="text-white"> ],</span>
                  {'\n'}
                  <span className="text-cyan-300"> &quot;currentlyLearning&quot;</span>
                  <span className="text-white">: </span>
                  <span className="text-yellow-400">&quot;WebGPU&quot;</span>
                  <span className="text-white">,</span>
                  {'\n'}
                  <span className="text-cyan-300"> &quot;openToWork&quot;</span>
                  <span className="text-white">: </span>
                  <span className="text-violet-400">true</span>
                  {'\n'}
                  <span className="text-white">{'}'}</span>
                </code>
              </pre>
            </motion.div>
          </motion.div>

          {/* ── Right column: bio + timeline + fun facts ── */}
          <motion.div
            variants={slideRightVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex flex-col gap-12"
          >
            {/* Bio */}
            <div className="space-y-4">
              <BioParagraph text={t('bio_paragraph_1')} delay={0.1} isInView={isInView} />
              <BioParagraph text={t('bio_paragraph_2')} delay={0.2} isInView={isInView} />
              <BioParagraph text={t('bio_paragraph_3')} delay={0.3} isInView={isInView} />
            </div>

            {/* Divider */}
            <div
              className="via-white/8 h-px w-full bg-gradient-to-r from-transparent to-transparent"
              aria-hidden="true"
            />

            {/* Experience timeline */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mb-6 flex items-center gap-3"
              >
                <div className="bg-violet-500/8 flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20">
                  <FiBriefcase className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h3 className="font-jetbrains text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {t('timeline_label')}
                </h3>
              </motion.div>

              <div className="space-y-0">
                {timeline.map((entry, i) => (
                  <TimelineItem
                    key={`${entry.year}-${entry.company}`}
                    entry={entry}
                    index={i}
                    isLast={i === timeline.length - 1}
                    isInView={isInView}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="via-white/8 h-px w-full bg-gradient-to-r from-transparent to-transparent"
              aria-hidden="true"
            />

            {/* Fun facts */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mb-5 flex items-center gap-3"
              >
                <div className="bg-amber-500/8 flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/20">
                  <HiOutlineSparkles className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <h3 className="font-jetbrains text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {t('fun_facts_label')}
                </h3>
              </motion.div>

              <div className="space-y-2.5">
                {funFacts.map((fact, i) => (
                  <FunFactCard key={i} fact={fact} index={i} isInView={isInView} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            BOTTOM CTA STRIP
            ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'mt-20 flex flex-col items-center justify-between gap-6 rounded-2xl border p-8 sm:flex-row',
            'border-white/6 from-cyan-500/4 to-violet-600/4 bg-gradient-to-r via-transparent',
            'glass'
          )}
        >
          <div className="text-center sm:text-left">
            <h3 className="mb-1.5 font-syne text-xl font-bold text-white">
              Interested in working together?
            </h3>
            <p className="text-sm text-slate-500">
              I&apos;m always open to discussing new opportunities and exciting projects.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'}`}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold',
                'bg-gradient-to-r from-cyan-500 to-violet-600 text-[#050816]',
                'shadow-lg shadow-cyan-500/20 transition-all duration-300',
                'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/30 hover:brightness-110'
              )}
            >
              <FiZap className="h-4 w-4" />
              Let&apos;s Talk
            </a>

            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5',
                'px-6 py-3 text-sm font-semibold text-slate-300 backdrop-blur-sm',
                'transition-all duration-300',
                'hover:bg-cyan-500/8 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:text-cyan-300'
              )}
            >
              <FiChevronRight className="h-4 w-4" />
              View Resume
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
