'use client'

import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import { HiOutlineSparkles } from 'react-icons/hi2'
import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiDocker,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiGit,
  SiTailwindcss,
  SiPrisma,
  SiVercel,
  SiVite,
  SiFigma,
  SiFlutter,
} from 'react-icons/si'

import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface Skill {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  level: 1 | 2 | 3 | 4 | 5
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'mobile'
  isFeatured?: boolean
}

interface SkillCategory {
  id: string
  label: string
  color: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'blue'
}

// =============================================================================
// Data
// =============================================================================

const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'frontend', label: 'Frontend', color: 'cyan' },
  { id: 'backend', label: 'Backend', color: 'violet' },
  { id: 'database', label: 'Database', color: 'emerald' },
  { id: 'devops', label: 'DevOps / Cloud', color: 'amber' },
  { id: 'tools', label: 'Tools', color: 'rose' },
  { id: 'mobile', label: 'Mobile', color: 'blue' },
]

const SKILLS: Skill[] = [
  // ── Frontend ──────────────────────────────────────────────
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: SiTypescript,
    color: '#3178c6',
    level: 3,
    category: 'frontend',
    isFeatured: true,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: SiJavascript,
    color: '#f7df1e',
    level: 3,
    category: 'frontend',
    isFeatured: true,
  },
  {
    id: 'react',
    name: 'React',
    icon: SiReact,
    color: '#61dafb',
    level: 3,
    category: 'frontend',
    isFeatured: true,
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    icon: SiNextdotjs,
    color: '#ffffff',
    level: 3,
    category: 'frontend',
    isFeatured: true,
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    icon: SiTailwindcss,
    color: '#06b6d4',
    level: 3,
    category: 'frontend',
    isFeatured: true,
  },
  { id: 'vite', name: 'Vite', icon: SiVite, color: '#646cff', level: 3, category: 'frontend' },

  // ── Backend ───────────────────────────────────────────────
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: SiNodedotjs,
    color: '#339933',
    level: 3,
    category: 'backend',
    isFeatured: true,
  },

  { id: 'prisma', name: 'Prisma', icon: SiPrisma, color: '#5a67d8', level: 3, category: 'backend' },

  // ── Database ──────────────────────────────────────────────
  {
    id: 'postgres',
    name: 'PostgreSQL',
    icon: SiPostgresql,
    color: '#336791',
    level: 3,
    category: 'database',
    isFeatured: true,
  },
  {
    id: 'mysql',
    name: 'MySQL',
    icon: SiMysql,
    color: '#4479A1',
    level: 3,
    category: 'database',
  },

  // ── DevOps / Cloud ────────────────────────────────────────
  {
    id: 'docker',
    name: 'Docker',
    icon: SiDocker,
    color: '#2496ed',
    level: 3,
    category: 'devops',
    isFeatured: true,
  },
  { id: 'vercel', name: 'Vercel', icon: SiVercel, color: '#ffffff', level: 3, category: 'devops' },

  // ── Tools ─────────────────────────────────────────────────
  {
    id: 'git',
    name: 'Git',
    icon: SiGit,
    color: '#f05032',
    level: 3,
    category: 'tools',
    isFeatured: true,
  },
  { id: 'figma', name: 'Figma', icon: SiFigma, color: '#f24e1e', level: 3, category: 'tools' },

  // ── Mobile ────────────────────────────────────────────────
  {
    id: 'flutter',
    name: 'Flutter',
    icon: SiFlutter,
    color: '#02569B',
    level: 3,
    category: 'mobile',
  },
]

// =============================================================================
// Proficiency levels
// =============================================================================

const LEVEL_LABEL: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}

// =============================================================================
// Category colour map
// =============================================================================

const CATEGORY_COLORS: Record<
  SkillCategory['color'],
  {
    bg: string
    border: string
    text: string
    dot: string
    ring: string
  }
> = {
  cyan: {
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-500/20',
  },
  violet: {
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    dot: 'bg-violet-500',
    ring: 'ring-violet-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
  },
  rose: {
    bg: 'bg-rose-500/8',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500/20',
  },
  blue: {
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/20',
  },
}

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
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

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

// =============================================================================
// Skill card component
// =============================================================================

interface SkillCardProps {
  skill: Skill
  categoryColor: SkillCategory['color']
}

function SkillCard({ skill, categoryColor }: SkillCardProps) {
  const colors = CATEGORY_COLORS[categoryColor]

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.03 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-2xl border p-5',
        'glass cursor-default select-none',
        'transition-all duration-300',
        'hover:shadow-glass-hover',
        'border-white/6',
        `hover:${colors.border}`,
        `hover:ring-1 ${colors.ring}`
      )}
      aria-label={`${skill.name} — ${LEVEL_LABEL[skill.level]}`}
      role="listitem"
    >
      {/* Glow behind icon */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${skill.color}12, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Icon container */}
      <div
        className={cn(
          'relative flex h-12 w-12 items-center justify-center rounded-xl',
          'border-white/8 border bg-white/5',
          'transition-all duration-300',
          `group-hover:${colors.bg}`,
          `group-hover:${colors.border}`
        )}
        style={{
          boxShadow: `0 0 0 0 ${skill.color}00`,
        }}
      >
        <skill.icon
          className="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
          style={{ color: skill.color }}
        />

        {/* Featured sparkle */}
        {skill.isFeatured && (
          <span
            className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500"
            aria-label="Featured skill"
          >
            <HiOutlineSparkles className="h-2 w-2 text-[#050816]" />
          </span>
        )}
      </div>

      {/* Name */}
      <span className="text-center font-syne text-xs font-semibold leading-tight text-slate-300 transition-colors duration-200 group-hover:text-white">
        {skill.name}
      </span>

      {/* Proficiency dots */}
      <div
        className="flex items-center gap-1"
        aria-label={`Proficiency: ${LEVEL_LABEL[skill.level]}`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 w-4 rounded-full transition-all duration-300',
              i < skill.level ? cn(colors.dot, 'opacity-90') : 'bg-white/10'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
    </motion.div>
  )
}

// =============================================================================
// Category group component
// =============================================================================

interface CategoryGroupProps {
  category: SkillCategory
  skills: Skill[]
  isInView: boolean
  index: number
}

function CategoryGroup({ category, skills, isInView, index }: CategoryGroupProps) {
  const colors = CATEGORY_COLORS[category.color]

  if (skills.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{
        duration: 0.6,
        delay: 0.1 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="space-y-4"
    >
      {/* Category header */}
      <div className="flex items-center gap-3">
        <span className={cn('h-2 w-2 rounded-full', colors.dot, 'shadow-sm')} aria-hidden="true" />
        <h3
          className={cn(
            'font-jetbrains text-xs font-semibold uppercase tracking-[0.16em]',
            colors.text
          )}
        >
          {category.label}
        </h3>
        <div
          className="from-white/8 h-px flex-1 bg-gradient-to-r to-transparent"
          aria-hidden="true"
        />
        <span className="font-jetbrains text-[10px] text-slate-600">
          {skills.length} skill{skills.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Skills grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5"
        role="list"
        aria-label={`${category.label} skills`}
      >
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} categoryColor={category.color} />
        ))}
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// Proficiency legend
// =============================================================================

function ProficiencyLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl',
        'border-white/6 border bg-white/[0.02] px-5 py-3.5'
      )}
      aria-label="Proficiency level legend"
    >
      <span className="font-jetbrains text-[11px] uppercase tracking-widest text-slate-600">
        Proficiency
      </span>

      {Object.entries(LEVEL_LABEL).map(([lvl, label]) => (
        <div key={lvl} className="flex items-center gap-2">
          <div className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 w-3 rounded-full',
                  i < Number(lvl) ? 'bg-cyan-500/70' : 'bg-white/10'
                )}
              />
            ))}
          </div>
          <span className="font-jetbrains text-[11px] text-slate-500">{label}</span>
        </div>
      ))}
    </motion.div>
  )
}

// =============================================================================
// Featured skills marquee strip
// =============================================================================

function FeaturedStrip({ skills }: { skills: Skill[] }) {
  const doubled = [...skills, ...skills]

  return (
    <div className="relative overflow-hidden py-2" aria-hidden="true">
      {/* Left/right fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050816] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050816] to-transparent" />

      <motion.div
        className="flex gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: 28,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {doubled.map((skill, i) => (
          <div
            key={`${skill.id}-${i}`}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full',
              'border-white/8 bg-white/4 border px-4 py-2',
              'font-jetbrains text-xs text-slate-400'
            )}
          >
            <skill.icon className="h-3.5 w-3.5 shrink-0" style={{ color: skill.color }} />
            <span>{skill.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// =============================================================================
// Main SkillsSection
// =============================================================================

export function SkillsSection() {
  const t = useTranslations('skills')
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  // Group skills by category
  const skillsByCategory = SKILL_CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat.id] = SKILLS.filter((s) => s.category === cat.id)
    return acc
  }, {})

  const featuredSkills = SKILLS.filter((s) => s.isFeatured)

  return (
    <section
      ref={ref}
      id="skills"
      className="relative overflow-hidden py-24 lg:py-32"
      aria-label="Skills and technologies"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/5 blur-[130px]" />
        <div className="bg-cyan-500/4 absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ─────────────────────────────────────────────────────────
            Section header
            ───────────────────────────────────────────────────────── */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="mb-14"
        >
          {/* Label */}
          <motion.div variants={headerVariants} className="mb-4 inline-flex items-center gap-2">
            <span className="font-jetbrains text-xs font-medium uppercase tracking-[0.18em] text-cyan-400">
              <span className="opacity-50">// </span>
              {t('section_label')}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={headerVariants}
            className="mb-3 max-w-xl font-syne font-black leading-tight tracking-tight text-white"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            {t('title')} <span className="text-gradient">{t('title_highlight')}</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={headerVariants}
            className="max-w-lg text-base leading-relaxed text-slate-400"
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────
            Featured skills marquee
            ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <FeaturedStrip skills={featuredSkills} />
        </motion.div>

        {/* ─────────────────────────────────────────────────────────
            Skills grouped by category
            ───────────────────────────────────────────────────────── */}
        <div className="mb-12 space-y-10">
          {SKILL_CATEGORIES.map((category, i) => {
            const skills = skillsByCategory[category.id] ?? []
            return (
              <CategoryGroup
                key={category.id}
                category={category}
                skills={skills}
                isInView={isInView}
                index={i}
              />
            )
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────
            Proficiency legend
            ───────────────────────────────────────────────────────── */}
        <ProficiencyLegend />

        {/* ─────────────────────────────────────────────────────────
            Summary stats row
            ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
          role="list"
          aria-label="Skills summary"
        >
          {[
            { label: 'Total Skills', value: SKILLS.length, color: 'text-cyan-400' },
            {
              label: 'Featured',
              value: SKILLS.filter((s) => s.isFeatured).length,
              color: 'text-amber-400',
            },
            {
              label: 'Expert Level',
              value: SKILLS.filter((s) => s.level === 5).length,
              color: 'text-violet-400',
            },
            { label: 'Categories', value: SKILL_CATEGORIES.length, color: 'text-emerald-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                'border-white/6 flex flex-col items-center gap-1 rounded-xl border',
                'bg-white/[0.02] px-4 py-4 text-center',
                'transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.04]'
              )}
              role="listitem"
            >
              <span className={cn('font-syne text-2xl font-black', stat.color)}>{stat.value}</span>
              <span className="font-jetbrains text-[10px] uppercase tracking-widest text-slate-600">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default SkillsSection
