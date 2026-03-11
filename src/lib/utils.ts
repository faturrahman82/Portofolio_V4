import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// =============================================================================
// Tailwind CSS class merger
// =============================================================================

/**
 * Merges Tailwind CSS class names intelligently, resolving conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-cyan-500', 'px-6') // → 'py-2 bg-cyan-500 px-6'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// =============================================================================
// String utilities
// =============================================================================

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) {
    return ''
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Converts a kebab-case or snake_case string to Title Case.
 * @example toTitleCase('hello-world') → 'Hello World'
 */
export function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

/**
 * Truncates a string to the given max length, appending an ellipsis if truncated.
 */
export function truncate(str: string, maxLength: number, ellipsis = '…'): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength - ellipsis.length).trimEnd() + ellipsis
}

/**
 * Converts a number to a compact locale string (e.g. 1200 → '1.2k', 1500000 → '1.5M').
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return value.toString()
}

/**
 * Formats a number with locale-aware thousand separators.
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Generates a URL-safe slug from a string.
 * @example slugify('Hello World!') → 'hello-world'
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Strips HTML tags from a string, returning plain text.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// =============================================================================
// Date / time utilities
// =============================================================================

/**
 * Returns a relative time string (e.g. "3 days ago", "just now").
 */
export function timeAgo(date: string | Date, locale = 'en'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffSeconds = Math.round((then - now) / 1_000)

  const thresholds: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3_600, 'minute'],
    [86_400, 'hour'],
    [2_592_000, 'day'],
    [31_536_000, 'month'],
    [Infinity, 'year'],
  ]

  let divisor = 1
  for (const [threshold, unit] of thresholds) {
    if (Math.abs(diffSeconds) < threshold) {
      return rtf.format(Math.round(diffSeconds / divisor), unit)
    }
    divisor = threshold
  }

  return rtf.format(Math.round(diffSeconds / 31_536_000), 'year')
}

/**
 * Formats a date string into a human-readable form.
 * @example formatDate('2024-01-15') → 'January 15, 2024'
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
  locale = 'en-US'
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}

/**
 * Returns the year from a date string.
 */
export function getYear(date: string | Date): number {
  return new Date(date).getFullYear()
}

// =============================================================================
// Array / object utilities
// =============================================================================

/**
 * Returns a new array with duplicate values removed.
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/**
 * Groups an array of objects by a key.
 * @example groupBy([{lang:'ts'},{lang:'js'},{lang:'ts'}], 'lang') → { ts: [...], js: [...] }
 */
export function groupBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key])
    acc[groupKey] = acc[groupKey] ? [...acc[groupKey], item] : [item]
    return acc
  }, {})
}

/**
 * Sorts an array of objects by a numeric or string key.
 */
export function sortBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    if (av === bv) {
      return 0
    }
    const cmp = av < bv ? -1 : 1
    return direction === 'asc' ? cmp : -cmp
  })
}

/**
 * Splits an array into chunks of a given size.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

/**
 * Returns a copy of an array shuffled in random order (Fisher-Yates).
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// =============================================================================
// DOM / Browser utilities
// =============================================================================

/**
 * Smoothly scrolls to the element with the given id.
 */
export function scrollToId(id: string, offset = 80): void {
  const el = document.getElementById(id)
  if (!el) {
    return
  }
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

/**
 * Copies text to the clipboard and returns a boolean indicating success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers / non-secure contexts
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Returns true if the current environment is a browser (not SSR).
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Returns true if the device supports WebGL (required for Three.js).
 */
export function supportsWebGL(): boolean {
  if (!isBrowser()) {
    return false
  }
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Returns true if the user prefers reduced motion (accessibility).
 */
export function prefersReducedMotion(): boolean {
  if (!isBrowser()) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// =============================================================================
// Math / animation utilities
// =============================================================================

/**
 * Linearly interpolates between two values.
 * @param t — progress (0–1)
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Maps a value from one range to another.
 * @example mapRange(0.5, 0, 1, 0, 100) → 50
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
}

/**
 * Converts degrees to radians.
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Converts radians to degrees.
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Generates a random float between min and max.
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Generates a random integer between min and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// =============================================================================
// Async / performance utilities
// =============================================================================

/**
 * Creates a debounced version of a function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Creates a throttled version of a function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Waits for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wraps a promise with a timeout, rejecting if it takes too long.
 */
export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

// =============================================================================
// Environment / config utilities
// =============================================================================

/**
 * Returns a required environment variable, throwing if it's missing.
 * Only safe to call on the server side.
 */
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Returns an optional environment variable with a fallback.
 */
export function getEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback
}

/**
 * Returns true if the app is running in production.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Returns true if the app is running in development.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// =============================================================================
// URL / routing utilities
// =============================================================================

/**
 * Joins URL path segments, normalising slashes.
 * @example joinPath('https://example.com', '/api', 'github') → 'https://example.com/api/github'
 */
export function joinPath(...parts: string[]): string {
  return parts
    .map((part, i) => {
      if (i === 0) {
        return part.replace(/\/$/, '')
      }
      return part.replace(/^\/|\/$/g, '')
    })
    .join('/')
}

/**
 * Safely parses a JSON string, returning null on failure instead of throwing.
 */
export function safeJsonParse<T = unknown>(str: string): T | null {
  try {
    return JSON.parse(str) as T
  } catch {
    return null
  }
}

/**
 * Extracts initials from a full name string.
 * @example getInitials('John Doe') → 'JD'
 */
export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxChars)
    .join('')
}

/**
 * Generates a random hex colour string.
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`
}

/**
 * Converts a hex colour to an rgba string with the given opacity.
 * @example hexToRgba('#00f5ff', 0.4) → 'rgba(0, 245, 255, 0.4)'
 */
export function hexToRgba(hex: string, alpha = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return `rgba(0,0,0,${alpha})`
  }
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
