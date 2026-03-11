'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import {
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FiMail,
  FiArrowUp,
  FiHeart,
  FiCode,
} from 'react-icons/fi'
import { SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si'

import type { SupportedLocale } from '@/i18n/request'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface FooterProps {
  locale: SupportedLocale
}

interface SocialLink {
  id: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

interface FooterNavLink {
  key: 'home' | 'projects' | 'about' | 'contact'
  href: string
}

interface TechBadge {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  href: string
}

// =============================================================================
// Constants
// =============================================================================

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'github',
    href: process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com',
    icon: FiGithub,
    label: 'GitHub',
  },
  {
    id: 'linkedin',
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? 'https://linkedin.com',
    icon: FiLinkedin,
    label: 'LinkedIn',
  },

  {
    id: 'instagram',
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com',
    icon: FiInstagram,
    label: 'Instagram',
  },
  {
    id: 'email',
    href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'}`,
    icon: FiMail,
    label: 'Email',
  },
]

const NAV_LINKS: FooterNavLink[] = [
  { key: 'home', href: '/' },
  { key: 'projects', href: '/projects' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
]

const TECH_STACK: TechBadge[] = [
  {
    id: 'nextjs',
    name: 'Next.js 14',
    icon: SiNextdotjs,
    color: '#ffffff',
    href: 'https://nextjs.org',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: SiTypescript,
    color: '#3178c6',
    href: 'https://www.typescriptlang.org',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    icon: SiTailwindcss,
    color: '#06b6d4',
    href: 'https://tailwindcss.com',
  },

]

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
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

// =============================================================================
// Sub-components
// =============================================================================

/** Animated "back to top" button */
function BackToTopButton({ label }: { label: string }) {
  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <motion.button
      onClick={handleClick}
      aria-label={label}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium',
        'border-white/8 bg-white/4 border text-slate-400',
        'hover:bg-cyan-500/8 transition-all duration-200 hover:border-cyan-500/25 hover:text-cyan-400'
      )}
    >
      <FiArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span>{label}</span>
    </motion.button>
  )
}

/** Social icon link */
function SocialIconLink({ link, ariaPrefix }: { link: SocialLink; ariaPrefix: string }) {
  const isEmail = link.href.startsWith('mailto:')

  return (
    <motion.a
      href={link.href}
      target={isEmail ? undefined : '_blank'}
      rel={isEmail ? undefined : 'noopener noreferrer'}
      aria-label={`${ariaPrefix} ${link.label}`}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg',
        'border-white/8 bg-white/4 border text-slate-500',
        'transition-all duration-200',
        'hover:bg-cyan-500/8 hover:border-cyan-500/25 hover:text-cyan-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50'
      )}
    >
      <link.icon className="h-4 w-4" />
    </motion.a>
  )
}

/** Tech stack pill */
function TechPill({ tech }: { tech: TechBadge }) {
  return (
    <a
      href={tech.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Built with ${tech.name}`}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-full px-3 py-1',
        'border-white/6 bg-white/3 border text-xs font-medium text-slate-500',
        'hover:border-white/12 hover:bg-white/6 transition-all duration-200 hover:text-slate-300'
      )}
    >
      <tech.icon className="h-3 w-3 transition-colors duration-200" style={{ color: tech.color }} />
      <span>{tech.name}</span>
    </a>
  )
}

/** Gradient divider */
function GradientDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent" />
    </div>
  )
}

// =============================================================================
// Main Footer
// =============================================================================

export function Footer({ locale }: FooterProps) {
  const t = useTranslations('footer')
  const tn = useTranslations('nav')

  const currentYear = new Date().getFullYear()
  const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME ?? 'Your Name'
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com'

  return (
    <footer
      className={cn(
        'border-white/6 relative mt-auto overflow-hidden border-t',
        'bg-gradient-to-b from-transparent to-[#050816]'
      )}
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="bg-cyan-500/4 absolute -bottom-24 left-1/4 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-violet-600/4 absolute -bottom-16 right-1/3 h-48 w-48 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ----------------------------------------------------------------
            Upper section — brand + nav + socials
            ---------------------------------------------------------------- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-10 py-14 md:grid-cols-12"
        >
          {/* Brand column */}
          <motion.div variants={itemVariants} className="md:col-span-5 lg:col-span-4">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="group mb-5 inline-flex items-center gap-3 outline-none"
              aria-label="Portfolio — go to home"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 ring-1 ring-white/10 transition-all duration-300 group-hover:from-cyan-500/30 group-hover:to-violet-600/30">
                <FiCode className="h-4 w-4 text-cyan-400" />
              </span>
              <span className="font-syne text-base font-bold text-slate-200 transition-colors duration-200 group-hover:text-white">
                Portfolio
                <span className="text-cyan-500">.</span>
              </span>
            </Link>

            {/* Tagline */}
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">{t('tagline')}</p>

            {/* Social links */}
            <div className="flex flex-wrap gap-2" aria-label={t('social_label')}>
              {SOCIAL_LINKS.map((link) => (
                <SocialIconLink key={link.id} link={link} ariaPrefix="Visit my profile on" />
              ))}
            </div>
          </motion.div>

          {/* Spacer */}
          <div className="hidden md:col-span-1 md:block lg:col-span-2" />

          {/* Navigation column */}
          <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-3">
            <h3 className="mb-4 font-jetbrains text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Navigation
            </h3>
            <nav aria-label={t('nav_label')}>
              <ul className="space-y-2.5">
                {NAV_LINKS.map((link) => {
                  const href = `/${locale}${link.href === '/' ? '' : link.href}`
                  return (
                    <li key={link.key}>
                      <Link
                        href={href}
                        className={cn(
                          'group inline-flex items-center gap-2 text-sm text-slate-500',
                          'transition-colors duration-200 hover:text-cyan-400'
                        )}
                      >
                        <span className="h-px w-3 bg-slate-700 transition-all duration-300 group-hover:w-5 group-hover:bg-cyan-500" />
                        {tn(link.key)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </motion.div>

          {/* Contact / CTA column */}
          <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-3">
            <h3 className="mb-4 font-jetbrains text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Get In Touch
            </h3>
            <div className="space-y-3">
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'}`}
                className={cn(
                  'group flex items-center gap-2.5 text-sm text-slate-500',
                  'transition-colors duration-200 hover:text-cyan-400'
                )}
              >
                <FiMail className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-colors duration-200 group-hover:text-cyan-400" />
                <span className="truncate">
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'}
                </span>
              </a>

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group flex items-center gap-2.5 text-sm text-slate-500',
                  'transition-colors duration-200 hover:text-cyan-400'
                )}
              >
                <FiGithub className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-colors duration-200 group-hover:text-cyan-400" />
                <span>@{process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'username'}</span>
              </a>

              {/* Open to work badge */}
              <div className="bg-emerald-500/8 mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-jetbrains text-[11px] font-medium text-emerald-400">
                  Available for work
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <GradientDivider />

        {/* ----------------------------------------------------------------
            Middle section — tech stack
            ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-2 py-5"
        >
          <span className="font-jetbrains text-[11px] uppercase tracking-widest text-slate-600">
            {t('made_with')}
          </span>
          <FiHeart className="h-3 w-3 text-rose-500/70" aria-hidden="true" />
          <span className="font-jetbrains text-[11px] uppercase tracking-widest text-slate-600">
            {t('and')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TECH_STACK.map((tech) => (
              <TechPill key={tech.id} tech={tech} />
            ))}
          </div>
        </motion.div>

        <GradientDivider />

        {/* ----------------------------------------------------------------
            Bottom bar — copyright + back to top
            ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row"
        >
          {/* Copyright */}
          <p className="font-jetbrains text-[11px] text-slate-600">
            &copy; {currentYear}{' '}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 transition-colors hover:text-slate-300"
            >
              {authorName}
            </a>
            <span className="mx-2 text-slate-700">&mdash;</span>
            {t('rights')}
          </p>

          {/* Back to top */}
          <BackToTopButton label={t('back_to_top')} />
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent"
        aria-hidden="true"
      />
    </footer>
  )
}

export default Footer
