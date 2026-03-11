'use client'

import { AdaptiveDpr, AdaptiveEvents, Preload, Stats } from '@react-three/drei'
import { Canvas, type RootState } from '@react-three/fiber'
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  Component,
  type ErrorInfo,
} from 'react'
import * as THREE from 'three'

import { cn, supportsWebGL, prefersReducedMotion } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

export interface SceneCanvasProps {
  /** Three.js scene children (lights, meshes, etc.) */
  children: ReactNode
  /** Additional className applied to the wrapper div */
  className?: string
  /** Camera field of view in degrees (default: 60) */
  fov?: number
  /** Camera near clip plane (default: 0.1) */
  near?: number
  /** Camera far clip plane (default: 100) */
  far?: number
  /** Camera position (default: [0, 0, 5]) */
  cameraPosition?: [number, number, number]
  /** Whether to show the r3f performance stats overlay (dev only) */
  showStats?: boolean
  /** Whether to enable OrbitControls (default: false) */
  enableOrbitControls?: boolean
  /** Fallback UI shown when WebGL is unavailable */
  fallback?: ReactNode
  /** Called when the GL context is created */
  onCreated?: (state: RootState) => void
  /** Whether to use linear colour space (default: false — sRGB) */
  linearColorSpace?: boolean
  /** DPR range [min, max] for adaptive resolution (default: [1, 2]) */
  dprRange?: [number, number]
  /** Whether to use alpha (transparent background) (default: true) */
  alpha?: boolean
  /** Tone mapping preset (default: ACESFilmic) */
  toneMapping?: THREE.ToneMapping
  /** Antialias (default: true) */
  antialias?: boolean
  /** Whether the canvas should capture pointer events (default: false for bg canvases) */
  eventSource?: 'canvas' | 'document' | 'none'
}

// =============================================================================
// Loading fallback — shown while Suspense children resolve
// =============================================================================

function CanvasLoadingFallback() {
  return null // Three.js content loads fast; avoid flash of loading state
}

// =============================================================================
// WebGL unavailable fallback UI
// =============================================================================

function WebGLFallback({ fallback }: { fallback?: ReactNode }) {
  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0',
        'bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-600/5'
      )}
      role="img"
      aria-label="Decorative background gradient"
    >
      {/* Decorative static gradient circles as WebGL replacement */}
      <div className="bg-cyan-500/8 absolute left-1/4 top-1/4 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-violet-600/6 absolute right-1/4 top-1/2 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/2 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-400/5 blur-2xl" />
    </div>
  )
}

// =============================================================================
// Error boundary for catching WebGL / runtime errors in scene children
// =============================================================================

interface SceneErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface SceneErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Non-fatal — log in dev, silent in prod
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SceneCanvas] Three.js scene error caught by boundary:', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return <WebGLFallback fallback={this.props.fallback} />
    }
    return this.props.children
  }
}

// =============================================================================
// Tone mapping map
// =============================================================================

const TONE_MAP: Record<string, THREE.ToneMapping> = {
  ACESFilmic: THREE.ACESFilmicToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  AgX: THREE.AgXToneMapping,
  NoToneMapping: THREE.NoToneMapping,
}

// =============================================================================
// SceneCanvas
// =============================================================================

/**
 * `SceneCanvas` is a production-ready wrapper around `@react-three/fiber`'s
 * `<Canvas>` component that adds:
 *
 * - **SSR safety** — renders nothing on the server; mounts only on the client
 * - **WebGL detection** — shows a CSS fallback if WebGL is unavailable
 * - **Error boundary** — catches scene errors without crashing the page
 * - **`prefers-reduced-motion` support** — pauses the render loop when the
 *   user has requested reduced motion
 * - **Adaptive DPR** — automatically downsizes pixel ratio under GPU load
 * - **Pointer-event isolation** — background canvases don't block page interaction
 *
 * All Three.js scene children (lights, meshes, post-processing) should be
 * passed as `children`.  The canvas itself is absolutely positioned to fill
 * its nearest `position: relative` ancestor.
 *
 * @example
 * ```tsx
 * // Lazy-load in a page component to avoid SSR issues with Three.js imports:
 * const SceneCanvas = dynamic(() => import('@/components/three/SceneCanvas'), { ssr: false })
 *
 * <div className="relative h-screen">
 *   <SceneCanvas fov={55} cameraPosition={[0, 0, 6]}>
 *     <ambientLight intensity={0.4} />
 *     <ParticleField count={3000} />
 *     <FloatingGeometry variant="torusKnot" />
 *   </SceneCanvas>
 * </div>
 * ```
 */
export function SceneCanvas({
  children,
  className,
  fov = 60,
  near = 0.1,
  far = 100,
  cameraPosition = [0, 0, 5],
  showStats = false,
  fallback,
  onCreated,
  linearColorSpace = false,
  dprRange = [1, 2],
  alpha = true,
  toneMapping,
  antialias = true,
  eventSource = 'none',
}: SceneCanvasProps) {
  // -------------------------------------------------------------------------
  // Client-only mount guard (prevents SSR hydration mismatch)
  // -------------------------------------------------------------------------
  const [isMounted, setIsMounted] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const frameloopRef = useRef<'always' | 'demand' | 'never'>('always')

  useEffect(() => {
    setIsMounted(true)
    setHasWebGL(supportsWebGL())

    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      const reduced = e.matches
      setReducedMotion(reduced)
      // Switch Three.js frameloop to 'demand' when motion is reduced
      // so it only renders on explicit invalidate() calls
      frameloopRef.current = reduced ? 'demand' : 'always'
    }

    update(mediaQuery)
    mediaQuery.addEventListener('change', update)
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  // -------------------------------------------------------------------------
  // SSR — render nothing (canvas is purely decorative / client-side)
  // -------------------------------------------------------------------------
  if (!isMounted) {
    return null
  }

  // -------------------------------------------------------------------------
  // WebGL unavailable — render static CSS fallback
  // -------------------------------------------------------------------------
  if (!hasWebGL) {
    return (
      <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden="true">
        <WebGLFallback fallback={fallback} />
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Determine event source / pointer-events behaviour
  // -------------------------------------------------------------------------
  const pointerEvents =
    eventSource === 'none'
      ? 'pointer-events-none'
      : eventSource === 'canvas'
        ? 'pointer-events-auto'
        : 'pointer-events-none'

  // -------------------------------------------------------------------------
  // Resolved tone mapping
  // -------------------------------------------------------------------------
  const resolvedToneMapping: THREE.ToneMapping =
    toneMapping ?? (TONE_MAP['ACESFilmic'] as THREE.ToneMapping)

  // -------------------------------------------------------------------------
  // onCreated callback — configure renderer
  // -------------------------------------------------------------------------
  const handleCreated = (state: RootState) => {
    const { gl } = state

    // Enable physically correct lighting model
    // gl.useLegacyLights = false // removed - not in @types/three v0.167

    // Set output colour space
    gl.outputColorSpace = linearColorSpace ? THREE.LinearSRGBColorSpace : THREE.SRGBColorSpace

    // Set tone mapping
    gl.toneMapping = resolvedToneMapping
    gl.toneMappingExposure = 1.2

    // Improve shadow quality if shadows are enabled
    gl.shadowMap.enabled = false
    gl.shadowMap.type = THREE.PCFSoftShadowMap

    // Disable auto-clear — we handle clearing manually for overlay canvases
    // gl.autoClear = false  // uncomment for post-processing pipelines

    // Allow canvas to be composited over the page background
    if (alpha) {
      gl.setClearColor(0x000000, 0)
    }

    // Pass through to consumer
    onCreated?.(state)
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden', pointerEvents, className)}
      aria-hidden="true"
      data-testid="scene-canvas-wrapper"
    >
      <SceneErrorBoundary fallback={fallback}>
        <Canvas
          // Camera
          camera={{
            fov,
            near,
            far,
            position: cameraPosition,
          }}
          // Renderer
          gl={{
            antialias,
            alpha,
            powerPreference: 'high-performance',
            // Disable preserveDrawingBuffer (not needed, hurts performance)
            preserveDrawingBuffer: false,
            // Fail gracefully if only WebGL 1 is available
            failIfMajorPerformanceCaveat: false,
          }}
          // Performance
          dpr={dprRange}
          frameloop={reducedMotion ? 'demand' : 'always'}
          performance={{ min: 0.5 }}
          // Shadows disabled for decorative canvases
          shadows={false}
          // Event handling
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          events={eventSource === 'none' ? () => ({}) as any : undefined}
          // Style — fill the wrapper div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          // Callbacks
          onCreated={handleCreated}
        >
          {/* Suspend children while async resources (textures, etc.) load */}
          <Suspense fallback={<CanvasLoadingFallback />}>{children}</Suspense>

          {/* Preload all staged assets before first frame */}
          <Preload all />

          {/* Adaptive DPR — lowers resolution under GPU pressure */}
          <AdaptiveDpr pixelated />

          {/* Adaptive events — disables raycasting while camera is moving */}
          <AdaptiveEvents />

          {/* Performance stats overlay (development only) */}
          {showStats && process.env.NODE_ENV === 'development' && (
            <Stats showPanel={0} className="!left-auto !right-4 !top-4" />
          )}
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}

export default SceneCanvas
