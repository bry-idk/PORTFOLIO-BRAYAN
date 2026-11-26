import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import {
  FLUID_SIM_FRAGMENT_SHADER,
  FLUID_SIM_VERTEX_SHADER,
} from '../../shaders/fluidSimulationShader'
import { ProjectTheme } from '../../types/portfolio'
import { detectWebGLSupport, isLowPowerDevice } from '../../utils/webglSupport'
import { WebGLErrorBoundary } from '../WebGLErrorBoundary'

export interface ExperienceCanvasProps {
  activeTheme: ProjectTheme | null
  reducedMotion?: boolean
  heroFocus?: boolean
  ambientPulse?: number
}

interface SharedInteractionRef {
  mouseX: number
  mouseY: number
  mouseVelX: number
  mouseVelY: number
  speed: number
  scrollProgress: number
  scrollVel: number
}

interface SceneProps {
  activeTheme: ProjectTheme | null
  interactionRef: React.MutableRefObject<SharedInteractionRef>
  reducedMotion: boolean
  heroFocus: boolean
  ambientPulse: number
  lowPower: boolean
  contextRestoredTick: number
}

const DEFAULT_COLOR_A = new THREE.Color(0.18, 1.0, 0.48) // Neon Emerald
const DEFAULT_COLOR_B = new THREE.Color(0.55, 0.24, 1.0) // Electric Violet
const DEFAULT_COLOR_C = new THREE.Color(0.08, 0.22, 0.48) // Deep Cobalt

/**
 * Probes framebuffer completeness for HalfFloatType render targets so the
 * ping-pong fluid FBO never crashes on mobile or restricted GPUs.
 */
function detectSafeRenderTargetType(
  gl: THREE.WebGLRenderer
): THREE.TextureDataType {
  try {
    const isWebGL2 = gl.capabilities.isWebGL2
    const hasFloatAttachment = isWebGL2
      ? gl.extensions.has('EXT_color_buffer_float') ||
        gl.extensions.has('EXT_color_buffer_half_float')
      : gl.extensions.has('OES_texture_half_float') &&
        gl.extensions.has('OES_texture_half_float_linear') &&
        gl.extensions.has('EXT_color_buffer_half_float')

    if (!hasFloatAttachment) {
      return THREE.UnsignedByteType
    }

    const probe = new THREE.WebGLRenderTarget(4, 4, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    })
    const prevTarget = gl.getRenderTarget()
    gl.setRenderTarget(probe)
    const rawGl = gl.getContext()
    const status = rawGl.checkFramebufferStatus(rawGl.FRAMEBUFFER)
    gl.setRenderTarget(prevTarget)
    probe.dispose()

    return status === rawGl.FRAMEBUFFER_COMPLETE
      ? THREE.HalfFloatType
      : THREE.UnsignedByteType
  } catch {
    return THREE.UnsignedByteType
  }
}

interface FluidPipeline {
  rtA: THREE.WebGLRenderTarget
  rtB: THREE.WebGLRenderTarget
  simScene: THREE.Scene
  simCamera: THREE.OrthographicCamera
  simGeo: THREE.PlaneGeometry
  simMat: THREE.ShaderMaterial
  neutralTex: THREE.DataTexture
  readIndex: number
  firstFrame: boolean
}

const AtmospherePlane: React.FC<SceneProps> = ({
  activeTheme,
  interactionRef,
  reducedMotion,
  heroFocus,
  ambientPulse,
  lowPower,
  contextRestoredTick,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const pipelineRef = useRef<FluidPipeline | null>(null)
  const { gl, size } = useThree()

  const neutralFallbackTex = useMemo(() => {
    const data = new Uint8Array([128, 128, 0, 0])
    const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat)
    tex.needsUpdate = true
    return tex
  }, [])

  useEffect(() => {
    return () => {
      neutralFallbackTex.dispose()
    }
  }, [neutralFallbackTex])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerSpeed: { value: 0 },
      uScroll: { value: 0 },
      uHeroFocus: { value: heroFocus ? 1.0 : 0.0 },
      uAmbientPulse: { value: ambientPulse },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
      uFluidTex: { value: neutralFallbackTex as THREE.Texture },
      uHasFluid: { value: 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [neutralFallbackTex]
  )

  // Initialize GPU ping-pong FBO fluid pipeline safely with fallback texture type
  useEffect(() => {
    const simRes = lowPower ? 128 : 192
    const rtType = detectSafeRenderTargetType(gl)

    const rtOptions: THREE.RenderTargetOptions = {
      type: rtType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    }

    const rtA = new THREE.WebGLRenderTarget(simRes, simRes, rtOptions)
    const rtB = new THREE.WebGLRenderTarget(simRes, simRes, rtOptions)

    const neutralData = new Uint8Array([128, 128, 0, 0])
    const neutralTex = new THREE.DataTexture(
      neutralData,
      1,
      1,
      THREE.RGBAFormat
    )
    neutralTex.needsUpdate = true

    const simScene = new THREE.Scene()
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const simGeo = new THREE.PlaneGeometry(2, 2)
    const simMat = new THREE.ShaderMaterial({
      vertexShader: FLUID_SIM_VERTEX_SHADER,
      fragmentShader: FLUID_SIM_FRAGMENT_SHADER,
      uniforms: {
        uPrevState: { value: neutralTex as THREE.Texture },
        uTexelSize: { value: new THREE.Vector2(1 / simRes, 1 / simRes) },
        uDelta: { value: 0.016 },
        uTime: { value: 0 },
        uAspect: { value: size.width / Math.max(size.height, 1) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVel: { value: new THREE.Vector2(0, 0) },
        uScrollVel: { value: 0 },
        uPulse: { value: 0 },
        uFirstFrame: { value: 1.0 },
      },
      depthWrite: false,
      depthTest: false,
    })

    const simMesh = new THREE.Mesh(simGeo, simMat)
    simMesh.frustumCulled = false
    simScene.add(simMesh)

    const pipeline: FluidPipeline = {
      rtA,
      rtB,
      simScene,
      simCamera,
      simGeo,
      simMat,
      neutralTex,
      readIndex: 0,
      firstFrame: true,
    }
    pipelineRef.current = pipeline

    return () => {
      pipelineRef.current = null
      if (matRef.current) {
        matRef.current.uniforms.uFluidTex.value = neutralFallbackTex
        matRef.current.uniforms.uHasFluid.value = 0.0
      }
      rtA.dispose()
      rtB.dispose()
      simGeo.dispose()
      simMat.dispose()
      neutralTex.dispose()
    }
  }, [gl, lowPower, contextRestoredTick, neutralFallbackTex])

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }
    if (pipelineRef.current) {
      pipelineRef.current.simMat.uniforms.uAspect.value =
        size.width / Math.max(size.height, 1)
    }
  }, [size.width, size.height])

  // Hoisted scratch objects: zero per-frame GC allocations
  const targetA = useMemo(() => new THREE.Color(), [])
  const targetB = useMemo(() => new THREE.Color(), [])
  const targetC = useMemo(() => new THREE.Color(), [])
  const scratchMouse = useMemo(() => new THREE.Vector2(0.5, 0.5), [])
  const scratchVel = useMemo(() => new THREE.Vector2(0, 0), [])

  useFrame((state, delta) => {
    if (!matRef.current) return
    const rawDt = Math.min(delta, 0.05)
    const dt = reducedMotion ? 0 : rawDt
    const u = matRef.current.uniforms

    u.uTime.value += dt

    const inter = interactionRef.current
    scratchMouse.set(inter.mouseX, 1.0 - inter.mouseY)
    u.uMouse.value.lerp(scratchMouse, reducedMotion ? 0.04 : 0.14)
    u.uPointerSpeed.value = THREE.MathUtils.lerp(
      u.uPointerSpeed.value,
      reducedMotion ? 0 : inter.speed,
      0.12
    )
    u.uScroll.value = THREE.MathUtils.lerp(
      u.uScroll.value,
      inter.scrollProgress,
      0.08
    )
    u.uHeroFocus.value = THREE.MathUtils.lerp(
      u.uHeroFocus.value,
      heroFocus ? 1.0 : 0.0,
      0.06
    )
    u.uAmbientPulse.value = THREE.MathUtils.lerp(
      u.uAmbientPulse.value,
      reducedMotion ? 0 : ambientPulse,
      0.1
    )

    if (activeTheme) {
      targetA.setRGB(
        activeTheme.shaderPaletteA[0],
        activeTheme.shaderPaletteA[1],
        activeTheme.shaderPaletteA[2]
      )
      targetB.setRGB(
        activeTheme.shaderPaletteB[0],
        activeTheme.shaderPaletteB[1],
        activeTheme.shaderPaletteB[2]
      )
      targetC.setRGB(
        activeTheme.shaderPaletteC[0],
        activeTheme.shaderPaletteC[1],
        activeTheme.shaderPaletteC[2]
      )
    } else {
      targetA.copy(DEFAULT_COLOR_A)
      targetB.copy(DEFAULT_COLOR_B)
      targetC.copy(DEFAULT_COLOR_C)
    }

    u.uColorA.value.lerp(targetA, 0.045)
    u.uColorB.value.lerp(targetB, 0.045)
    u.uColorC.value.lerp(targetC, 0.045)

    // Step GPU ping-pong fluid simulation
    const pipe = pipelineRef.current
    if (pipe && !reducedMotion) {
      const readTarget = pipe.readIndex === 0 ? pipe.rtA : pipe.rtB
      const writeTarget = pipe.readIndex === 0 ? pipe.rtB : pipe.rtA
      const su = pipe.simMat.uniforms

      su.uPrevState.value = pipe.firstFrame
        ? pipe.neutralTex
        : readTarget.texture
      su.uFirstFrame.value = pipe.firstFrame ? 1.0 : 0.0
      su.uDelta.value = Math.max(rawDt, 0.004)
      su.uTime.value = u.uTime.value
      su.uMouse.value.copy(scratchMouse)
      scratchVel.set(inter.mouseVelX, -inter.mouseVelY)
      su.uMouseVel.value.copy(scratchVel)
      su.uScrollVel.value = inter.scrollVel
      su.uPulse.value = ambientPulse

      const renderer = state.gl
      const prevTarget = renderer.getRenderTarget()
      renderer.setRenderTarget(writeTarget)
      renderer.render(pipe.simScene, pipe.simCamera)
      renderer.setRenderTarget(prevTarget)

      // Swap ping-pong buffers
      pipe.readIndex = pipe.readIndex === 0 ? 1 : 0
      pipe.firstFrame = false

      u.uFluidTex.value = writeTarget.texture
      u.uHasFluid.value = 1.0
    } else if (reducedMotion) {
      u.uHasFluid.value = 0.0
    }

    // Smooth exponential impulse decay (no setTimeout churn on pointer/scroll events)
    const pointerDecay = Math.pow(0.015, rawDt)
    const scrollDecay = Math.pow(0.04, rawDt)
    inter.mouseVelX *= pointerDecay
    inter.mouseVelY *= pointerDecay
    inter.speed *= pointerDecay
    inter.scrollVel *= scrollDecay
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
  reducedMotion,
  heroFocus,
  ambientPulse,
  lowPower,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring1MatRef = useRef<THREE.MeshBasicMaterial>(null)
  const ring2MatRef = useRef<THREE.MeshBasicMaterial>(null)
  const focusFactorRef = useRef(heroFocus ? 1.0 : 0.0)
  const { viewport } = useThree()

  const icosaDetail = lowPower ? 12 : 18

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uPulse: { value: 0 },
      uOpacity: { value: heroFocus ? 1.0 : 0.22 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Hoisted scratch objects: zero per-frame allocations
  const targetA = useMemo(() => new THREE.Color(), [])
  const targetB = useMemo(() => new THREE.Color(), [])
  const targetC = useMemo(() => new THREE.Color(), [])
  const scratchMouse = useMemo(() => new THREE.Vector2(0.5, 0.5), [])

  useFrame((_, delta) => {
    const rawDt = Math.min(delta, 0.05)
    const dt = reducedMotion ? 0 : rawDt
    const { mouseX, mouseY, scrollProgress } = interactionRef.current

    focusFactorRef.current = THREE.MathUtils.lerp(
      focusFactorRef.current,
      heroFocus ? 1.0 : 0.0,
      0.055
    )
    const focus = focusFactorRef.current

    if (activeTheme) {
      targetA.setRGB(
        activeTheme.shaderPaletteA[0],
        activeTheme.shaderPaletteA[1],
        activeTheme.shaderPaletteA[2]
      )
      targetB.setRGB(
        activeTheme.shaderPaletteB[0],
        activeTheme.shaderPaletteB[1],
        activeTheme.shaderPaletteB[2]
      )
      targetC.setRGB(
        activeTheme.shaderPaletteC[0],
        activeTheme.shaderPaletteC[1],
        activeTheme.shaderPaletteC[2]
      )
    } else {
      targetA.copy(DEFAULT_COLOR_A)
      targetB.copy(DEFAULT_COLOR_B)
      targetC.copy(DEFAULT_COLOR_C)
    }

    if (matRef.current) {
      const u = matRef.current.uniforms
      u.uTime.value += dt
      scratchMouse.set(mouseX, 1.0 - mouseY)
      u.uMouse.value.lerp(scratchMouse, reducedMotion ? 0.04 : 0.08)
      u.uScroll.value = THREE.MathUtils.lerp(
        u.uScroll.value,
        scrollProgress,
        0.08
      )
      u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value,
        reducedMotion ? 0 : ambientPulse,
        0.1
      )
      u.uOpacity.value = THREE.MathUtils.lerp(0.22, 1.0, focus)
      u.uColorA.value.lerp(targetA, 0.05)
      u.uColorB.value.lerp(targetB, 0.05)
      u.uColorC.value.lerp(targetC, 0.05)
    }

    // Dynamically tint orbital rings from activeTheme & calm them when off-hero
    if (ring1MatRef.current) {
      ring1MatRef.current.color.lerp(targetA, 0.05)
      ring1MatRef.current.opacity = THREE.MathUtils.lerp(0.07, 0.34, focus)
    }
    if (ring2MatRef.current) {
      ring2MatRef.current.color.lerp(targetB, 0.05)
      ring2MatRef.current.opacity = THREE.MathUtils.lerp(0.06, 0.30, focus)
    }

    if (groupRef.current) {
      const isMobile = viewport.width < 6.5
      // Gracefully glide sculpture off-axis and deeper into Z when reading project chapters
      const heroX = isMobile ? viewport.width * 0.14 : viewport.width * 0.23
      const parkedX = isMobile ? viewport.width * 0.36 : viewport.width * 0.44
      const targetX =
        THREE.MathUtils.lerp(parkedX, heroX, focus) +
        (reducedMotion ? 0 : (mouseX - 0.5) * 0.38 * (0.4 + 0.6 * focus))

      const heroY = isMobile ? 0.45 : 0.12
      const parkedY = -0.35 - scrollProgress * 0.9
      const targetY =
        THREE.MathUtils.lerp(parkedY, heroY, focus) -
        (reducedMotion ? 0 : (mouseY - 0.5) * 0.28 * (0.4 + 0.6 * focus))

      const targetZ = THREE.MathUtils.lerp(-2.3, 0.0, focus)

      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.055
      )
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.055
      )
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetZ,
        0.055
      )

      groupRef.current.rotation.y += dt * (0.14 + 0.1 * focus)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        reducedMotion ? 0.18 : (mouseY - 0.5) * 0.48 * (0.35 + 0.65 * focus),
        0.05
      )

      const baseScale = isMobile ? 0.6 : 0.98
      const focusScale = THREE.MathUtils.lerp(0.56, 1.0, focus)
      const pulseBoost = reducedMotion ? 1.0 : 1.0 + ambientPulse * 0.035
      groupRef.current.scale.setScalar(baseScale * focusScale * pulseBoost)
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += dt * 0.16
      ring1Ref.current.rotation.x += dt * 0.08
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= dt * 0.19
      ring2Ref.current.rotation.z -= dt * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.38, icosaDetail]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={PRISM_VERTEX_SHADER}
          fragmentShader={PRISM_FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
        />
      </mesh>
      <mesh ref={ring1Ref} rotation={[0.8, 0.3, 0]}>
        <torusGeometry args={[1.95, 0.011, 12, lowPower ? 72 : 108]} />
        <meshBasicMaterial
          ref={ring1MatRef}
          color={DEFAULT_COLOR_A}
          transparent
          opacity={0.34}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-0.6, 0.9, 0.2]}>
        <torusGeometry args={[2.28, 0.008, 12, lowPower ? 72 : 108]} />
        <meshBasicMaterial
          ref={ring2MatRef}
          color={DEFAULT_COLOR_B}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

const SpatialParticles: React.FC<SceneProps> = ({
  activeTheme,
  interactionRef,
  reducedMotion,
  heroFocus,
  lowPower,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()

  const { positions, scales, phases } = useMemo(() => {
    const count = lowPower ? 90 : 180
    const pos = new Float32Array(count * 3)
    const scl = new Float32Array(count)
    const phs = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const s1 = Math.sin(i * 12.9898) * 43758.5453
      const s2 = Math.sin(i * 78.233) * 24634.6345
      const s3 = Math.sin(i * 45.164) * 19384.2314
      const rx = s1 - Math.floor(s1)
      const ry = s2 - Math.floor(s2)
      const rz = s3 - Math.floor(s3)

      pos[i * 3] = (rx - 0.5) * 13
      pos[i * 3 + 1] = (ry - 0.5) * 9
      pos[i * 3 + 2] = -rz * 5.5 - 0.5
      scl[i] = 1.35 + (i % 5) * 0.5
      phs[i] = i * 0.43
    }
    return { positions: pos, scales: scl, phases: phs }
  }, [lowPower])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), lowPower ? 1.25 : 2) },
      uOpacity: { value: heroFocus ? 1.0 : 0.45 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gl, lowPower]
  )

  // Hoisted scratch objects: zero per-frame allocations
  const targetA = useMemo(() => new THREE.Color(), [])
  const targetB = useMemo(() => new THREE.Color(), [])
  const scratchMouse = useMemo(() => new THREE.Vector2(0.5, 0.5), [])

  useFrame((_, delta) => {
    if (!matRef.current) return
    const dt = reducedMotion ? 0 : Math.min(delta, 0.05)
    const u = matRef.current.uniforms
    u.uTime.value += dt

    scratchMouse.set(
      interactionRef.current.mouseX,
      1.0 - interactionRef.current.mouseY
    )
    u.uMouse.value.lerp(scratchMouse, reducedMotion ? 0.04 : 0.08)
    u.uOpacity.value = THREE.MathUtils.lerp(
      u.uOpacity.value,
      heroFocus ? 1.0 : 0.42,
      0.05
    )

    if (activeTheme) {
      targetA.setRGB(
        activeTheme.shaderPaletteA[0],
        activeTheme.shaderPaletteA[1],
        activeTheme.shaderPaletteA[2]
      )
      targetB.setRGB(
        activeTheme.shaderPaletteB[0],
        activeTheme.shaderPaletteB[1],
        activeTheme.shaderPaletteB[2]
      )
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

const CSSFallbackBackdrop: React.FC<{ activeTheme: ProjectTheme | null }> = ({
  activeTheme,
}) => {
  const accent = activeTheme?.accentHex || '#2EFF7B'
  const secondary = activeTheme?.secondaryHex || '#8B3DFF'
  const tertiary = activeTheme?.tertiaryHex || '#163B7A'

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06070B]"
      aria-hidden="true"
    >
      <div
        className="absolute -top-44 -left-36 h-[560px] w-[560px] rounded-full opacity-25 blur-[135px] transition-colors duration-1000"
        style={{ background: accent }}
      />
      <div
        className="absolute right-[-12%] bottom-[-18%] h-[600px] w-[600px] rounded-full opacity-20 blur-[145px] transition-colors duration-1000"
        style={{ background: secondary }}
      />
      <div
        className="absolute top-[35%] left-[42%] h-[420px] w-[420px] rounded-full opacity-15 blur-[150px] transition-colors duration-1000"
        style={{ background: tertiary }}
      />
      <div
        className="absolute top-1/2 right-[8%] h-[360px] w-[360px] -translate-y-1/2 rounded-full border opacity-15 transition-colors duration-1000"
        style={{ borderColor: accent }}
      />
      <div className="halftone-grid absolute inset-0 opacity-45" />
    </div>
  )
}

export const ExperienceCanvas: React.FC<ExperienceCanvasProps> = ({
  activeTheme,
  reducedMotion,
  heroFocus = true,
  ambientPulse = 0,
}) => {
  const [webglReady, setWebglReady] = useState(false)
  const [lowPower, setLowPower] = useState(false)
  const [systemReducedMotion, setSystemReducedMotion] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  const [contextRestoredTick, setContextRestoredTick] = useState(0)
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  )

  const interactionRef = useRef<SharedInteractionRef>({
    mouseX: 0.5,
    mouseY: 0.5,
    mouseVelX: 0,
    mouseVelY: 0,
    speed: 0,
    scrollProgress: 0,
    scrollVel: 0,
  })

  useEffect(() => {
    setWebglReady(detectWebGLSupport())
    setLowPower(isLowPowerDevice())

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setSystemReducedMotion(mq.matches)
      const onChange = (e: MediaQueryListEvent) =>
        setSystemReducedMotion(e.matches)
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
      }
    }
    return undefined
  }, [])

  // Pause rendering when browser tab is hidden to save GPU/battery
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVisibilityChange = () => {
      setIsDocumentHidden(document.hidden)
    }
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  // WebGL context lost / restored recovery handlers
  useEffect(() => {
    if (!canvasElement) return
    const onContextLost = (e: Event) => {
      e.preventDefault()
      setContextLost(true)
    }
    const onContextRestored = () => {
      setContextLost(false)
      setContextRestoredTick((n) => n + 1)
    }
    canvasElement.addEventListener('webglcontextlost', onContextLost, false)
    canvasElement.addEventListener(
      'webglcontextrestored',
      onContextRestored,
      false
    )
    return () => {
      canvasElement.removeEventListener('webglcontextlost', onContextLost)
      canvasElement.removeEventListener(
        'webglcontextrestored',
        onContextRestored
      )
    }
  }, [canvasElement])

  // Pointer velocity, touch drag, and ResizeObserver-cached scroll tracking
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    let lastX = 0.5
    let lastY = 0.5
    let lastScrollY = window.scrollY
    let cachedMaxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    )

    const refreshMaxScroll = () => {
      cachedMaxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      )
    }

    const updatePointer = (clientX: number, clientY: number) => {
      const nx = clientX / Math.max(window.innerWidth, 1)
      const ny = clientY / Math.max(window.innerHeight, 1)
      const dx = nx - lastX
      const dy = ny - lastY

      const inter = interactionRef.current
      inter.mouseX = nx
      inter.mouseY = ny
      inter.mouseVelX = Math.max(-1.6, Math.min(1.6, inter.mouseVelX * 0.4 + dx * 22))
      inter.mouseVelY = Math.max(-1.6, Math.min(1.6, inter.mouseVelY * 0.4 + dy * 22))
      inter.speed = Math.min(1.8, Math.hypot(dx, dy) * 30)

      lastX = nx
      lastY = ny
    }

    const onMouseMove = (e: MouseEvent) => updatePointer(e.clientX, e.clientY)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        lastX = e.touches[0].clientX / Math.max(window.innerWidth, 1)
        lastY = e.touches[0].clientY / Math.max(window.innerHeight, 1)
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const onScroll = () => {
      const currentY = window.scrollY
      const dy = (currentY - lastScrollY) / Math.max(window.innerHeight, 1)
      lastScrollY = currentY

      const inter = interactionRef.current
      inter.scrollProgress = Math.max(
        0,
        Math.min(1, currentY / cachedMaxScroll)
      )
      inter.scrollVel = Math.max(
        -2.2,
        Math.min(2.2, inter.scrollVel * 0.45 + dy * 5.5)
      )
    }

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(refreshMaxScroll)
      resizeObserver.observe(document.documentElement)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', refreshMaxScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', refreshMaxScroll)
      resizeObserver?.disconnect()
    }
  }, [])

  const handleCanvasCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      setCanvasElement(gl.domElement)
    },
    []
  )

  const effectiveReducedMotion =
    reducedMotion !== undefined ? reducedMotion : systemReducedMotion

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
          frameloop={isDocumentHidden ? 'never' : 'always'}
          dpr={lowPower ? [1, 1.25] : [1, 1.75]}
          camera={{ position: [0, 0, 5.8], fov: 46 }}
          gl={{
            antialias: !lowPower,
            powerPreference: lowPower ? 'default' : 'high-performance',
            alpha: false,
          }}
          onCreated={handleCanvasCreated}
        >
          <AtmospherePlane
            activeTheme={activeTheme}
            interactionRef={interactionRef}
            reducedMotion={effectiveReducedMotion}
            heroFocus={heroFocus}
            ambientPulse={ambientPulse}
            lowPower={lowPower}
            contextRestoredTick={contextRestoredTick}
          />
          <SpatialParticles
            activeTheme={activeTheme}
            interactionRef={interactionRef}
            reducedMotion={effectiveReducedMotion}
            heroFocus={heroFocus}
            ambientPulse={ambientPulse}
            lowPower={lowPower}
            contextRestoredTick={contextRestoredTick}
          />
          <MemoryPrismSculpture
            activeTheme={activeTheme}
            interactionRef={interactionRef}
            reducedMotion={effectiveReducedMotion}
            heroFocus={heroFocus}
            ambientPulse={ambientPulse}
            lowPower={lowPower}
            contextRestoredTick={contextRestoredTick}
          />
        </Canvas>
        {contextLost && <CSSFallbackBackdrop activeTheme={activeTheme} />}
      </div>
    </WebGLErrorBoundary>
  )
}
