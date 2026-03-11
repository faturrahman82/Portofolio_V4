'use client'

import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import {
  FiMail,
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FiMapPin,
  FiClock,
  FiMessageSquare,
} from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'

import { ContactSection } from '@/components/sections/ContactSection'
import { SectionLabel } from '@/components/ui/atoms/SectionLabel'
import { GradientDivider } from '@/components/ui/atoms/GradientDivider'
import { QuickInfoCard, type QuickInfoItem } from '@/components/ui/molecules/QuickInfoCard'
import { FaqItem, type FaqItemType } from '@/components/ui/molecules/FaqItem'
import { AvailabilityBanner } from '@/components/ui/molecules/AvailabilityBanner'
import { ContactHeroVisual } from '@/components/ui/organisms/ContactHeroVisual'
import { locales, type SupportedLocale } from '@/i18n/request'

// =============================================================================
// Types
// =============================================================================

// =============================================================================
// Data
// =============================================================================

const FAQ_ITEMS: FaqItemType[] = [
  {
    question: 'What types of projects do you take on?',
    answer:
      "I work on a wide range of projects — from full SaaS products and dashboards to marketing sites, e-commerce, and creative experiments. If it involves TypeScript and the web, I'm likely interested.",
  },
  {
    question: 'What is your typical response time?',
    answer:
      'I reply to all messages within 24–48 hours on weekdays. For urgent inquiries, feel free to reach out on LinkedIn as well.',
  },
  {
    question: 'Are you available for freelance work?',
    answer:
      "Yes! I'm currently open to freelance contracts, part-time consulting, and full-time opportunities. Let's discuss what you have in mind.",
  },
  {
    question: 'Do you work with international clients?',
    answer:
      "Absolutely. I've worked with clients across Asia, Europe, and North America. I'm comfortable with remote collaboration across time zones.",
  },
  {
    question: 'Can you help with an existing codebase?',
    answer:
      'Yes, I enjoy code reviews, refactoring sessions, and joining ongoing projects. I can quickly get up to speed with your existing stack.',
  },
]

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
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}



// =============================================================================
// Main Contact Page
// =============================================================================

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {


  const t = useTranslations('contact')

  // Refs for intersection observer
  const heroRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const heroInView = useInView(heroRef, { once: true, margin: '-60px' })
  const infoInView = useInView(infoRef, { once: true, margin: '-60px' })
  const faqInView = useInView(faqRef, { once: true, margin: '-60px' })
  const ctaInView = useInView(ctaRef, { once: true, margin: '-60px' })

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com'
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? 'https://linkedin.com'
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com'

  const quickInfoItems: QuickInfoItem[] = [
    {
      icon: FiMail,
      label: 'Email',
      value: email,
      href: `mailto:${email}`,
      color: 'text-cyan-400',
    },
    {
      icon: FiGithub,
      label: 'GitHub',
      value: `@${process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? 'username'}`,
      href: githubUrl,
      color: 'text-slate-300',
    },
    {
      icon: FiLinkedin,
      label: 'LinkedIn',
      value: 'Connect with me',
      href: linkedinUrl,
      color: 'text-[#0a66c2]',
    },
    {
      icon: FiInstagram,
      label: 'Instagram',
      value: 'Follow my work',
      href: instagramUrl,
      color: 'text-[#e1306c]',
    },
    {
      icon: FiMapPin,
      label: 'Location',
      value: 'Malang, Indonesia',
      color: 'text-violet-400',
    },
    {
      icon: FiClock,
      label: 'Timezone',
      value: 'UTC+7 — WIB',
      color: 'text-amber-400',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden pt-[72px]">
      {/* ── Background decorations ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[130px]" />
        <div className="absolute -left-24 bottom-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[110px]" />
        <div className="bg-violet-500/3 absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full blur-[140px]" />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,245,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ══ PAGE HERO ════════════════════════════════════════════════════════ */}
        <div ref={heroRef} className="py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: headline + intro */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={heroInView ? 'visible' : 'hidden'}
              className="max-w-xl"
            >
              {/* Label */}
              <motion.div variants={itemVariants}>
                <SectionLabel text={t('section_label')} />
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="mb-5 font-syne font-black leading-tight tracking-tight text-white"
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

              {/* Subtitle */}
              <motion.p
                variants={itemVariants}
                className="mb-8 text-base leading-relaxed text-slate-400"
              >
                {t('subtitle')}
              </motion.p>

              {/* Availability badge */}
              <motion.div variants={itemVariants}>
                <AvailabilityBanner isInView={heroInView} />
              </motion.div>

              {/* Quick action buttons */}
              <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${email}`}
                  className={[
                    'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold',
                    'bg-gradient-to-r from-cyan-500 to-violet-600 text-[#050816]',
                    'shadow-lg shadow-cyan-500/20 transition-all duration-300',
                    'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/30 hover:brightness-110',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  ].join(' ')}
                >
                  <FiMail className="h-4 w-4" aria-hidden="true" />
                  Email Me Directly
                </a>

                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5',
                    'px-6 py-3 text-sm font-semibold text-slate-300 backdrop-blur-sm',
                    'transition-all duration-300',
                    'hover:bg-[#0a66c2]/8 hover:-translate-y-0.5 hover:border-[#0a66c2]/30 hover:text-[#0a66c2]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a66c2]/50',
                  ].join(' ')}
                >
                  <FiLinkedin className="h-4 w-4" aria-hidden="true" />
                  LinkedIn
                </a>
              </motion.div>
            </motion.div>

            {/* Right: decorative visual */}
            <ContactHeroVisual isInView={heroInView} />
          </div>
        </div>

        <GradientDivider />

        {/* ══ QUICK INFO GRID ════════════════════════════════════════════════ */}
        <div ref={infoRef} className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <SectionLabel text="Find Me Online" />
            <h2 className="font-syne text-2xl font-black text-white md:text-3xl">
              All the ways to{' '}
              <span
                className="text-transparent"
                style={{
                  background: 'linear-gradient(135deg, #00f5ff 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                reach me
              </span>
            </h2>
          </motion.div>

          <div
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            aria-label="Contact information"
          >
            {quickInfoItems.map((item, i) => (
              <QuickInfoCard key={item.label} item={item} index={i} isInView={infoInView} />
            ))}
          </div>
        </div>

        <GradientDivider />

        {/* ══ CONTACT FORM (re-using the full ContactSection component) ══════ */}
        <ContactSection />

        <GradientDivider className="my-0" />

        {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
        <div ref={faqRef} className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 max-w-2xl"
          >
            <SectionLabel text="FAQ" />
            <h2 className="mb-3 font-syne text-2xl font-black text-white md:text-3xl">
              Common{' '}
              <span
                className="text-transparent"
                style={{
                  background: 'linear-gradient(135deg, #00f5ff 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                questions
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Some things people often ask before reaching out. If your question isn&apos;t listed,
              just send a message!
            </p>
          </motion.div>

          <div className="grid max-w-3xl gap-3" role="list" aria-label="Frequently asked questions">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} item={item} index={i} isInView={faqInView} />
            ))}
          </div>
        </div>

        <GradientDivider />

        {/* ══ CLOSING CTA ═══════════════════════════════════════════════════ */}
        <div ref={ctaRef} className="py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className={[
              'border-white/8 relative overflow-hidden rounded-3xl border p-10 text-center',
              'from-cyan-500/6 to-violet-600/6 bg-gradient-to-br via-[#090d1f]',
              'backdrop-blur-sm',
            ].join(' ')}
          >
            {/* Top accent line */}
            <div
              className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
              aria-hidden="true"
            />

            {/* Glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,245,255,0.06), transparent 70%)',
              }}
              aria-hidden="true"
            />

            {/* Sparkle icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={ctaInView ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="relative mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
            >
              <HiOutlineSparkles className="h-7 w-7 text-cyan-400" />
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-3 font-syne text-2xl font-black text-white md:text-3xl lg:text-4xl"
            >
              Don&apos;t be a stranger
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.32, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto mb-8 max-w-md text-sm leading-relaxed text-slate-400"
            >
              Whether it&apos;s a project, a question, or just a friendly hello — I read every
              message and reply personally.
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href={`mailto:${email}`}
                className={[
                  'group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl px-7 py-3.5',
                  'bg-gradient-to-r from-cyan-500 to-violet-600 text-sm font-bold text-[#050816]',
                  'shadow-lg shadow-cyan-500/25 transition-all duration-300',
                  'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/35 hover:brightness-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]',
                ].join(' ')}
              >
                {/* shimmer */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  aria-hidden="true"
                />
                <FiMail className="relative h-4 w-4" aria-hidden="true" />
                <span className="relative">Send a Message</span>
              </a>

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  'inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5',
                  'px-7 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm',
                  'transition-all duration-300',
                  'hover:bg-cyan-500/8 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:text-cyan-300',
                  'hover:shadow-lg hover:shadow-cyan-500/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50',
                ].join(' ')}
              >
                <FiGithub className="h-4 w-4" aria-hidden="true" />
                <span>GitHub</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
