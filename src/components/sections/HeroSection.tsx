'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, useCallback } from 'react'
import { FiGithub, FiArrowRight, FiDownload, FiMapPin, FiCircle } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'

import type { SupportedLocale } from '@/i18n/request'
import { cn, prefersReducedMotion } from '@/lib/utils'

// =============================================================================
// Lazy-load Three.js components — MUST be ssr: false to avoid SSR errors
// =============================================================================

const SceneCanvas = dynamic(
  () => import('@/components/three/SceneCanvas').then((m) => m.SceneCanvas),
  { ssr: false }
)

const ParticleField = dynamic(
  () => import('@/components/three/ParticleField').then((m) => m.ParticleField),
  { ssr: false }
)

const FloatingGeometry = dynamic(
  () => import('@/components/three/FloatingGeometry').then((m) => m.FloatingGeometry),
  { ssr: false }
)

// =============================================================================
// Types
// =============================================================================

interface HeroSectionProps {
  locale: SupportedLocale
}

// =============================================================================
// Typewriter hook
// =============================================================================

function useTypewriter(
  words: string[],
  options: {
    typeSpeed?: number
    deleteSpeed?: number
    pauseMs?: number
    loop?: boolean
    enabled?: boolean
  } = {}
) {
  const { typeSpeed = 75, deleteSpeed = 40, pauseMs = 2200, loop = true, enabled = true } = options

  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!enabled || words.length === 0) {
      setDisplayText(words[0] ?? '')
      return
    }

    const currentWord = words[wordIndex % words.length]

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseMs)
      return () => clearTimeout(timer)
    }

    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false)
        setWordIndex((i) => (loop ? (i + 1) % words.length : Math.min(i + 1, words.length - 1)))
        return
      }
      const timer = setTimeout(() => {
        setDisplayText((t) => t.slice(0, -1))
      }, deleteSpeed)
      return () => clearTimeout(timer)
    }

    // Typing
    if (displayText === currentWord) {
      // Finished typing current word — pause before deleting
      if (!loop && wordIndex === words.length - 1) {
        return
      } // stop at last word
      setIsPaused(true)
      return
    }

    const timer = setTimeout(() => {
      setDisplayText(currentWord.slice(0, displayText.length + 1))
    }, typeSpeed)
    return () => clearTimeout(timer)
  }, [
    displayText,
    wordIndex,
    isDeleting,
    isPaused,
    words,
    typeSpeed,
    deleteSpeed,
    pauseMs,
    loop,
    enabled,
  ])

  return { displayText, isTyping: !isPaused && !isDeleting }
}

// =============================================================================
// Animated counter (for stats)
// =============================================================================

function AnimatedStat({
  value,
  label,
  suffix = '+',
}: {
  value: number
  label: string
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1400
          const start = performance.now()
          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * value))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) {
      observer.observe(ref.current)
    }
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="flex flex-col items-center gap-0.5">
      <span className="font-syne text-2xl font-bold text-white">
        {count}
        <span className="text-cyan-400">{suffix}</span>
      </span>
      <span className="font-jetbrains text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </span>
    </div>
  )
}

// =============================================================================
// Floating badge (availability / location)
// =============================================================================

function FloatingBadge({
  icon: Icon,
  text,
  color = 'cyan',
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>
  text: string
  color?: 'cyan' | 'emerald' | 'violet'
  delay?: number
}) {
  const colorMap = {
    cyan: 'border-cyan-500/20 bg-cyan-500/8 text-cyan-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400',
    violet: 'border-violet-500/20 bg-violet-500/8 text-violet-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5',
        'font-jetbrains text-[11px] font-medium',
        colorMap[color]
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{text}</span>
    </motion.div>
  )
}

// =============================================================================
// Scroll indicator
// =============================================================================

function ScrollIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.8 }}
      className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      aria-hidden="true"
    >
      <span className="font-jetbrains text-[10px] uppercase tracking-[0.2em] text-slate-600">
        {label}
      </span>
      <motion.div className="flex h-9 w-5 items-start justify-center rounded-full border border-slate-700/60 p-1">
        <motion.span
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="h-1.5 w-1 rounded-full bg-cyan-400/80"
        />
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// Background grid decoration
// =============================================================================

function GridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.025]"
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,245,255,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.4) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
      }}
    />
  )
}

// =============================================================================
// Corner decoration SVG
// =============================================================================

function CornerAccent({ position }: { position: 'tl' | 'br' }) {
  const isTL = position === 'tl'
  return (
    <div
      className={cn(
        'pointer-events-none absolute opacity-20',
        isTL ? 'left-8 top-24' : 'bottom-16 right-8'
      )}
      aria-hidden="true"
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        style={{ transform: isTL ? 'none' : 'rotate(180deg)' }}
      >
        <path
          d="M4 76 L4 4 L76 4"
          stroke="url(#cornerGrad)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M14 76 L14 14 L76 14"
          stroke="url(#cornerGrad)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />
        <defs>
          <linearGradient
            id="cornerGrad"
            x1="4"
            y1="4"
            x2="76"
            y2="76"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00f5ff" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// =============================================================================
// Glow orb background blobs
// =============================================================================

function GlowOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="bg-violet-600/12 absolute -right-24 top-1/3 h-[500px] w-[500px] rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.06, 0.12, 0.06],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="bg-violet-500/8 absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full blur-[140px]"
      />
    </div>
  )
}

// =============================================================================
// Main HeroSection
// =============================================================================

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations('hero')
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll parallax
  const { scrollY } = useScroll()
  const contentY = useTransform(scrollY, [0, 600], [0, -80])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const scaleVal = useTransform(scrollY, [0, 600], [1, 0.94])

  // Scroll progress for 3D reactivity
  const [scrollProgress, setScrollProgress] = useState(0)
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (v) => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(h > 0 ? Math.min(v / h, 1) : 0)
    })
    return unsubscribe
  }, [scrollY])

  // Layout and motion preferences
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setReducedMotion(prefersReducedMotion())
    
    // Check if mobile for 3D placement
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Typewriter
  const typewriterWords: string[] = t.raw('typewriter') as string[]
  const { displayText, isTyping } = useTypewriter(typewriterWords, {
    typeSpeed: 65,
    deleteSpeed: 35,
    pauseMs: 2400,
    loop: true,
    enabled: !reducedMotion,
  })

  // Mouse spotlight
  const spotlightRef = useRef<HTMLDivElement>(null)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!spotlightRef.current) {
      return
    }
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    spotlightRef.current.style.setProperty('--mouse-x', `${x}%`)
    spotlightRef.current.style.setProperty('--mouse-y', `${y}%`)
  }, [])

  // ==========================================================================
  // Animation variants
  // ==========================================================================

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const codeLineVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* ----------------------------------------------------------------
          Background layers
          ---------------------------------------------------------------- */}

      {/* CSS gradient blobs */}
      <GlowOrbs />

      {/* Subtle grid */}
      <GridBackground />

      {/* Mouse-tracking spotlight */}
      <div ref={spotlightRef} className="spotlight" aria-hidden="true" />

      {/* Corner accents */}
      <CornerAccent position="tl" />
      <CornerAccent position="br" />

      {/* ----------------------------------------------------------------
          Three.js scene (lazy-loaded, SSR-safe)
          ---------------------------------------------------------------- */}
      <div
        className="three-canvas-wrapper pointer-events-none absolute inset-0"
        aria-label={t('scroll_hint')}
        role="img"
        aria-hidden="true"
      >
        <SceneCanvas
          fov={55}
          cameraPosition={[0, 0, 6]}
          dprRange={[1, 1.5]}
          alpha
          eventSource="none"
        >
          {/* Ambient + hemisphere lights */}
          <ambientLight intensity={0.15} />
          <hemisphereLight args={['#00f5ff', '#7c3aed', 0.3]} />

          {/* 3 000+ particle cloud */}
          <ParticleField
            count={3200}
            spread={22}
            size={0.014}
            color="#00f5ff"
            colorSecondary="#7c3aed"
            speed={0.012}
            scrollProgress={scrollProgress}
            mouseParallax
            depth={10}
          />

          {/* Floating geometry — responsive position */}
          <FloatingGeometry
            variant="torusKnot"
            position={isMobile ? [0, -2, -3] : [2.8, 0.2, -0.5]}
            scale={isMobile ? 0.5 : 0.9}
            wireframe={false}
            withGhost
            color="#00f5ff"
            emissiveIntensity={0.7}
            scrollProgress={scrollProgress}
          />
        </SceneCanvas>
      </div>

      {/* ----------------------------------------------------------------
          Main content — constrained container
          ---------------------------------------------------------------- */}
      <motion.div
        style={reducedMotion ? {} : { y: contentY, opacity, scale: scaleVal }}
        className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex min-h-screen flex-col items-start justify-center py-32 lg:h-screen lg:min-h-0 lg:py-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            {/* -------- Availability + location badges -------- */}
            <motion.div variants={itemVariants} className="mb-7 flex flex-wrap gap-2.5">
              <FloatingBadge icon={FiCircle} text={t('available')} color="emerald" delay={0.4} />
              <FloatingBadge icon={FiMapPin} text={t('location')} color="cyan" delay={0.5} />
            </motion.div>

            {/* -------- Greeting -------- */}
            <motion.div variants={itemVariants}>
              <p className="mb-2 font-jetbrains text-sm font-medium tracking-wider text-cyan-400/80">
                <span className="opacity-50">// </span>
                {t('greeting')}
              </p>
            </motion.div>

            {/* -------- Name headline -------- */}
            <motion.div variants={itemVariants}>
              <h1 className="mb-4 font-syne leading-none tracking-tight">
                <span
                  className="block text-[clamp(3rem,8vw,6rem)] font-black text-white"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {t('name')}
                </span>
              </h1>
            </motion.div>

            {/* -------- Typewriter role -------- */}
            <motion.div variants={itemVariants} className="mb-6 flex items-center">
              <div
                className="border-white/8 bg-white/4 inline-flex items-center gap-0 rounded-xl border px-4 py-2.5"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text font-jetbrains text-xl font-semibold text-transparent md:text-2xl">
                  {reducedMotion ? typewriterWords[0] : displayText}
                </span>
                {/* Blinking cursor */}
                {!reducedMotion && (
                  <AnimatePresence>
                    <motion.span
                      key="cursor"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1.0, repeat: Infinity, ease: 'linear' }}
                      className="ml-0.5 inline-block h-6 w-0.5 rounded-full bg-cyan-400 align-middle"
                      aria-hidden="true"
                    />
                  </AnimatePresence>
                )}
              </div>
            </motion.div>

            {/* -------- Tagline -------- */}
            <motion.div variants={itemVariants}>
              <p className="mb-10 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                {t('tagline')}
              </p>
            </motion.div>

            {/* -------- CTA Buttons -------- */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              {/* Primary: View Projects */}
              <Link
                href={`/${locale}/projects`}
                className={cn(
                  'group relative inline-flex items-center gap-2.5 overflow-hidden',
                  'rounded-xl px-6 py-3.5 text-sm font-bold',
                  'bg-gradient-to-r from-cyan-500 to-violet-600',
                  'text-[#050816]',
                  'shadow-lg shadow-cyan-500/25',
                  'transition-all duration-300',
                  'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/35 hover:brightness-110',
                  'active:translate-y-0 active:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'
                )}
              >
                {/* Shimmer overlay */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  aria-hidden="true"
                />
                <HiSparkles className="relative h-4 w-4" />
                <span className="relative">{t('cta_projects')}</span>
                <FiArrowRight className="relative h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Secondary: GitHub */}
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com'}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group inline-flex items-center gap-2.5',
                  'rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold',
                  'text-slate-300 backdrop-blur-sm',
                  'transition-all duration-300',
                  'hover:bg-cyan-500/8 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:text-cyan-300',
                  'hover:shadow-lg hover:shadow-cyan-500/10',
                  'active:translate-y-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'
                )}
              >
                <FiGithub className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                <span>{t('cta_github')}</span>
              </a>

              {/* Tertiary: Resume (subtle) */}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-2',
                  'rounded-xl px-4 py-3.5 text-sm font-medium',
                  'text-slate-500',
                  'transition-all duration-200',
                  'hover:text-slate-300',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20'
                )}
              >
                <FiDownload className="h-3.5 w-3.5" />
                <span>{t('cta_resume')}</span>
              </a>
            </motion.div>

            {/* -------- Quick stats -------- */}
            <motion.div
              variants={itemVariants}
              className="border-white/6 mt-14 flex items-center gap-8 border-t pt-8 sm:gap-12"
            >
              <AnimatedStat value={10} label="Projects" suffix="+" />
              <div className="bg-white/8 h-10 w-px" aria-hidden="true" />
              <AnimatedStat value={3} label="Years Exp" suffix="+" />
              <div className="bg-white/8 h-10 w-px" aria-hidden="true" />
              <AnimatedStat value={100} label="Commits" suffix="k+" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* ----------------------------------------------------------------
          Decorative code snippet — bottom-right, desktop only
          ---------------------------------------------------------------- */}
      <motion.div
        variants={codeLineVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.4 }}
        className="pointer-events-none absolute bottom-32 right-8 hidden xl:block"
        aria-hidden="true"
      >
        <div className="border-white/6 rounded-xl border bg-[#0d1117]/80 px-5 py-4 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 font-jetbrains text-[10px] text-slate-600">portfolio.ts</span>
          </div>
          <pre className="font-jetbrains text-[11px] leading-relaxed">
            <code>
              <span className="text-violet-400">const</span>
              <span className="text-white"> dev </span>
              <span className="text-cyan-400">=</span>
              <span className="text-white"> {`{`}</span>
              {'\n'}
              <span className="text-slate-500"> </span>
              <span className="text-cyan-300"> name</span>
              <span className="text-white">: </span>
              <span className="text-green-400">&quot;{t('name')}&quot;</span>
              <span className="text-white">,</span>
              {'\n'}
              <span className="text-cyan-300"> focus</span>
              <span className="text-white">: </span>
              <span className="text-green-400">&quot;Full-Stack&quot;</span>
              <span className="text-white">,</span>
              {'\n'}
              <span className="text-cyan-300"> status</span>
              <span className="text-white">: </span>
              <span className="text-yellow-400">&quot;available&quot;</span>
              {'\n'}
              <span className="text-white">{`}`}</span>
              <span className="text-cyan-400">;</span>
            </code>
          </pre>
        </div>
      </motion.div>

      {/* ----------------------------------------------------------------
          Scroll indicator
          ---------------------------------------------------------------- */}
      <ScrollIndicator label={t('scroll_hint')} />

      {/* ----------------------------------------------------------------
          Bottom gradient fade into next section
          ---------------------------------------------------------------- */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050816] to-transparent"
        aria-hidden="true"
      />
    </section>
  )
}

export default HeroSection
