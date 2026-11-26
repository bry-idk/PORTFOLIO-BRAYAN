import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  ATMOSPHERE_FRAGMENT_SHADER,
  ATMOSPHERE_VERTEX_SHADER,
  BOKEH_FRAGMENT_SHADER,
  BOKEH_VERTEX_SHADER,
  CRYSTAL_CORE_FRAGMENT_SHADER,
  CRYSTAL_CORE_VERTEX_SHADER,
  HALO_RING_FRAGMENT_SHADER,
  HALO_RING_VERTEX_SHADER,
  ORBIT_EMBERS_FRAGMENT_SHADER,
  ORBIT_EMBERS_VERTEX_SHADER,
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

interface SculptureSyncRef {
  x: number
  y: number
  z: number
  scale: number
  focus: number
  scrollPhase: number
}

interface SceneProps {
  activeTheme: ProjectTheme | null
  interactionRef: React.MutableRefObject<SharedInteractionRef>
  sculptureSyncRef: React.MutableRefObject<SculptureSyncRef>
  reducedMotion: boolean
  heroFocus: boolean
  ambientPulse: number
  lowPower: boolean
  contextRestoredTick: number
}

const DEFAULT_COLOR_A = new THREE.Color(0.0, 1.0, 0.53) // Portfolio AR Neon Emerald (#00FF88)
const DEFAULT_COLOR_B = new THREE.Color(0.49, 0.23, 0.93) // Electric Violet (#7C3AED)
const DEFAULT_COLOR_C = new THREE.Color(0.16, 0.07, 0.34) // Portfolio AR Deep Violet Abyss

function assignThemeColors(
  activeTheme: ProjectTheme | null,
  targetA: THREE.Color,
  targetB: THREE.Color,
  targetC: THREE.Color
): void {
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
}

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
      uLowPower: { value: lowPower ? 1.0 : 0.0 },
      uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
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
    const simRes = lowPower ? 128 : 256
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
        uHeroFocus: { value: heroFocus ? 1.0 : 0.0 },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    u.uMouse.value.lerp(scratchMouse, reducedMotion ? 0.04 : 0.08)
    u.uPointerSpeed.value = THREE.MathUtils.lerp(
      u.uPointerSpeed.value,
      reducedMotion ? 0 : inter.speed,
      0.16
    )
    u.uLowPower.value = lowPower ? 1.0 : 0.0
    u.uReducedMotion.value = reducedMotion ? 1.0 : 0.0
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

    assignThemeColors(activeTheme, targetA, targetB, targetC)
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
      su.uHeroFocus.value = u.uHeroFocus.value

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

    // Smooth exponential impulse decay (~0.92 per 60Hz frame, matching Portfolio AR tactile glide)
    const pointerDecay = Math.pow(0.018, rawDt)
    const speedDecay = Math.pow(0.0067, rawDt * 0.5)
    const scrollDecay = Math.pow(0.04, rawDt)
    inter.mouseVelX *= pointerDecay
    inter.mouseVelY *= pointerDecay
    inter.speed *= speedDecay
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
  sculptureSyncRef,
  reducedMotion,
  heroFocus,
  ambientPulse,
  lowPower,
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const prismMatRef = useRef<THREE.ShaderMaterial>(null)
  const coreSolidRef = useRef<THREE.Mesh>(null)
  const coreWireRef = useRef<THREE.Mesh>(null)
  const coreSolidMatRef = useRef<THREE.ShaderMaterial>(null)
  const coreWireMatRef = useRef<THREE.ShaderMaterial>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const ring1MatRef = useRef<THREE.ShaderMaterial>(null)
  const ring2MatRef = useRef<THREE.ShaderMaterial>(null)
  const ring3MatRef = useRef<THREE.ShaderMaterial>(null)

  const focusFactorRef = useRef(heroFocus ? 1.0 : 0.0)
  const scrollPhaseRef = useRef(0)
  const { viewport } = useThree()

  const icosaDetail = lowPower ? 12 : 18
  const torusSegments = lowPower ? 72 : 128

  const prismUniforms = useMemo(
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

  const coreSolidUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uOpacity: { value: heroFocus ? 0.9 : 0.16 },
      uWireMode: { value: 0.0 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const coreWireUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uOpacity: { value: heroFocus ? 0.72 : 0.12 },
      uWireMode: { value: 1.0 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const ring1Uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uScrollPhase: { value: 0 },
      uPhaseOffset: { value: 0.12 },
      uOpacity: { value: heroFocus ? 0.85 : 0.12 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const ring2Uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uScrollPhase: { value: 0 },
      uPhaseOffset: { value: 0.58 },
      uOpacity: { value: heroFocus ? 0.78 : 0.1 },
      uColorA: { value: DEFAULT_COLOR_B.clone() },
      uColorB: { value: DEFAULT_COLOR_A.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const ring3Uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uScrollPhase: { value: 0 },
      uPhaseOffset: { value: 0.84 },
      uOpacity: { value: heroFocus ? 0.55 : 0.06 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_C.clone() },
      uColorC: { value: DEFAULT_COLOR_B.clone() },
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
    const { mouseX, mouseY, scrollProgress, scrollVel } = interactionRef.current

    focusFactorRef.current = THREE.MathUtils.lerp(
      focusFactorRef.current,
      heroFocus ? 1.0 : 0.0,
      0.055
    )
    const focus = focusFactorRef.current

    if (!reducedMotion) {
      scrollPhaseRef.current += scrollVel * rawDt * 2.2
    }

    assignThemeColors(activeTheme, targetA, targetB, targetC)
    scratchMouse.set(mouseX, 1.0 - mouseY)

    // Outer optical liquid-obsidian & dichroic crystal shell
    if (prismMatRef.current) {
      const u = prismMatRef.current.uniforms
      u.uTime.value += dt
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
      u.uOpacity.value = THREE.MathUtils.lerp(0.2, 1.0, focus)
      u.uColorA.value.lerp(targetA, 0.05)
      u.uColorB.value.lerp(targetB, 0.05)
      u.uColorC.value.lerp(targetC, 0.05)
    }

    // Nested inner crystalline core (solid translucent heart + geodesic wireframe)
    if (coreSolidMatRef.current) {
      const u = coreSolidMatRef.current.uniforms
      u.uTime.value += dt
      u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value,
        reducedMotion ? 0 : ambientPulse,
        0.1
      )
      u.uOpacity.value = THREE.MathUtils.lerp(0.14, 0.92, focus)
      u.uColorA.value.lerp(targetA, 0.05)
      u.uColorB.value.lerp(targetB, 0.05)
      u.uColorC.value.lerp(targetC, 0.05)
    }

    if (coreWireMatRef.current) {
      const u = coreWireMatRef.current.uniforms
      u.uTime.value += dt
      u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value,
        reducedMotion ? 0 : ambientPulse,
        0.1
      )
      u.uOpacity.value = THREE.MathUtils.lerp(0.08, 0.74, focus)
      u.uColorA.value.lerp(targetA, 0.05)
      u.uColorB.value.lerp(targetB, 0.05)
      u.uColorC.value.lerp(targetC, 0.05)
    }

    // Volumetric custom GLSL orbital halo rings
    if (ring1MatRef.current) {
      const u = ring1MatRef.current.uniforms
      u.uTime.value += dt
      u.uScrollPhase.value = scrollPhaseRef.current
      u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value,
        reducedMotion ? 0 : ambientPulse,
        0.1
      )
      u.uOpacity.value = THREE.MathUtils.lerp(0.1, 0.88, focus)
      u.uColorA.value.lerp(targetA, 0.05)
      u.uColorB.value.lerp(targetB, 0.05)
      u.uColorC.value.lerp(targetC, 0.05)
    }

    if (ring2MatRef.current) {
      const u = ring2MatRef.current.uniforms
      u.uTime.value += dt
      u.uScrollPhase.value = -scrollPhaseRef.current
      u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value,
        reducedMotion ? 0 : ambientPulse,
        0.1
      )
      u.uOpacity.value = THREE.MathUtils.lerp(0.08, 0.78, focus)
      u.uColorA.value.lerp(targetB, 0.05)
      u.uColorB.value.lerp(targetA, 0.05)
      u.uColorC.value.lerp(targetC, 0.05)
    }

    if (ring3MatRef.current) {
      const u = ring3MatRef.current.uniforms
      u.uTime.value += dt
      u.uScrollPhase.value = scrollPhaseRef.current * 0.75
      u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value,
        reducedMotion ? 0 : ambientPulse,
        0.1
      )
      u.uOpacity.value = THREE.MathUtils.lerp(0.05, 0.56, focus)
      u.uColorA.value.lerp(targetA, 0.05)
      u.uColorB.value.lerp(targetC, 0.05)
      u.uColorC.value.lerp(targetB, 0.05)
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
      const finalScale = baseScale * focusScale * pulseBoost
      groupRef.current.scale.setScalar(finalScale)

      // Publish synchronized sculpture transform for Tier 2 Orbital Embers (zero allocations)
      const sync = sculptureSyncRef.current
      sync.x = groupRef.current.position.x
      sync.y = groupRef.current.position.y
      sync.z = groupRef.current.position.z
      sync.scale = finalScale
      sync.focus = focus
      sync.scrollPhase = scrollPhaseRef.current
    }

    // Counter-rotating inner crystalline core
    if (coreSolidRef.current) {
      coreSolidRef.current.rotation.y -= dt * 0.34
      coreSolidRef.current.rotation.x += dt * 0.19
      coreSolidRef.current.rotation.z -= dt * 0.11
    }
    if (coreWireRef.current) {
      coreWireRef.current.rotation.y -= dt * 0.24
      coreWireRef.current.rotation.z += dt * 0.16
    }

    // Orbital halo rings precession
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += dt * 0.16
      ring1Ref.current.rotation.x += dt * 0.075
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= dt * 0.19
      ring2Ref.current.rotation.z -= dt * 0.095
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= dt * 0.11
      ring3Ref.current.rotation.y += dt * 0.14
    }
  })

  return (
    <group ref={groupRef}>
      {/* Nested Inner Translucent Faceted Crystalline Core */}
      <mesh ref={coreSolidRef} renderOrder={1}>
        <octahedronGeometry args={[0.76, 1]} />
        <shaderMaterial
          ref={coreSolidMatRef}
          vertexShader={CRYSTAL_CORE_VERTEX_SHADER}
          fragmentShader={CRYSTAL_CORE_FRAGMENT_SHADER}
          uniforms={coreSolidUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Counter-Rotating Geodesic Edge-Glow Lattice */}
      <mesh ref={coreWireRef} renderOrder={1}>
        <icosahedronGeometry args={[0.98, 1]} />
        <shaderMaterial
          ref={coreWireMatRef}
          vertexShader={CRYSTAL_CORE_VERTEX_SHADER}
          fragmentShader={CRYSTAL_CORE_FRAGMENT_SHADER}
          uniforms={coreWireUniforms}
          transparent
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Optical Liquid Obsidian & Dichroic Crystal Shell */}
      <mesh renderOrder={2}>
        <icosahedronGeometry args={[1.38, icosaDetail]} />
        <shaderMaterial
          ref={prismMatRef}
          vertexShader={PRISM_VERTEX_SHADER}
          fragmentShader={PRISM_FRAGMENT_SHADER}
          uniforms={prismUniforms}
          transparent
          depthWrite
        />
      </mesh>

      {/* Volumetric Orbital Halo Ring 1 */}
      <mesh ref={ring1Ref} rotation={[0.82, 0.28, 0]} renderOrder={3}>
        <torusGeometry args={[1.95, 0.021, 16, torusSegments]} />
        <shaderMaterial
          ref={ring1MatRef}
          vertexShader={HALO_RING_VERTEX_SHADER}
          fragmentShader={HALO_RING_FRAGMENT_SHADER}
          uniforms={ring1Uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Volumetric Orbital Halo Ring 2 */}
      <mesh ref={ring2Ref} rotation={[-0.62, 0.92, 0.22]} renderOrder={3}>
        <torusGeometry args={[2.28, 0.016, 16, torusSegments]} />
        <shaderMaterial
          ref={ring2MatRef}
          vertexShader={HALO_RING_VERTEX_SHADER}
          fragmentShader={HALO_RING_FRAGMENT_SHADER}
          uniforms={ring2Uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Desktop Precision Outer Equatorial Telemetry Ring */}
      {!lowPower && (
        <mesh ref={ring3Ref} rotation={[1.28, -0.42, 0.55]} renderOrder={3}>
          <torusGeometry args={[2.58, 0.011, 12, torusSegments]} />
          <shaderMaterial
            ref={ring3MatRef}
            vertexShader={HALO_RING_VERTEX_SHADER}
            fragmentShader={HALO_RING_FRAGMENT_SHADER}
            uniforms={ring3Uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}

function deterministicHash(seed: number): number {
  const s = Math.sin(seed) * 43758.5453123
  return s - Math.floor(s)
}

const SpatialParticles: React.FC<SceneProps> = ({
  activeTheme,
  interactionRef,
  sculptureSyncRef,
  reducedMotion,
  heroFocus,
  ambientPulse,
  lowPower,
}) => {
  const motesMatRef = useRef<THREE.ShaderMaterial>(null)
  const embersMatRef = useRef<THREE.ShaderMaterial>(null)
  const bokehMatRef = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()

  // Tier 1: Curl-Noise Micro-Motes & Starlight Sparks (1300 desktop / 480 low-power)
  const tier1Data = useMemo(() => {
    const count = lowPower ? 480 : 1300
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const phases = new Float32Array(count)
    const randoms = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const rx = deterministicHash(i * 12.9898 + 1.1)
      const ry = deterministicHash(i * 78.233 + 2.3)
      const rz = deterministicHash(i * 45.164 + 3.7)
      const rA = deterministicHash(i * 93.719 + 4.9)
      const rB = deterministicHash(i * 37.513 + 5.4)
      const rC = deterministicHash(i * 61.347 + 6.8)

      positions[i * 3] = (rx - 0.5) * 14.5
      positions[i * 3 + 1] = (ry - 0.5) * 10.5
      positions[i * 3 + 2] = -rz * 6.4 + 0.6

      // Crisp micro-dust motes & luminous starlight glints
      scales[i] = rC > 0.82 ? 2.6 + rA * 1.55 : 0.95 + rA * 1.55
      phases[i] = i * 0.37
      randoms[i * 3] = rA
      randoms[i * 3 + 1] = rB
      randoms[i * 3 + 2] = rC
    }
    return { positions, scales, phases, randoms }
  }, [lowPower])

  // Tier 2: Orbital Sculpture Embers (340 desktop / 140 low-power)
  const tier2Data = useMemo(() => {
    const count = lowPower ? 140 : 340
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const phases = new Float32Array(count)
    const randoms = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const rR = deterministicHash(i * 19.317 + 11.2)
      const rAngle = deterministicHash(i * 53.719 + 13.4)
      const rTilt = deterministicHash(i * 81.241 + 17.6)
      const rSpeed = deterministicHash(i * 29.913 + 19.8)
      const rHelix = deterministicHash(i * 67.423 + 23.1)
      const rColor = deterministicHash(i * 41.887 + 29.5)

      // Packed orbital parameters: majorRadius, baseAngle, inclinationTilt
      positions[i * 3] = 1.62 + rR * 1.28
      positions[i * 3 + 1] = rAngle * Math.PI * 2
      positions[i * 3 + 2] = (rTilt - 0.5) * 2.15

      scales[i] = 1.05 + rColor * 1.75
      phases[i] = i * 0.61
      randoms[i * 3] = rSpeed
      randoms[i * 3 + 1] = rHelix
      randoms[i * 3 + 2] = rColor
    }
    return { positions, scales, phases, randoms }
  }, [lowPower])

  // Tier 3: Cinematic Optical Bokeh Orbs (46 desktop / 24 low-power)
  const tier3Data = useMemo(() => {
    const count = lowPower ? 24 : 46
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const phases = new Float32Array(count)
    const randoms = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const rx = deterministicHash(i * 31.173 + 41.3)
      const ry = deterministicHash(i * 63.841 + 47.7)
      const rDepth = deterministicHash(i * 89.419 + 53.9)
      const rTint = deterministicHash(i * 17.659 + 59.1)
      const rRing = deterministicHash(i * 71.293 + 61.7)

      const isForeground = i % 3 === 0
      positions[i * 3] = (rx - 0.5) * 13.0
      positions[i * 3 + 1] = (ry - 0.5) * 10.0
      // Split between close soft foreground orbs and deep atmospheric background orbs
      positions[i * 3 + 2] = isForeground
        ? 1.1 + rDepth * 1.35
        : -2.6 - rDepth * 3.8

      scales[i] = isForeground ? 4.2 + rRing * 3.8 : 3.2 + rRing * 3.6
      phases[i] = i * 1.17
      randoms[i * 3] = rTint
      randoms[i * 3 + 1] = isForeground ? 0.85 : 0.35
      randoms[i * 3 + 2] = rRing
    }
    return { positions, scales, phases, randoms }
  }, [lowPower])

  const cappedPixelRatio = Math.min(gl.getPixelRatio(), lowPower ? 1.25 : 2)

  const motesUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerSpeed: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: cappedPixelRatio },
      uOpacity: { value: heroFocus ? 1.0 : 0.80 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cappedPixelRatio]
  )

  const embersUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollPhase: { value: 0 },
      uPulse: { value: 0 },
      uSculpturePos: { value: new THREE.Vector3(1.4, 0.12, 0) },
      uSculptureScale: { value: 0.95 },
      uPixelRatio: { value: cappedPixelRatio },
      uOpacity: { value: heroFocus ? 0.95 : 0.18 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cappedPixelRatio]
  )

  const bokehUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uPixelRatio: { value: cappedPixelRatio },
      uOpacity: { value: heroFocus ? 1.0 : 0.78 },
      uColorA: { value: DEFAULT_COLOR_A.clone() },
      uColorB: { value: DEFAULT_COLOR_B.clone() },
      uColorC: { value: DEFAULT_COLOR_C.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cappedPixelRatio]
  )

  // Hoisted scratch objects: zero per-frame allocations
  const targetA = useMemo(() => new THREE.Color(), [])
  const targetB = useMemo(() => new THREE.Color(), [])
  const targetC = useMemo(() => new THREE.Color(), [])
  const scratchMouse = useMemo(() => new THREE.Vector2(0.5, 0.5), [])

  useFrame((_, delta) => {
    const dt = reducedMotion ? 0 : Math.min(delta, 0.05)
    const inter = interactionRef.current
    const sync = sculptureSyncRef.current

    scratchMouse.set(inter.mouseX, 1.0 - inter.mouseY)
    assignThemeColors(activeTheme, targetA, targetB, targetC)

    // Tier 1: Curl-noise micro-motes & starlight sparks
    if (motesMatRef.current) {
      const u = motesMatRef.current.uniforms
      u.uTime.value += dt
      u.uMouse.value.lerp(scratchMouse, reducedMotion ? 0.04 : 0.1)
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
      u.uOpacity.value = THREE.MathUtils.lerp(
        u.uOpacity.value,
        heroFocus ? 1.0 : 0.80,
        0.05
      )
      u.uColorA.value.lerp(targetA, 0.04)
      u.uColorB.value.lerp(targetB, 0.04)
      u.uColorC.value.lerp(targetC, 0.04)
    }

    // Tier 2: Orbital sculpture embers synchronized to live sculpture transform
    if (embersMatRef.current) {
      const u = embersMatRef.current.uniforms
      u.uTime.value += dt
      u.uScrollPhase.value = sync.scrollPhase
      u.uPulse.value = THREE.MathUtils.lerp(
        u.uPulse.value,
        reducedMotion ? 0 : ambientPulse,
        0.1
      )
      u.uSculpturePos.value.set(sync.x, sync.y, sync.z)
      u.uSculptureScale.value = sync.scale
      u.uOpacity.value = THREE.MathUtils.lerp(0.18, 0.98, sync.focus)
      u.uColorA.value.lerp(targetA, 0.045)
      u.uColorB.value.lerp(targetB, 0.045)
      u.uColorC.value.lerp(targetC, 0.045)
    }

    // Tier 3: Cinematic optical bokeh orbs
    if (bokehMatRef.current) {
      const u = bokehMatRef.current.uniforms
      u.uTime.value += dt
      u.uMouse.value.lerp(scratchMouse, reducedMotion ? 0.03 : 0.06)
      u.uScroll.value = THREE.MathUtils.lerp(
        u.uScroll.value,
        inter.scrollProgress,
        0.06
      )
      u.uOpacity.value = THREE.MathUtils.lerp(
        u.uOpacity.value,
        heroFocus ? 1.0 : 0.78,
        0.045
      )
      u.uColorA.value.lerp(targetA, 0.035)
      u.uColorB.value.lerp(targetB, 0.035)
      u.uColorC.value.lerp(targetC, 0.035)
    }
  })

  return (
    <group>
      {/* Tier 3: Cinematic Optical Aperture Bokeh Orbs */}
      <points frustumCulled={false} renderOrder={-2}>
        <bufferGeometry key={lowPower ? 'bokeh-low' : 'bokeh-high'}>
          <bufferAttribute
            attach="attributes-position"
            count={tier3Data.positions.length / 3}
            array={tier3Data.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={tier3Data.scales.length}
            array={tier3Data.scales}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aPhase"
            count={tier3Data.phases.length}
            array={tier3Data.phases}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aRandom"
            count={tier3Data.randoms.length / 3}
            array={tier3Data.randoms}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={bokehMatRef}
          vertexShader={BOKEH_VERTEX_SHADER}
          fragmentShader={BOKEH_FRAGMENT_SHADER}
          uniforms={bokehUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Tier 1: Curl-Noise Micro-Motes & Starlight Sparks */}
      <points frustumCulled={false} renderOrder={0}>
        <bufferGeometry key={lowPower ? 'motes-low' : 'motes-high'}>
          <bufferAttribute
            attach="attributes-position"
            count={tier1Data.positions.length / 3}
            array={tier1Data.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={tier1Data.scales.length}
            array={tier1Data.scales}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aPhase"
            count={tier1Data.phases.length}
            array={tier1Data.phases}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aRandom"
            count={tier1Data.randoms.length / 3}
            array={tier1Data.randoms}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={motesMatRef}
          vertexShader={PARTICLES_VERTEX_SHADER}
          fragmentShader={PARTICLES_FRAGMENT_SHADER}
          uniforms={motesUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Tier 2: Orbital Sculpture Embers */}
      <points frustumCulled={false} renderOrder={3}>
        <bufferGeometry key={lowPower ? 'embers-low' : 'embers-high'}>
          <bufferAttribute
            attach="attributes-position"
            count={tier2Data.positions.length / 3}
            array={tier2Data.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={tier2Data.scales.length}
            array={tier2Data.scales}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aPhase"
            count={tier2Data.phases.length}
            array={tier2Data.phases}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aRandom"
            count={tier2Data.randoms.length / 3}
            array={tier2Data.randoms}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={embersMatRef}
          vertexShader={ORBIT_EMBERS_VERTEX_SHADER}
          fragmentShader={ORBIT_EMBERS_FRAGMENT_SHADER}
          uniforms={embersUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
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

  const sculptureSyncRef = useRef<SculptureSyncRef>({
    x: 1.4,
    y: 0.12,
    z: 0,
    scale: 0.98,
    focus: heroFocus ? 1.0 : 0.0,
    scrollPhase: 0,
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
      inter.speed = Math.min(1.2, inter.speed + Math.hypot(dx, dy) * 3.8)

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
            sculptureSyncRef={sculptureSyncRef}
            reducedMotion={effectiveReducedMotion}
            heroFocus={heroFocus}
            ambientPulse={ambientPulse}
            lowPower={lowPower}
            contextRestoredTick={contextRestoredTick}
          />
          <MemoryPrismSculpture
            activeTheme={activeTheme}
            interactionRef={interactionRef}
            sculptureSyncRef={sculptureSyncRef}
            reducedMotion={effectiveReducedMotion}
            heroFocus={heroFocus}
            ambientPulse={ambientPulse}
            lowPower={lowPower}
            contextRestoredTick={contextRestoredTick}
          />
          <SpatialParticles
            activeTheme={activeTheme}
            interactionRef={interactionRef}
            sculptureSyncRef={sculptureSyncRef}
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
