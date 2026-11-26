import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  ATMOSPHERE_FRAGMENT_SHADER,
  ATMOSPHERE_VERTEX_SHADER,
  PARTICLES_FRAGMENT_SHADER,
  PARTICLES_VERTEX_SHADER,
  PRISM_FRAGMENT_SHADER,
  PRISM_VERTEX_SHADER,
} from '../../shaders/atmosphereShader'
import { ProjectTheme } from '../../types/portfolio'
import { detectWebGLSupport } from '../../utils/webglSupport'
import { WebGLErrorBoundary } from '../WebGLErrorBoundary'

interface SharedInteractionRef {
  mouseX: number
  mouseY: number
  speed: number
  scrollProgress: number
}

interface SceneProps {
  activeTheme: ProjectTheme | null
  interactionRef: React.MutableRefObject<SharedInteractionRef>
}

const DEFAULT_COLOR_A = new THREE.Color(0.18, 1.0, 0.48) // #2EFF7B Neon Emerald
const DEFAULT_COLOR_B = new THREE.Color(0.55, 0.24, 1.0) // #8B3DFF Electric Violet
const DEFAULT_COLOR_C = new THREE.Color(0.08, 0.22, 0.48) // Deep Cobalt

const AtmospherePlane: React.FC<SceneProps> = ({
  activeTheme,
  interactionRef,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerSpeed: { value: 0 },
      uScroll: { value: 0 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    []
  )

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }
  }, [size.width, size.height])

  const targetA = useMemo(() => new THREE.Color(), [])
  const targetB = useMemo(() => new THREE.Color(), [])
  const targetC = useMemo(() => new THREE.Color(), [])

  useFrame((_, delta) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uTime.value += Math.min(delta, 0.05)

    const { mouseX, mouseY, speed, scrollProgress } = interactionRef.current
    u.uMouse.value.lerp(new THREE.Vector2(mouseX, 1.0 - mouseY), 0.1)
    u.uPointerSpeed.value = THREE.MathUtils.lerp(
      u.uPointerSpeed.value,
      speed,
      0.1
    )
    u.uScroll.value = THREE.MathUtils.lerp(u.uScroll.value, scrollProgress, 0.08)

    if (activeTheme) {
      targetA.setRGB(...activeTheme.shaderPaletteA)
      targetB.setRGB(...activeTheme.shaderPaletteB)
      targetC.setRGB(...activeTheme.shaderPaletteC)
    } else {
      targetA.copy(DEFAULT_COLOR_A)
      targetB.copy(DEFAULT_COLOR_B)
      targetC.copy(DEFAULT_COLOR_C)
    }

    u.uColorA.value.lerp(targetA, 0.04)
    u.uColorB.value.lerp(targetB, 0.04)
    u.uColorC.value.lerp(targetC, 0.04)
  })

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={ATMOSPHERE_VERTEX_SHADER}
        fragmentShader={ATMOSPHERE_FRAGMENT_SHADER}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

const MemoryPrismSculpture: React.FC<SceneProps> = ({
  activeTheme,
  interactionRef,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
    }),
    []
  )

  const targetA = useMemo(() => new THREE.Color(), [])
  const targetB = useMemo(() => new THREE.Color(), [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { mouseX, mouseY, scrollProgress } = interactionRef.current

    if (matRef.current) {
      const u = matRef.current.uniforms
      u.uTime.value += dt
      u.uMouse.value.lerp(new THREE.Vector2(mouseX, 1.0 - mouseY), 0.08)
      u.uScroll.value = scrollProgress

      if (activeTheme) {
        targetA.setRGB(...activeTheme.shaderPaletteA)
        targetB.setRGB(...activeTheme.shaderPaletteB)
      } else {
        targetA.copy(DEFAULT_COLOR_A)
        targetB.copy(DEFAULT_COLOR_B)
      }
      u.uColorA.value.lerp(targetA, 0.05)
      u.uColorB.value.lerp(targetB, 0.05)
    }

    if (groupRef.current) {
      const isMobile = viewport.width < 6.5
      const baseX = isMobile ? 0 : viewport.width * 0.22
      const scrollShiftY = -scrollProgress * 2.8
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        baseX + (mouseX - 0.5) * 0.45,
        0.06
      )
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0.15 + scrollShiftY - (mouseY - 0.5) * 0.35,
        0.06
      )
      groupRef.current.rotation.y += dt * 0.22
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        (mouseY - 0.5) * 0.55,
        0.05
      )
      const scaleFade = Math.max(0.45, 1.0 - scrollProgress * 1.4)
      const s = (isMobile ? 0.68 : 1.0) * scaleFade
      groupRef.current.scale.setScalar(s)
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += dt * 0.18
      ring1Ref.current.rotation.x += dt * 0.09
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= dt * 0.21
      ring2Ref.current.rotation.z -= dt * 0.11
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.38, 28]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={PRISM_VERTEX_SHADER}
          fragmentShader={PRISM_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
        />
      </mesh>
      <mesh ref={ring1Ref} rotation={[0.8, 0.3, 0]}>
        <torusGeometry args={[1.95, 0.012, 16, 120]} />
        <meshBasicMaterial color="#2EFF7B" transparent opacity={0.35} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-0.6, 0.9, 0.2]}>
        <torusGeometry args={[2.25, 0.008, 16, 120]} />
        <meshBasicMaterial color="#8B3DFF" transparent opacity={0.38} />
      </mesh>
    </group>
  )
}

const SpatialParticles: React.FC<SceneProps> = ({
  activeTheme,
  interactionRef,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()

  const { positions, scales, phases } = useMemo(() => {
    const count = 180
    const pos = new Float32Array(count * 3)
    const scl = new Float32Array(count)
    const phs = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random layout
      const s1 = Math.sin(i * 12.9898) * 43758.5453
      const s2 = Math.sin(i * 78.233) * 24634.6345
      const s3 = Math.sin(i * 45.164) * 19384.2314
      const rx = s1 - Math.floor(s1)
      const ry = s2 - Math.floor(s2)
      const rz = s3 - Math.floor(s3)

      pos[i * 3] = (rx - 0.5) * 13
      pos[i * 3 + 1] = (ry - 0.5) * 9
      pos[i * 3 + 2] = -rz * 5.5 - 0.5
      scl[i] = 1.4 + (i % 5) * 0.55
      phs[i] = i * 0.43
    }
    return { positions: pos, scales: scl, phases: phs }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
    }),
    [gl]
  )

  const targetA = useMemo(() => new THREE.Color(), [])
  const targetB = useMemo(() => new THREE.Color(), [])

  useFrame((_, delta) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uTime.value += Math.min(delta, 0.05)
    u.uMouse.value.lerp(
      new THREE.Vector2(
        interactionRef.current.mouseX,
        1.0 - interactionRef.current.mouseY
      ),
      0.08
    )
    if (activeTheme) {
      targetA.setRGB(...activeTheme.shaderPaletteA)
      targetB.setRGB(...activeTheme.shaderPaletteB)
    } else {
      targetA.copy(DEFAULT_COLOR_A)
      targetB.copy(DEFAULT_COLOR_B)
    }
    u.uColorA.value.lerp(targetA, 0.04)
    u.uColorB.value.lerp(targetB, 0.04)
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={scales.length}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          count={phases.length}
          array={phases}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={PARTICLES_VERTEX_SHADER}
        fragmentShader={PARTICLES_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface ExperienceCanvasProps {
  activeTheme: ProjectTheme | null
}

const CSSFallbackBackdrop: React.FC<{ activeTheme: ProjectTheme | null }> = ({
  activeTheme,
}) => {
  const accent = activeTheme?.accentHex || '#2EFF7B'
  const secondary = activeTheme?.secondaryHex || '#8B3DFF'
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06070B]"
      aria-hidden="true"
    >
      <div
        className="absolute -top-40 -left-32 h-[540px] w-[540px] rounded-full opacity-25 blur-[130px] transition-colors duration-1000"
        style={{ background: accent }}
      />
      <div
        className="absolute right-[-10%] bottom-[-15%] h-[580px] w-[580px] rounded-full opacity-20 blur-[140px] transition-colors duration-1000"
        style={{ background: secondary }}
      />
      <div className="halftone-grid absolute inset-0 opacity-50" />
    </div>
  )
}

export const ExperienceCanvas: React.FC<ExperienceCanvasProps> = ({
  activeTheme,
}) => {
  const [webglReady, setWebglReady] = useState(false)
  const interactionRef = useRef<SharedInteractionRef>({
    mouseX: 0.5,
    mouseY: 0.5,
    speed: 0,
    scrollProgress: 0,
  })

  useEffect(() => {
    setWebglReady(detectWebGLSupport())
  }, [])

  useEffect(() => {
    let lastX = 0.5
    let lastY = 0.5
    let decayTimer = 0

    const updatePointer = (clientX: number, clientY: number) => {
      const nx = clientX / Math.max(window.innerWidth, 1)
      const ny = clientY / Math.max(window.innerHeight, 1)
      const dx = nx - lastX
      const dy = ny - lastY
      interactionRef.current.mouseX = nx
      interactionRef.current.mouseY = ny
      interactionRef.current.speed = Math.min(1.5, Math.hypot(dx, dy) * 28)
      lastX = nx
      lastY = ny

      window.clearTimeout(decayTimer)
      decayTimer = window.setTimeout(() => {
        interactionRef.current.speed = 0
      }, 90)
    }

    const onMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      )
      interactionRef.current.scrollProgress = window.scrollY / maxScroll
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(decayTimer)
    }
  }, [])

  if (!webglReady) {
    return <CSSFallbackBackdrop activeTheme={activeTheme} />
  }

  return (
    <WebGLErrorBoundary
      fallback={<CSSFallbackBackdrop activeTheme={activeTheme} />}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 5.8], fov: 46 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
        >
          <AtmospherePlane
            activeTheme={activeTheme}
            interactionRef={interactionRef}
          />
          <SpatialParticles
            activeTheme={activeTheme}
            interactionRef={interactionRef}
          />
          <MemoryPrismSculpture
            activeTheme={activeTheme}
            interactionRef={interactionRef}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  )
}
