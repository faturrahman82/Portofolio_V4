import { useCallback, useEffect, useRef, useState } from 'react'

// =============================================================================
// Types
// =============================================================================

export interface ScrollState {
  /** Scroll progress from 0 (top) to 1 (bottom of page) */
  progress: number
  /** Raw scroll Y position in pixels */
  scrollY: number
  /** Scroll direction: 'up' | 'down' | null (on first render) */
  direction: 'up' | 'down' | null
  /** True when the user has scrolled past the given threshold (default: 80px) */
  isScrolled: boolean
  /** True when the user is near the bottom of the page (within 100px) */
  isAtBottom: boolean
  /** True when the user is at the very top of the page */
  isAtTop: boolean
  /** Scroll velocity in px/ms (averaged over last two frames) */
  velocity: number
  /** Total document scrollable height in pixels */
  scrollHeight: number
  /** Viewport height in pixels */
  viewportHeight: number
}

export interface UseScrollProgressOptions {
  /**
   * Pixel threshold above which `isScrolled` becomes true.
   * @default 80
   */
  threshold?: number
  /**
   * Throttle interval in ms. Set to 0 to disable throttling.
   * @default 0
   */
  throttleMs?: number
  /**
   * Whether to update the Zustand UIStore with the scroll progress.
   * Disable if you only need local state to avoid cross-component re-renders.
   * @default false
   */
  syncStore?: boolean
  /**
   * Element to track scroll on. Defaults to window.
   */
  targetRef?: React.RefObject<HTMLElement>
}

// =============================================================================
// Helpers
// =============================================================================

function getScrollValues(target: HTMLElement | null): {
  scrollY: number
  scrollHeight: number
  viewportHeight: number
  progress: number
} {
  if (target) {
    const scrollY = target.scrollTop
    const scrollHeight = target.scrollHeight - target.clientHeight
    const viewportHeight = target.clientHeight
    const progress = scrollHeight > 0 ? Math.min(scrollY / scrollHeight, 1) : 0
    return { scrollY, scrollHeight, viewportHeight, progress }
  }

  // Window scroll
  const scrollY = window.scrollY ?? window.pageYOffset ?? 0
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  )
  const viewportHeight = window.innerHeight
  const scrollHeight = docHeight - viewportHeight
  const progress = scrollHeight > 0 ? Math.min(scrollY / scrollHeight, 1) : 0

  return { scrollY, scrollHeight, viewportHeight, progress }
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Tracks the current scroll position, progress, direction, and velocity.
 *
 * @example
 * ```tsx
 * const { progress, isScrolled, direction } = useScrollProgress({ threshold: 60 })
 *
 * // Navbar transparency
 * <nav style={{ opacity: isScrolled ? 1 : 0.8 }} />
 *
 * // Progress bar
 * <div style={{ scaleX: progress }} />
 * ```
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}): ScrollState {
  const { threshold = 80, throttleMs = 0, targetRef } = options

  const [state, setState] = useState<ScrollState>({
    progress: 0,
    scrollY: 0,
    direction: null,
    isScrolled: false,
    isAtBottom: false,
    isAtTop: true,
    velocity: 0,
    scrollHeight: 0,
    viewportHeight: 0,
  })

  // Refs to avoid stale closures in the event listener
  const prevScrollYRef = useRef<number>(0)
  const prevTimestampRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const lastThrottleRef = useRef<number>(0)
  const isMountedRef = useRef<boolean>(false)

  const update = useCallback(() => {
    if (!isMountedRef.current) {
      return
    }

    const target = targetRef?.current ?? null
    const { scrollY, scrollHeight, viewportHeight, progress } = getScrollValues(target)

    const prevScrollY = prevScrollYRef.current
    const now = performance.now()
    const dt = now - prevTimestampRef.current
    const dy = scrollY - prevScrollY

    const direction: 'up' | 'down' | null =
      dy === 0
        ? state.direction // keep previous direction on no movement
        : dy > 0
          ? 'down'
          : 'up'

    const velocity = dt > 0 ? Math.abs(dy / dt) : 0

    prevScrollYRef.current = scrollY
    prevTimestampRef.current = now

    setState({
      progress,
      scrollY,
      direction,
      isScrolled: scrollY > threshold,
      isAtTop: scrollY <= 0,
      isAtBottom: scrollY >= scrollHeight - 4, // 4px tolerance
      velocity,
      scrollHeight,
      viewportHeight,
    })
  }, [threshold, targetRef, state.direction])

  const handleScroll = useCallback(() => {
    // Cancel any pending rAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    if (throttleMs > 0) {
      const now = Date.now()
      if (now - lastThrottleRef.current < throttleMs) {
        return
      }
      lastThrottleRef.current = now
    }

    // Schedule update on the next animation frame for smooth performance
    rafRef.current = requestAnimationFrame(update)
  }, [throttleMs, update])

  useEffect(() => {
    isMountedRef.current = true

    const target = targetRef?.current ?? (typeof window !== 'undefined' ? window : null)
    if (!target) {
      return
    }

    // Set initial state
    update()

    target.addEventListener('scroll', handleScroll, { passive: true })

    // Also update on resize (changes scrollHeight / progress)
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      isMountedRef.current = false
      target.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll, targetRef, update])

  return state
}

// =============================================================================
// Derived hooks (convenience wrappers)
// =============================================================================

/**
 * Returns only the scroll direction.
 * Useful for hiding/showing the navbar.
 *
 * @example
 * const dir = useScrollDirection()
 * // 'up' | 'down' | null
 */
export function useScrollDirection(): 'up' | 'down' | null {
  const { direction } = useScrollProgress()
  return direction
}

/**
 * Returns true once the page has been scrolled past the given threshold (px).
 *
 * @example
 * const hasScrolled = useHasScrolled(100)
 */
export function useHasScrolled(threshold = 80): boolean {
  const { isScrolled } = useScrollProgress({ threshold })
  return isScrolled
}

/**
 * Returns the scroll progress as a value between 0 and 1.
 * Ideal for driving a reading-progress bar.
 *
 * @example
 * const progress = useScrollFraction()
 * <div style={{ transform: `scaleX(${progress})` }} />
 */
export function useScrollFraction(): number {
  const { progress } = useScrollProgress()
  return progress
}

/**
 * Returns `true` when the user is scrolling up — useful for showing a
 * "Back to top" button or re-showing a hidden navbar.
 */
export function useIsScrollingUp(): boolean {
  const { direction } = useScrollProgress()
  return direction === 'up'
}

/**
 * Returns `true` when the user is near the bottom of the page.
 * Useful for triggering infinite-scroll loads.
 */
export function useIsNearBottom(tolerance = 100): boolean {
  const { scrollHeight, scrollY } = useScrollProgress()
  return scrollY >= scrollHeight - tolerance
}

/**
 * Tracks scroll position on a specific element ref instead of the window.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null)
 * const { progress } = useElementScrollProgress(ref)
 */
export function useElementScrollProgress(
  ref: React.RefObject<HTMLElement>,
  options: Omit<UseScrollProgressOptions, 'targetRef'> = {}
): ScrollState {
  return useScrollProgress({ ...options, targetRef: ref })
}

/**
 * Returns the raw window scroll Y position.
 * The lightest possible scroll hook — no direction or progress calculation.
 */
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY ?? window.pageYOffset ?? 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // init

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrollY
}

export default useScrollProgress
