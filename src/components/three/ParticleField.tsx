'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useMemo, useRef } from 'react'
import * as THREE from 'three'

// =============================================================================
// Types
// =============================================================================

interface ParticleFieldProps {
  /** Number of particles to render (default: 3000) */
  count?: number
  /** Spread radius of the particle cloud (default: 20) */
  spread?: number
  /** Base particle size in world units (default: 0.015) */
  size?: number
  /** Primary particle colour (default: electric cyan) */
  color?: string
  /** Secondary particle colour for variety (default: violet) */
  colorSecondary?: string
  /** How fast particles drift (default: 0.015) */
  speed?: number
  /** Scroll progress 0–1 passed from parent to animate reactively */
  scrollProgress?: number
  /** Whether to enable mouse-parallax (default: true) */
  mouseParallax?: boolean
  /** Depth of field factor — higher = more z-spread (default: 8) */
  depth?: number
}

// =============================================================================
// Shader sources
// =============================================================================

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3  aColor;
  attribute float aPhase;    /* per-particle animation phase offset */
  attribute float aSpeed;    /* per-particle drift speed multiplier */

  uniform float uTime;
  uniform float uScrollProgress;
  uniform vec2  uMouseNDC;   /* mouse position in normalized device coords (–1..1) */
  uniform float uPixelRatio;

  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;

    vec3 pos = position;

    /* -----------------------------------------------------------------------
       Drift animation — each particle oscillates in a unique lissajous path
       ----------------------------------------------------------------------- */
    float t = uTime * aSpeed + aPhase;

    pos.x += sin(t * 0.7 + aPhase * 2.1) * 0.18;
    pos.y += cos(t * 0.5 + aPhase * 1.3) * 0.14;
    pos.z += sin(t * 0.3 + aPhase * 0.9) * 0.10;

    /* -----------------------------------------------------------------------
       Scroll parallax — particles deeper in z move slower
       ----------------------------------------------------------------------- */
    float depth = (pos.z + 8.0) / 16.0;        /* 0..1 */
    pos.y -= uScrollProgress * 4.0 * (1.0 - depth * 0.6);

    /* -----------------------------------------------------------------------
       Mouse parallax — subtle shift based on cursor position
       ----------------------------------------------------------------------- */
    pos.x += uMouseNDC.x * depth * 0.6;
    pos.y += uMouseNDC.y * depth * 0.4;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

    /* -----------------------------------------------------------------------
       Perspective-correct point size
       ----------------------------------------------------------------------- */
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    /* Circular soft dot */
    vec2  coord = gl_PointCoord - vec2(0.5);
    float dist  = length(coord);

    if (dist > 0.5) discard;

    /* Soft edge falloff */
    float alpha = smoothstep(0.5, 0.15, dist) * vAlpha;

    /* Bloom-like bright core */
    float core  = smoothstep(0.2, 0.0, dist);
    vec3  col   = mix(vColor, vec3(1.0), core * 0.35);

    gl_FragColor = vec4(col, alpha);
  }
`

// =============================================================================
// Helper — generate random particle attributes
// =============================================================================

function buildParticleAttributes(
  count: number,
  spread: number,
  depth: number,
  baseSize: number,
  colorPrimary: THREE.Color,
  colorSecondary: THREE.Color
): {
  positions: Float32Array
  sizes: Float32Array
  alphas: Float32Array
  colors: Float32Array
  phases: Float32Array
  speeds: Float32Array
} {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const alphas = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    /* Position — gaussian-ish distribution to cluster toward center */
    const r = Math.pow(Math.random(), 0.6) * spread
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7 /* flatten Y */
    positions[i3 + 2] = (Math.random() - 0.5) * depth

    /* Size — small with occasional larger accent */
    const isBig = Math.random() < 0.04
    sizes[i] =
      baseSize * (isBig ? THREE.MathUtils.randFloat(3, 6) : THREE.MathUtils.randFloat(0.5, 2.2))

    /* Alpha — vary for depth illusion */
    alphas[i] = THREE.MathUtils.randFloat(0.25, isBig ? 1.0 : 0.7)

    /* Colour — interpolate between primary and secondary */
    const t = Math.random()
    const col = colorPrimary.clone().lerp(colorSecondary, t)

    /* Desaturate particles far from center for realism */
    const dist = r / spread
    col.lerp(new THREE.Color(0.7, 0.7, 0.9), dist * 0.4)

    colors[i3] = col.r
    colors[i3 + 1] = col.g
    colors[i3 + 2] = col.b

    /* Animation offsets */
    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = THREE.MathUtils.randFloat(0.3, 1.0)
  }

  return { positions, sizes, alphas, colors, phases, speeds }
}

// =============================================================================
// Inner component (rendered inside <Canvas>)
// =============================================================================

function Particles({
  count = 3000,
  spread = 20,
  size = 0.015,
  color = '#00f5ff',
  colorSecondary = '#7c3aed',
  speed = 0.015,
  scrollProgress = 0,
  mouseParallax = true,
  depth = 8,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
  const targetMouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
  const { gl, size: canvasSize } = useThree()

  /* ------------------------------------------------------------------
     Build geometry attributes (memoised — only recalculates if props change)
     ------------------------------------------------------------------ */
  const { positions, sizes, alphas, colors, phases, speeds } = useMemo(
    () =>
      buildParticleAttributes(
        count,
        spread,
        depth,
        size,
        new THREE.Color(color),
        new THREE.Color(colorSecondary)
      ),
    [count, spread, depth, size, color, colorSecondary]
  )

  /* ------------------------------------------------------------------
     Shader uniforms
     ------------------------------------------------------------------ */
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uMouseNDC: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: gl.getPixelRatio() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  /* ------------------------------------------------------------------
     Mouse tracking — smoothly interpolate toward target
     ------------------------------------------------------------------ */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!mouseParallax) {
        return
      }
      targetMouseRef.current.set(
        (e.clientX / canvasSize.width) * 2 - 1,
        -(e.clientY / canvasSize.height) * 2 + 1
      )
    },
    [mouseParallax, canvasSize.width, canvasSize.height]
  )

  // Attach / detach listener
  useMemo(() => {
    const canvas = gl.domElement
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [gl.domElement, handleMouseMove])

  /* ------------------------------------------------------------------
     Animation loop
     ------------------------------------------------------------------ */
  useFrame(({ clock }, delta) => {
    if (!materialRef.current) {
      return
    }

    const u = materialRef.current.uniforms

    // Update time
    u.uTime.value = clock.getElapsedTime() * speed * 60

    // Scroll reactivity
    u.uScrollProgress.value = scrollProgress

    // Smooth mouse lerp (lazy easing)
    if (mouseParallax) {
      mouseRef.current.lerp(targetMouseRef.current, Math.min(delta * 4, 1))
      u.uMouseNDC.value.copy(mouseRef.current)
    }

    // Slow rotation of the entire particle cloud
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.04
    }
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-aAlpha" args={[alphas, 1]} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} count={count} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} count={count} itemSize={1} />
      </bufferGeometry>

      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  )
}

// =============================================================================
// Public export — wrapped in error boundary friendly component
// =============================================================================

/**
 * `ParticleField` renders 3 000+ soft-glow points drifting in 3D space.
 *
 * Must be rendered as a child of `<Canvas>` from `@react-three/fiber`.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <ParticleField count={3000} scrollProgress={scrollY} />
 * </Canvas>
 * ```
 */
export function ParticleField(props: ParticleFieldProps) {
  return <Particles {...props} />
}

export default ParticleField
