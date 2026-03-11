'use client'

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiSend,
  FiUser,
} from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'

import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface SocialLink {
  id: string
  label: string
  handle: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  hoverColor: string
}

// =============================================================================
// Constants
// =============================================================================

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    handle: process.env.NEXT_PUBLIC_GITHUB_USERNAME
      ? `@${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`
      : '@username',
    href: process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com',
    icon: FiGithub,
    color: 'text-slate-400',
    hoverColor: 'hover:text-white hover:border-white/20 hover:bg-white/8',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'Connect with me',
    href: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? 'https://linkedin.com',
    icon: FiLinkedin,
    color: 'text-slate-400',
    hoverColor: 'hover:text-[#0a66c2] hover:border-[#0a66c2]/30 hover:bg-[#0a66c2]/8',
  },

  {
    id: 'instagram',
    label: 'Instagram',
    handle: 'Follow my work',
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://instagram.com',
    icon: FiInstagram,
    color: 'text-slate-400',
    hoverColor: 'hover:text-[#e1306c] hover:border-[#e1306c]/30 hover:bg-[#e1306c]/8',
  },
]

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
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

const slideLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const slideRight = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

// =============================================================================
// Form field component
// =============================================================================

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 font-jetbrains text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
        {required && (
          <span className="text-cyan-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className="flex items-center gap-1.5 font-jetbrains text-[11px] text-red-400"
          >
            <FiAlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// Input / Textarea shared style
// =============================================================================

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-xl px-4 py-3 text-sm font-medium',
    'bg-white/4 border transition-all duration-200 outline-none',
    'text-slate-200 placeholder:text-slate-600',
    'focus:bg-white/6',
    hasError
      ? 'border-red-500/40 focus:border-red-400/60 focus:ring-2 focus:ring-red-500/15'
      : 'border-white/8 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10'
  )
}

// =============================================================================
// Success state
// =============================================================================

function SuccessState({ onReset, message }: { onReset: () => void; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-6 py-12 text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full',
          'border-2 border-emerald-500/40 bg-emerald-500/10',
          'shadow-[0_0_40px_rgba(16,185,129,0.2)]'
        )}
      >
        <FiCheckCircle className="h-9 w-9 text-emerald-400" />
      </motion.div>

      <div>
        <h3 className="mb-2 font-syne text-xl font-bold text-white">Message Sent!</h3>
        <p className="max-w-xs text-sm leading-relaxed text-slate-400">{message}</p>
      </div>

      <button
        onClick={onReset}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5',
          'px-6 py-2.5 text-sm font-semibold text-slate-400',
          'transition-all duration-200 hover:border-cyan-500/25 hover:text-cyan-300'
        )}
      >
        Send another message
      </button>
    </motion.div>
  )
}

// =============================================================================
// Error state banner
// =============================================================================

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'bg-red-500/8 flex items-start gap-3 rounded-xl border border-red-500/20 px-4 py-3'
      )}
      role="alert"
    >
      <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <p className="flex-1 text-sm text-red-300">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="text-red-400/60 transition-colors hover:text-red-300"
      >
        ×
      </button>
    </motion.div>
  )
}

// =============================================================================
// Contact form
// =============================================================================

function ContactForm() {
  const t = useTranslations('contact.form')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({ mode: 'onTouched' })

  const onSubmit = async (data: ContactFormData) => {
    setStatus('submitting')
    setErrorMsg('')

    try {
      // Simulate API call — replace with your actual endpoint (Resend, EmailJS, etc.)
      await new Promise<void>((resolve, reject) =>
        setTimeout(() => {
          // Simulate 95% success rate in dev
          if (Math.random() > 0.05) {
            resolve()
          } else {
            reject(new Error('Network error'))
          }
        }, 1500)
      )

      // In production you'd do:
      // const res = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
      // if (!res.ok) throw new Error(await res.text())

      console.log('Form submission (demo):', data)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : t('error_message'))
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setErrorMsg('')
    reset()
  }

  return (
    <div
      className={cn(
        'border-white/8 relative overflow-hidden rounded-2xl border',
        'bg-white/[0.02] p-6 backdrop-blur-sm sm:p-8'
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
        aria-hidden="true"
      />

      {/* Form header */}
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
          <FiMessageSquare className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-syne text-base font-bold text-slate-200">{t('title')}</h3>
          <p className="font-jetbrains text-[11px] text-slate-600">I reply within 24–48 hours</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <SuccessState key="success" onReset={handleReset} message={t('success_message')} />
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
            aria-label="Contact form"
          >
            {/* Error banner */}
            <AnimatePresence>
              {status === 'error' && errorMsg && (
                <ErrorBanner
                  key="error-banner"
                  message={errorMsg}
                  onDismiss={() => {
                    setStatus('idle')
                    setErrorMsg('')
                  }}
                />
              )}
            </AnimatePresence>

            {/* Name + Email — side by side on sm+ */}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('name_label')} error={errors.name?.message} required>
                <div className="relative">
                  <FiUser className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                  <input
                    {...register('name', {
                      required: t('required'),
                      minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                      maxLength: { value: 80, message: 'Name must be under 80 characters.' },
                    })}
                    type="text"
                    placeholder={t('name_placeholder')}
                    autoComplete="name"
                    className={cn(inputClass(!!errors.name), 'pl-10')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                </div>
              </Field>

              <Field label={t('email_label')} error={errors.email?.message} required>
                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                  <input
                    {...register('email', {
                      required: t('required'),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t('invalid_email'),
                      },
                    })}
                    type="email"
                    placeholder={t('email_placeholder')}
                    autoComplete="email"
                    className={cn(inputClass(!!errors.email), 'pl-10')}
                    aria-invalid={!!errors.email}
                  />
                </div>
              </Field>
            </div>

            {/* Subject */}
            <Field label={t('subject_label')} error={errors.subject?.message} required>
              <input
                {...register('subject', {
                  required: t('required'),
                  minLength: { value: 4, message: 'Subject must be at least 4 characters.' },
                  maxLength: { value: 120, message: 'Subject must be under 120 characters.' },
                })}
                type="text"
                placeholder={t('subject_placeholder')}
                className={inputClass(!!errors.subject)}
                aria-invalid={!!errors.subject}
              />
            </Field>

            {/* Message */}
            <Field label={t('message_label')} error={errors.message?.message} required>
              <textarea
                {...register('message', {
                  required: t('required'),
                  minLength: { value: 10, message: t('min_length') },
                  maxLength: { value: 1000, message: t('max_length') },
                })}
                rows={5}
                placeholder={t('message_placeholder')}
                className={cn(inputClass(!!errors.message), 'resize-none leading-relaxed')}
                aria-invalid={!!errors.message}
              />
            </Field>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={status === 'submitting'}
              whileHover={status !== 'submitting' ? { scale: 1.01, y: -1 } : {}}
              whileTap={status !== 'submitting' ? { scale: 0.99 } : {}}
              className={cn(
                'relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold',
                'inline-flex items-center justify-center gap-2.5',
                'bg-gradient-to-r from-cyan-500 to-violet-600',
                'text-[#050816]',
                'shadow-lg shadow-cyan-500/20',
                'transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]',
                status === 'submitting' && 'cursor-not-allowed opacity-80'
              )}
              aria-busy={status === 'submitting'}
            >
              {/* shimmer sweep */}
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 hover:translate-x-full"
                aria-hidden="true"
              />

              {status === 'submitting' ? (
                <>
                  <FiLoader className="relative h-4 w-4 animate-spin" aria-hidden="true" />
                  <span className="relative">{t('submitting')}</span>
                </>
              ) : (
                <>
                  <FiSend className="relative h-4 w-4" aria-hidden="true" />
                  <span className="relative">{t('submit')}</span>
                </>
              )}
            </motion.button>

            {/* Privacy note */}
            <p className="text-center font-jetbrains text-[11px] text-slate-700">
              Your information is never shared with third parties.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// Social link card
// =============================================================================

function SocialCard({
  link,
  index,
  isInView,
}: {
  link: SocialLink
  index: number
  isInView: boolean
}) {
  const isEmail = link.href.startsWith('mailto:')

  return (
    <motion.a
      href={link.href}
      target={isEmail ? undefined : '_blank'}
      rel={isEmail ? undefined : 'noopener noreferrer'}
      aria-label={`Visit ${link.label}`}
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{
        duration: 0.45,
        delay: 0.1 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ x: 4 }}
      className={cn(
        'border-white/6 group flex items-center gap-4 rounded-xl border bg-white/[0.02] p-4',
        'duration-250 transition-all',
        link.hoverColor,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          'border-white/8 border bg-white/5',
          'duration-250 group-hover:border-current/20 group-hover:bg-current/8 transition-all'
        )}
      >
        <link.icon
          className={cn(
            'h-4.5 w-4.5 transition-colors duration-200',
            link.color,
            'group-hover:text-current'
          )}
        />
      </div>

      {/* Labels */}
      <div className="min-w-0 flex-1">
        <p className="font-syne text-sm font-semibold text-slate-300 transition-colors duration-200 group-hover:text-current">
          {link.label}
        </p>
        <p className="group-hover:text-current/70 truncate font-jetbrains text-[11px] text-slate-600 transition-colors duration-200">
          {link.handle}
        </p>
      </div>

      {/* Arrow */}
      <motion.span
        className="shrink-0 text-slate-700 transition-colors duration-200 group-hover:text-current"
        initial={{ x: 0 }}
        whileHover={{ x: 3 }}
      >
        →
      </motion.span>
    </motion.a>
  )
}

// =============================================================================
// Info card (email / location)
// =============================================================================

function InfoCard({
  icon: Icon,
  label,
  value,
  href,
  color,
  isInView,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  href?: string
  color: string
  isInView: boolean
  delay?: number
}) {
  const Wrapper = href ? 'a' : 'div'
  const props = href
    ? { href, target: href.startsWith('mailto') ? undefined : '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.5, delay: delay ?? 0, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* @ts-ignore — dynamic wrapper */}
      <Wrapper
        {...props}
        className={cn(
          'border-white/6 group flex items-center gap-3 rounded-xl border bg-white/[0.02] px-4 py-3.5',
          href &&
            'hover:border-white/12 cursor-pointer transition-all duration-200 hover:bg-white/[0.04]'
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            'border-white/8 border bg-white/5',
            color
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-jetbrains text-[10px] uppercase tracking-widest text-slate-600">
            {label}
          </p>
          <p className="truncate font-syne text-sm font-semibold text-slate-300 transition-colors group-hover:text-white">
            {value}
          </p>
        </div>
      </Wrapper>
    </motion.div>
  )
}

// =============================================================================
// Decorative background nodes
// =============================================================================

function BackgroundNodes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Primary glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[130px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="bg-violet-600/8 absolute -left-24 bottom-1/3 h-[500px] w-[500px] rounded-full blur-[110px]"
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,245,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        }}
      />
    </div>
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
// Main ContactSection
// =============================================================================

export function ContactSection() {
  const t = useTranslations('contact')
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@example.com'

  return (
    <section
      ref={ref}
      id="contact"
      className="relative overflow-hidden py-24 lg:py-32"
      aria-label="Contact section"
    >
      <BackgroundNodes />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* ─────────────────────────────────────────────────────────────
              Section header
              ───────────────────────────────────────────────────────────── */}
          <div className="mb-14 max-w-2xl">
            <motion.div variants={itemVariants}>
              <SectionLabel text={t('section_label')} />
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mb-4 font-syne font-black leading-tight tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
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
            </motion.h2>

            <motion.p variants={itemVariants} className="text-base leading-relaxed text-slate-400">
              {t('subtitle')}
            </motion.p>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              Two-column layout: left = info, right = form
              ───────────────────────────────────────────────────────────── */}
          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-14">
            {/* ── LEFT — contact info + socials (2 out of 5 cols) ── */}
            <motion.div
              variants={slideLeft}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex flex-col gap-8 lg:col-span-2"
            >
              {/* Availability badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'inline-flex w-fit items-center gap-2.5 rounded-xl',
                  'bg-emerald-500/6 border border-emerald-500/20 px-4 py-2.5'
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-jetbrains text-[12px] font-semibold text-emerald-400">
                  {t('availability')}
                </span>
              </motion.div>

              {/* Availability detail text */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm leading-relaxed text-slate-500"
              >
                {t('availability_detail')}
              </motion.p>

              {/* Email + location info cards */}
              <div className="space-y-3">
                <InfoCard
                  icon={FiMail}
                  label={t('email_cta')}
                  value={email}
                  href={`mailto:${email}`}
                  color="text-cyan-400"
                  isInView={isInView}
                  delay={0.28}
                />
                <InfoCard
                  icon={FiMapPin}
                  label="Location"
                  value="Malang, Indonesia"
                  color="text-violet-400"
                  isInView={isInView}
                  delay={0.34}
                />
              </div>

              {/* Divider */}
              <div
                className="via-white/8 h-px w-full bg-gradient-to-r from-transparent to-transparent"
                aria-hidden="true"
              />

              {/* Social links */}
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mb-4 font-jetbrains text-[11px] font-semibold uppercase tracking-widest text-slate-600"
                >
                  {t('socials_title')}
                </motion.p>

                <div className="space-y-2.5" role="list" aria-label="Social media links">
                  {SOCIAL_LINKS.map((link, i) => (
                    <SocialCard key={link.id} link={link} index={i} isInView={isInView} />
                  ))}
                </div>
              </div>

              {/* Fun quote */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.65, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'border-white/6 rounded-xl border bg-white/[0.02] px-4 py-4',
                  'relative overflow-hidden'
                )}
              >
                {/* Quote mark */}
                <span
                  className="pointer-events-none absolute -left-1 -top-3 select-none font-syne text-7xl font-black text-cyan-500/10"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="relative font-jetbrains text-[12px] italic leading-relaxed text-slate-500">
                  The best way to predict the future is to invent it.
                </p>
                <p className="mt-2 font-jetbrains text-[11px] text-slate-700">— Alan Kay</p>
              </motion.div>
            </motion.div>

            {/* ── RIGHT — contact form (3 out of 5 cols) ── */}
            <motion.div
              variants={slideRight}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="lg:col-span-3"
            >
              <ContactForm />

              {/* Reassurance strip below form */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 flex flex-wrap items-center justify-center gap-5"
              >
                {[
                  { icon: HiOutlineSparkles, text: 'No spam, ever' },
                  { icon: FiMail, text: 'Reply within 48h' },
                  { icon: FiCheckCircle, text: 'Always confidential' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-1.5 text-slate-600">
                    <item.icon className="h-3.5 w-3.5 text-cyan-500/60" />
                    <span className="font-jetbrains text-[11px]">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection
