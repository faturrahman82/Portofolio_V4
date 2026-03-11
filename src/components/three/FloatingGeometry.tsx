'use client'

import { MeshDistortMaterial, MeshWobbleMaterial, Torus } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

// =============================================================================
// Types
// =============================================================================

export interface FloatingGeometryProps {
  /** Which geometry to render (default: 'torusKnot') */
  variant?: 'torusKnot' | 'icosahedron' | 'octahedron' | 'torus' | 'sphere'
  /** Position in world space (default: [2.5, 0, 0]) */
  position?: [number, number, number]
  /** Base scale (default: 1) */
  scale?: number
  /** Rotation speed multiplier (default: 1) */
  rotationSpeed?: number
  /** Whether to render in wireframe mode (default: false) */
  wireframe?: boolean
  /** Primary colour for the emissive material (default: electric cyan) */
  color?: string
  /** Emissive intensity (default: 0.6) */
  emissiveIntensity?: number
  /** Scroll progress 0–1 passed from parent for reactive animation */
  scrollProgress?: number
  /** If true, adds a secondary ghost/outline mesh behind the main one */
  withGhost?: boolean
  /** Opacity of the main mesh (default: 0.85) */
  opacity?: number
}

// =============================================================================
// Shader — custom wireframe glow material
// =============================================================================

const WIRE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv       = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const WIRE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3  uColor;
  uniform vec3  uColorSecondary;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uEmissive;
  uniform float uScrollProgress;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    /* Fresnel rim glow — bright at silhouette edges */
    vec3  viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

    /* Animated colour shift between primary and secondary */
    float t   = sin(uTime * 0.4 + vUv.y * 3.14) * 0.5 + 0.5;
    t         += uScrollProgress * 0.3;
    vec3  col = mix(uColor, uColorSecondary, clamp(t, 0.0, 1.0));

    /* Bright core tinted by colour, rim boost */
    float brightness = uEmissive + fresnel * 1.2;
    vec3  finalCol   = col * brightness;

    /* Pulse wave travelling across the surface */
    float pulse = sin(uTime * 1.5 - vUv.x * 8.0 + uScrollProgress * 6.0) * 0.08 + 0.92;
    finalCol   *= pulse;

    gl_FragColor = vec4(finalCol, uOpacity * (0.6 + fresnel * 0.4));
  }
`

// =============================================================================
// Geometry builders
// =============================================================================

function buildGeometry(variant: FloatingGeometryProps['variant']): THREE.BufferGeometry {
  switch (variant) {
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(1.1, 1)
    case 'octahedron':
      return new THREE.OctahedronGeometry(1.2, 0)
    case 'torus':
      return new THREE.TorusGeometry(0.9, 0.35, 24, 64)
    case 'sphere':
      return new THREE.SphereGeometry(1.1, 32, 32)
    case 'torusKnot':
    default:
      return new THREE.TorusKnotGeometry(0.75, 0.25, 120, 16, 2, 3)
  }
}

// =============================================================================
// Inner mesh components
// =============================================================================

interface MeshProps {
  geometry: THREE.BufferGeometry
  uniforms: Record<string, THREE.IUniform>
  wireframe: boolean
  opacity: number
}

function MainMesh({ geometry, uniforms, wireframe, opacity }: MeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!)

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow={false} receiveShadow={false}>
      {wireframe ? (
        <shaderMaterial
          vertexShader={WIRE_VERTEX_SHADER}
          fragmentShader={WIRE_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          wireframe
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      ) : (
        <shaderMaterial
          vertexShader={WIRE_VERTEX_SHADER}
          fragmentShader={WIRE_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  )
}

// Outer ghost mesh — slightly scaled up, very transparent, additive blend
function GhostMesh({ geometry, uniforms }: Omit<MeshProps, 'wireframe' | 'opacity'>) {
  return (
    <mesh geometry={geometry} scale={1.18}>
      <shaderMaterial
        vertexShader={WIRE_VERTEX_SHADER}
        fragmentShader={WIRE_FRAGMENT_SHADER}
        uniforms={{
          ...uniforms,
          uOpacity: { value: 0.08 },
          uEmissive: { value: 0.3 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        wireframe
        side={THREE.BackSide}
      />
    </mesh>
  )
}

// =============================================================================
// Main FloatingGeometry component (rendered inside <Canvas>)
// =============================================================================

function FloatingGeometryInner({
  variant = 'torusKnot',
  position = [2.5, 0, 0],
  scale = 1,
  rotationSpeed = 1,
  wireframe = false,
  color = '#00f5ff',
  emissiveIntensity = 0.6,
  scrollProgress = 0,
  withGhost = true,
  opacity = 0.85,
}: FloatingGeometryProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const targetRot = useRef({ x: 0, y: 0, z: 0 })

  // Build geometry once
  const geometry = useMemo(() => buildGeometry(variant), [variant])

  // Build shared shader uniforms
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uColorSecondary: { value: new THREE.Color('#7c3aed') },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uEmissive: { value: emissiveIntensity },
      uScrollProgress: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, opacity, emissiveIntensity]
  )

  // Animation loop
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) {
      return
    }

    const t = clock.getElapsedTime()

    // Update uniforms
    uniforms.uTime.value = t
    uniforms.uScrollProgress.value = scrollProgress

    // Rotation targets — base rotation + scroll tilt
    targetRot.current.x = t * 0.18 * rotationSpeed + scrollProgress * 0.8
    targetRot.current.y = t * 0.28 * rotationSpeed
    targetRot.current.z = Math.sin(t * 0.12) * 0.15

    // Smooth lerp to target rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRot.current.x,
      delta * 3
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRot.current.y,
      delta * 3
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRot.current.z,
      delta * 2
    )

    // Floating bob — vertical oscillation
    groupRef.current.position.y = position[1] + Math.sin(t * 0.55) * 0.18 + scrollProgress * -1.5

    // Subtle scale breathe
    const breathe = 1 + Math.sin(t * 0.9) * 0.025
    groupRef.current.scale.setScalar(scale * breathe)
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <MainMesh geometry={geometry} uniforms={uniforms} wireframe={wireframe} opacity={opacity} />

      {withGhost && <GhostMesh geometry={geometry} uniforms={uniforms} />}

      {/* Point light positioned at the geometry to cast glow */}
      <pointLight color={color} intensity={1.8} distance={4} decay={2} />
    </group>
  )
}

// =============================================================================
// Companion: OrbitingRing — a thin torus that orbits the main geometry
// =============================================================================

interface OrbitingRingProps {
  color?: string
  radius?: number
  speed?: number
  tilt?: number
}

export function OrbitingRing({
  color = '#7c3aed',
  radius = 1.6,
  speed = 0.6,
  tilt = Math.PI / 4,
}: OrbitingRingProps) {
  const ringRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (!ringRef.current) {
      return
    }
    ringRef.current.rotation.z = clock.getElapsedTime() * speed
  })

  return (
    <mesh ref={ringRef} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 80]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// =============================================================================
// Companion: EnergyParticles — a few large sparks orbiting the geometry
// =============================================================================

export function EnergyParticles({
  count = 6,
  color = '#00f5ff',
  orbitRadius = 1.4,
}: {
  count?: number
  color?: string
  orbitRadius?: number
}) {
  const groupRef = useRef<THREE.Group>(null!)

  // Pre-compute offsets
  const offsets = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6,
        radius: orbitRadius * (0.8 + Math.random() * 0.4),
        y: (Math.random() - 0.5) * 0.6,
        size: 0.04 + Math.random() * 0.04,
      })),
    [count, orbitRadius]
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return
    }
    const t = clock.getElapsedTime()

    groupRef.current.children.forEach((child, i) => {
      const o = offsets[i]
      const angle = o.angle + t * o.speed
      child.position.set(
        Math.cos(angle) * o.radius,
        o.y + Math.sin(t * 0.7 + o.angle) * 0.15,
        Math.sin(angle) * o.radius
      )
    })
  })

  return (
    <group ref={groupRef}>
      {offsets.map((o, i) => (
        <mesh key={i} position={[0, o.y, 0]}>
          <sphereGeometry args={[o.size, 6, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// =============================================================================
// Exported component — groups everything together
// =============================================================================

/**
 * `FloatingGeometry` renders an animated 3D mesh (torus knot by default)
 * with a custom shader material that produces an emissive, Fresnel-lit look.
 *
 * Designed to be rendered inside `<Canvas>` from `@react-three/fiber`.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <FloatingGeometry
 *     variant="torusKnot"
 *     position={[2.5, 0.5, 0]}
 *     wireframe={false}
 *     withGhost
 *     scrollProgress={scrollFraction}
 *   />
 * </Canvas>
 * ```
 */
export function FloatingGeometry(props: FloatingGeometryProps) {
  const { position = [2.5, 0, 0], color = '#00f5ff' } = props

  return (
    <group position={position}>
      <FloatingGeometryInner {...props} position={[0, 0, 0]} />
      <OrbitingRing color="#7c3aed" radius={1.55} speed={0.5} tilt={Math.PI / 5} />
      <OrbitingRing color={color} radius={1.8} speed={-0.3} tilt={Math.PI / 3} />
      <EnergyParticles count={6} color={color} orbitRadius={1.4} />
    </group>
  )
}

export default FloatingGeometry
