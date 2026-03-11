'use client'

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiGlobe, FiMenu, FiMoon, FiSun, FiX } from 'react-icons/fi'
import {
  HiOutlineCode,
  HiOutlineHome,
  HiOutlineIdentification,
  HiOutlineMail,
} from 'react-icons/hi'

import { localeLabels, type SupportedLocale } from '@/i18n/request'
import { cn } from '@/lib/utils'
import {
  useIsMenuOpen,
  useMenuActions,
  useSetLocale,
  useSetTheme,
  useTheme,
  useUIStore,
} from '@/store/useUIStore'

// =============================================================================
// Types
// =============================================================================

interface NavLink {
  key: 'home' | 'projects' | 'about' | 'contact'
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// =============================================================================
// Constants
// =============================================================================

const NAV_LINKS: NavLink[] = [
  { key: 'home', href: '/', icon: HiOutlineHome },
  { key: 'projects', href: '/projects', icon: HiOutlineCode },
  { key: 'about', href: '/about', icon: HiOutlineIdentification },
  { key: 'contact', href: '/contact', icon: HiOutlineMail },
]

const SCROLL_THRESHOLD = 24

// =============================================================================
// Scroll progress bar
// =============================================================================

function ScrollProgressBar({ progress }: { progress: number }) {
  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX: progress,
        background: 'linear-gradient(90deg, #00f5ff 0%, #7c3aed 100%)',
        boxShadow: '0 0 8px rgba(0,245,255,0.6)',
      }}
    />
  )
}

// =============================================================================
// Desktop nav link
// =============================================================================

interface NavLinkItemProps {
  link: NavLink
  label: string
  isActive: boolean
  onClick?: () => void
}

function DesktopNavLink({ link, label, isActive, onClick }: NavLinkItemProps) {
  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium',
        'rounded-lg transition-colors duration-200',
        isActive ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-100'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative z-10 flex items-center gap-1.5">
        <link.icon
          className={cn(
            'h-3.5 w-3.5 transition-all duration-200',
            isActive ? 'text-cyan-500' : 'text-slate-500 group-hover:text-slate-300'
          )}
        />
        <span>{label}</span>
      </div>

      {/* Active indicator */}
      {isActive && (
        <span
          className="pointer-events-none absolute inset-0 z-0 rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20"
        />
      )}

      {/* Hover underline */}
      {!isActive && (
        <span className="pointer-events-none absolute bottom-0 left-3 right-3 z-0 h-px scale-x-0 bg-gradient-to-r from-cyan-500/60 to-violet-500/60 transition-transform duration-300 group-hover:scale-x-100" />
      )}
    </Link>
  )
}

// =============================================================================
// Mobile nav link
// =============================================================================

function MobileNavLink({
  link,
  label,
  isActive,
  index,
  onClick,
}: NavLinkItemProps & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Link
        href={link.href}
        onClick={onClick}
        className={cn(
          'flex items-center gap-4 rounded-xl px-4 py-3.5 text-base font-medium',
          'transition-all duration-200',
          isActive
            ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            isActive ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-slate-500'
          )}
        >
          <link.icon className="h-4.5 w-4.5" />
        </span>
        <span>{label}</span>

        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />}
      </Link>
    </motion.div>
  )
}

// =============================================================================
// Locale switcher dropdown
// =============================================================================

function LocaleSwitcher({ currentLocale }: { currentLocale: SupportedLocale }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const setLocale = useSetLocale()
  const t = useTranslations('nav')

  // Close on outside click
  useEffect(() => {
    if (!open) {
      return
    }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleLocaleChange = useCallback(
    (locale: SupportedLocale) => {
      setLocale(locale)
      setOpen(false)

      // Navigate to the same path in the new locale
      // Strip the current locale prefix and prepend the new one
      const segments = pathname.split('/')
      segments[1] = locale
      router.push(segments.join('/'))
    },
    [pathname, router, setLocale]
  )

  const locales: SupportedLocale[] = ['en', 'id']

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label={t('switch_language')}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium',
          'transition-all duration-200',
          open
            ? 'bg-white/10 text-slate-100'
            : 'hover:bg-white/8 text-slate-400 hover:text-slate-200'
        )}
      >
        <FiGlobe className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            aria-label="Select language"
            className={cn(
              'absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl',
              'border border-white/10 bg-[#0d1117]/95 shadow-xl',
              'backdrop-blur-xl'
            )}
          >
            {locales.map((locale) => {
              const info = localeLabels[locale]
              const isCurrent = locale === currentLocale

              return (
                <button
                  key={locale}
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => handleLocaleChange(locale)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors duration-150',
                    isCurrent
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'hover:bg-white/6 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <span className="text-base leading-none">{info.flag}</span>
                  <span className="font-medium">{info.native}</span>
                  {isCurrent && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// Theme toggle
// =============================================================================

function ThemeToggle() {
  const theme = useTheme()
  const setTheme = useSetTheme()
  const t = useTranslations('nav')

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={t('switch_theme')}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg',
        'text-slate-400 transition-all duration-200',
        'hover:bg-white/8 hover:text-slate-200'
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiMoon className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiSun className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// =============================================================================
// Logo / wordmark
// =============================================================================

function NavLogo({ locale }: { locale: string }) {
  return (
    <Link
      href={`/${locale}`}
      className="group flex items-center gap-2.5 outline-none"
      aria-label="Portfolio — go to home"
    >
      {/* Animated bracket logo */}
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 transition-all duration-300 group-hover:from-cyan-500/30 group-hover:to-violet-600/30" />
        <span className="relative font-jetbrains text-xs font-bold text-cyan-400">&lt;/&gt;</span>
      </span>

      <span className="hidden font-syne text-sm font-bold text-slate-200 transition-colors duration-200 group-hover:text-white sm:block">
        Portfolio
        <span className="ml-0.5 text-cyan-500">.</span>
      </span>
    </Link>
  )
}

// =============================================================================
// Mobile menu overlay
// =============================================================================

interface MobileMenuProps {
  isOpen: boolean
  locale: SupportedLocale
  pathname: string
  currentLocale: SupportedLocale
  onClose: () => void
}

function MobileMenu({ isOpen, locale, pathname, currentLocale, onClose }: MobileMenuProps) {
  const t = useTranslations('nav')
  const theme = useTheme()
  const setTheme = useSetTheme()
  const setLocale = useSetLocale()
  const router = useRouter()

  // Derived: strip locale from pathname for active comparison
  const activePath = pathname.replace(`/${locale}`, '') || '/'

  const handleLocaleChange = useCallback(
    (nextLocale: SupportedLocale) => {
      setLocale(nextLocale)
      const segments = pathname.split('/')
      segments[1] = nextLocale
      router.push(segments.join('/'))
      onClose()
    },
    [pathname, router, setLocale, onClose]
  )

  const locales: SupportedLocale[] = ['en', 'id']

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.nav
            key="mobile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={cn(
              'fixed right-0 top-0 z-50 flex h-full w-[min(320px,85vw)] flex-col',
              'border-white/8 bg-[#090d1f]/98 border-l shadow-2xl',
              'backdrop-blur-2xl'
            )}
            aria-label={t('mobile_nav')}
            role="navigation"
          >
            {/* Header */}
            <div className="border-white/6 flex items-center justify-between border-b px-5 py-4">
              <NavLogo locale={locale} />
              <button
                onClick={onClose}
                aria-label={t('close_menu')}
                className="hover:bg-white/8 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-slate-200"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="space-y-1.5">
                {NAV_LINKS.map((link, i) => {
                  const href = `/${locale}${link.href === '/' ? '' : link.href}`
                  const isActive = activePath === link.href || pathname === href

                  return (
                    <MobileNavLink
                      key={link.key}
                      link={{ ...link, href }}
                      label={t(link.key)}
                      isActive={isActive}
                      index={i}
                      onClick={onClose}
                    />
                  )
                })}
              </div>
            </div>

            {/* Footer controls */}
            <div className="border-white/6 space-y-4 border-t px-5 py-5">
              {/* Language switcher */}
              <div>
                <p className="mb-2.5 font-jetbrains text-xs uppercase tracking-widest text-slate-500">
                  {t('switch_language')}
                </p>
                <div className="flex gap-2">
                  {locales.map((loc) => {
                    const info = localeLabels[loc]
                    const isCurrent = loc === currentLocale
                    return (
                      <button
                        key={loc}
                        onClick={() => handleLocaleChange(loc)}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                          'transition-all duration-200',
                          isCurrent
                            ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25'
                            : 'hover:bg-white/8 bg-white/5 text-slate-400 hover:text-slate-200'
                        )}
                      >
                        <span className="text-base">{info.flag}</span>
                        <span className="font-jetbrains text-xs uppercase tracking-wide">
                          {loc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Theme toggle (Disabled temporarily) */}
              {/* <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                  onClose()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium',
                  'bg-white/5 text-slate-400 transition-all duration-200',
                  'hover:bg-white/8 hover:text-slate-200'
                )}
              >
                {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
                <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
              </button> */}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// Main Navbar
// =============================================================================

interface NavbarProps {
  locale: SupportedLocale
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const isMenuOpen = useIsMenuOpen()
  const { openMenu, closeMenu } = useMenuActions()

  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Zustand locale — kept in sync with URL param
  const storeLocale = useUIStore((s) => s.locale)
  const currentLocale: SupportedLocale = storeLocale ?? locale

  // -------------------------------------------------------------------------
  // Scroll handling
  // -------------------------------------------------------------------------
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = lastScrollY.current
    const delta = latest - prev

    // Update progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    setScrollProgress(docHeight > 0 ? Math.min(latest / docHeight, 1) : 0)

    // Scrolled state (triggers glassmorphism)
    setScrolled(latest > SCROLL_THRESHOLD)

    // Hide navbar on scroll down, show on scroll up
    // Only after we've scrolled past 200px to avoid hiding immediately
    if (latest > 200) {
      if (delta > 4 && !ticking.current) {
        setHidden(true)
        ticking.current = true
        setTimeout(() => {
          ticking.current = false
        }, 300)
      } else if (delta < -4) {
        setHidden(false)
        ticking.current = false
      }
    } else {
      setHidden(false)
    }

    lastScrollY.current = latest
  })

  // -------------------------------------------------------------------------
  // Close menu on route change
  // -------------------------------------------------------------------------
  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  // -------------------------------------------------------------------------
  // Active path detection (strip locale prefix)
  // -------------------------------------------------------------------------
  const activePath = pathname.replace(`/${locale}`, '') || '/'

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      {/* Scroll progress bar */}
      <ScrollProgressBar progress={scrollProgress} />

      {/* Skip navigation (accessibility) */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Navbar */}
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: hidden ? -100 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed left-0 right-0 top-0 z-50',
          'transition-all duration-500',
          scrolled
            ? 'border-white/6 border-b bg-[#050816]/80 shadow-lg shadow-black/20 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        )}
        role="banner"
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLogo locale={locale} />

          {/* Desktop navigation */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label={t('main_nav') ?? 'Main navigation'}
          >
            {NAV_LINKS.map((link) => {
              const href = `/${locale}${link.href === '/' ? '' : link.href}`
              const isActive = activePath === link.href || pathname === href

              return (
                <DesktopNavLink
                  key={link.key}
                  link={{ ...link, href }}
                  label={t(link.key)}
                  isActive={isActive}
                />
              )
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            {/* Locale switcher — hidden on mobile (handled in drawer) */}
            <div className="hidden md:block">
              <LocaleSwitcher currentLocale={currentLocale} />
            </div>

            {/* Theme toggle — hidden on mobile (handled in drawer) */}
            {/* <div className="hidden md:block">
              <ThemeToggle />
            </div> */}

            {/* CTA button — hidden on small screens */}
            <div className="hidden lg:block">
              <Link
                href={`/${locale}/contact`}
                className={cn(
                  'ml-2 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold',
                  'bg-gradient-to-r from-cyan-500 to-violet-600',
                  'text-[#050816] shadow-md shadow-cyan-500/20',
                  'transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30',
                  'hover:-translate-y-px hover:brightness-110'
                )}
              >
                <HiOutlineMail className="h-3.5 w-3.5" />
                {t('contact')}
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg md:hidden',
                'hover:bg-white/8 text-slate-400 transition-all duration-200 hover:text-slate-200',
                isMenuOpen && 'bg-white/8 text-slate-200'
              )}
              onClick={isMenuOpen ? closeMenu : openMenu}
              aria-label={isMenuOpen ? t('close_menu') : t('open_menu')}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <FiX className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <FiMenu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu drawer */}
      <MobileMenu
        isOpen={isMenuOpen}
        locale={locale}
        pathname={pathname}
        currentLocale={currentLocale}
        onClose={closeMenu}
      />
    </>
  )
}

export default Navbar
