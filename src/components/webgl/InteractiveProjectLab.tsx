import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  LAB_FRAGMENT_SHADER,
  LAB_VERTEX_SHADER,
} from '../../shaders/projectLabShaders'
import { Lang, ProjectData } from '../../types/portfolio'
import { playHoverTick, playLaneNote } from '../../utils/synthAudio'
import { detectWebGLSupport, isLowPowerDevice } from '../../utils/webglSupport'

export interface InteractiveProjectLabProps {
  project: ProjectData
  lang: Lang
  soundEnabled?: boolean
}

const MODE_INDEX: Record<ProjectData['theme']['labMode'], number> = {
  palenque: 0,
  kane: 1,
  sogno: 2,
  notas: 3,
  tadc2: 4,
  reminiscencia: 5,
  vestigio: 6,
}

const LAB_TEXTURES: Record<
  ProjectData['theme']['labMode'],
  { label: { en: string; es: string }; src: string }[]
> = {
  palenque: [
    {
      label: { en: 'Main Hall', es: 'Salón Principal' },
      src: '/media/projects/palenque/hero-hall.webp',
    },
    {
      label: { en: 'Sunlit Canopy', es: 'Bosque Dorado' },
      src: '/media/projects/palenque/forest-sunlit.webp',
    },
    {
      label: { en: 'Night Forest', es: 'Bosque Nocturno' },
      src: '/media/projects/palenque/gallery-night-forest.webp',
    },
  ],
  kane: [
    {
      label: { en: 'Sakura & Geisha', es: 'Sakura y Geisha' },
      src: '/media/projects/kane-no-hibiki/facade-sakura-geisha.webp',
    },
    {
      label: { en: 'Koi Waves', es: 'Olas y Koi' },
      src: '/media/projects/kane-no-hibiki/facade-koi.webp',
    },
    {
      label: { en: 'Dragon & Scroll', es: 'Dragón y Pergamino' },
      src: '/media/projects/kane-no-hibiki/facade-dragon-purple.webp',
    },
  ],
  sogno: [
    {
      label: { en: 'AR LiDAR Room', es: 'Maqueta LiDAR AR' },
      src: '/media/projects/sogno/ar-room-surface.webp',
    },
    {
      label: { en: 'Editorial Cover', es: 'Portada Editorial' },
      src: '/media/projects/sogno/portada-alterna.webp',
    },
  ],
  notas: [
    {
      label: { en: '4-Lane Track', es: 'Pista 4 Carriles' },
      src: '/media/projects/notas-y-colores/lane-runner.webp',
    },
    {
      label: { en: 'Sunset Avenue', es: 'Avenida Atardecer' },
      src: '/media/projects/notas-y-colores/town-sunset.webp',
    },
  ],
  tadc2: [
    {
      label: { en: 'Void Glitch', es: 'Grieta del Vacío' },
      src: '/media/projects/tadc2/void-hands.webp',
    },
    {
      label: { en: 'Circus Hall', es: 'Salón del Circo' },
      src: '/media/projects/tadc2/scene-circus-hall.webp',
    },
    {
      label: { en: 'Stage Error', es: 'Error Escenario' },
      src: '/media/projects/tadc2/scene-caine-stage.webp',
    },
  ],
  reminiscencia: [
    {
      label: { en: 'Cyber Memory Hall', es: 'Salón de Memoria' },
      src: '/media/projects/reminiscencia/cyber-hall.webp',
    },
    {
      label: { en: 'Pyramid Chamber', es: 'Cámara de Pirámides' },
      src: '/media/projects/reminiscencia/pyramid-chamber.webp',
    },
    {
      label: { en: 'Gravity Room', es: 'Habitación Invertida' },
      src: '/media/projects/reminiscencia/gravity-room.webp',
    },
    {
      label: { en: 'CRT Cover', es: 'Portada CRT' },
      src: '/media/projects/reminiscencia/portada.webp',
    },
  ],
  vestigio: [
    {
      label: { en: 'Sacred Vessel', es: 'Vasija Sagrada' },
      src: '/media/projects/vestigio/portada.webp',
    },
    {
      label: { en: 'Exhibition Wall', es: 'Muro de Exhibición' },
      src: '/media/projects/vestigio/exhibition-wall.webp',
    },
  ],
}

const NOTAS_LANES = [
  { key: 'D', label: 'DO / C4', color: '#4ADE80' },
  { key: 'F', label: 'MI / E4', color: '#EC4899' },
  { key: 'J', label: 'SOL / G4', color: '#FACC15' },
  { key: 'K', label: 'DO5 / C5', color: '#22D3EE' },
]

const MODE_TELEMETRY: Record<ProjectData['theme']['labMode'], string> = {
  palenque: 'VOL · RAYS',
  kane: 'OSC · SONAR',
  sogno: 'LIDAR · 3X3',
  notas: 'SYNTH · 4CH',
  tadc2: 'CRT · SYNC',
  reminiscencia: 'VHS · ECHO',
  vestigio: 'LATHE · PBR',
}

const CROSSFADE_MS = 350

interface LabWebGLRuntime {
  uniforms: {
    uTexture: { value: THREE.Texture | null }
    uPrevTexture: { value: THREE.Texture | null }
    uHasTexture: { value: number }
    uHasPrevTexture: { value: number }
    uMix: { value: number }
    uTime: { value: number }
    uMouse: { value: THREE.Vector2 }
    uResolution: { value: THREE.Vector2 }
    uMode: { value: number }
    uParamA: { value: number }
    uBeatLanes: { value: THREE.Vector4 }
  }
  loader: THREE.TextureLoader
  currentTexture: THREE.Texture | null
  prevTexture: THREE.Texture | null
  crossfadeStartMs: number
  crossfading: boolean
  disposed: boolean
}

export const InteractiveProjectLab: React.FC<InteractiveProjectLabProps> = ({
  project,
  lang,
  soundEnabled = false,
}) => {
  const mode = project.theme.labMode
  const presets = LAB_TEXTURES[mode]
  const defaultParamA = mode === 'kane' ? 0.55 : mode === 'palenque' ? 0.62 : 0.45

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const runtimeRef = useRef<LabWebGLRuntime | null>(null)
  const loadTokenRef = useRef(0)
  const lastKaneSyncMsRef = useRef(0)
  const lastNoteHitMsRef = useRef(0)
  const laneTimersRef = useRef<Array<number | null>>([null, null, null, null])

  const [inView, setInView] = useState(false)
  const [webglOk] = useState(() => detectWebGLSupport())
  const [lowPower] = useState(() => isLowPowerDevice())
  const [contextLost, setContextLost] = useState(false)
  const [restoreCount, setRestoreCount] = useState(0)
  const [presetIdx, setPresetIdx] = useState(0)

  // Interactive parameters per project mode
  const [paramA, setParamA] = useState(defaultParamA)
  const [activeLanes, setActiveLanes] = useState<
    [number, number, number, number]
  >([0, 0, 0, 0])
  const [lastTriggerLabel, setLastTriggerLabel] = useState<string>('')
  const [comboStreak, setComboStreak] = useState(0)

  const stateRef = useRef({
    mouseX: 0.5,
    mouseY: 0.5,
    paramA: defaultParamA,
    lanes: new THREE.Vector4(0, 0, 0, 0),
  })

  useEffect(() => {
    stateRef.current.paramA = paramA
  }, [paramA])

  // Clear pending pad highlight timers on unmount
  useEffect(() => {
    return () => {
      laneTimersRef.current.forEach((timer) => {
        if (timer !== null) window.clearTimeout(timer)
      })
    }
  }, [])

  // IntersectionObserver to mount WebGL only when near viewport (conserves GPU contexts)
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInView(entry.isIntersecting)
        })
      },
      { rootMargin: '320px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const triggerBeatLane = useCallback((laneIndex: number) => {
    playLaneNote(laneIndex)
    const vec = stateRef.current.lanes
    if (laneIndex === 0) vec.x = 1.0
    if (laneIndex === 1) vec.y = 1.0
    if (laneIndex === 2) vec.z = 1.0
    if (laneIndex === 3) vec.w = 1.0

    const nowMs =
      typeof performance !== 'undefined' ? performance.now() : Date.now()
    const withinComboWindow = nowMs - lastNoteHitMsRef.current < 1800
    lastNoteHitMsRef.current = nowMs
    setComboStreak((prev) => (withinComboWindow ? prev + 1 : 1))

    setActiveLanes((prev) => {
      const next: [number, number, number, number] = [...prev] as [
        number,
        number,
        number,
        number,
      ]
      next[laneIndex] = 1
      return next
    })
    setLastTriggerLabel(
      `${NOTAS_LANES[laneIndex].key} · ${NOTAS_LANES[laneIndex].label}`
    )

    const existingTimer = laneTimersRef.current[laneIndex]
    if (existingTimer !== null) {
      window.clearTimeout(existingTimer)
    }
    laneTimersRef.current[laneIndex] = window.setTimeout(() => {
      laneTimersRef.current[laneIndex] = null
      setActiveLanes((prev) => {
        const next: [number, number, number, number] = [...prev] as [
          number,
          number,
          number,
          number,
        ]
        next[laneIndex] = 0
        return next
      })
    }, 180)
  }, [])

  // Keyboard support for Notas y Colores when lab is in view
  useEffect(() => {
    if (mode !== 'notas' || !inView) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      const k = e.key.toLowerCase()
      if (k === 'd') triggerBeatLane(0)
      if (k === 'f') triggerBeatLane(1)
      if (k === 'j') triggerBeatLane(2)
      if (k === 'k') triggerBeatLane(3)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, inView, triggerBeatLane])

  const activeTextureSrc = presets[presetIdx]?.src || presets[0].src

  // Effect 1: Persistent WebGLRenderer lifecycle (decoupled from activeTextureSrc so preset switches NEVER rebuild the WebGL context)
  useEffect(() => {
    if (!inView || !webglOk || !canvasHostRef.current) return
    const host = canvasHostRef.current

    let renderer: THREE.WebGLRenderer | null = null
    let rafId = 0
    let paused = typeof document !== 'undefined' ? document.hidden : false
    let lost = false

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !lowPower,
        alpha: false,
        powerPreference: lowPower ? 'default' : 'high-performance',
      })
    } catch {
      return
    }

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2)
    )
    const width = Math.max(host.clientWidth, 320)
    const height = Math.max(host.clientHeight, 220)
    renderer.setSize(width, height, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    host.innerHTML = ''
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms: LabWebGLRuntime['uniforms'] = {
      uTexture: { value: null },
      uPrevTexture: { value: null },
      uHasTexture: { value: 0 },
      uHasPrevTexture: { value: 0 },
      uMix: { value: 1 },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(width, height) },
      uMode: { value: MODE_INDEX[mode] },
      uParamA: { value: stateRef.current.paramA },
      uBeatLanes: { value: new THREE.Vector4(0, 0, 0, 0) },
    }

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: LAB_VERTEX_SHADER,
      fragmentShader: LAB_FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const runtime: LabWebGLRuntime = {
      uniforms,
      loader: new THREE.TextureLoader(),
      currentTexture: null,
      prevTexture: null,
      crossfadeStartMs: 0,
      crossfading: false,
      disposed: false,
    }
    runtimeRef.current = runtime

    // Hoisted scratch Vector2: zero per-frame GC allocations
    const targetMouse = new THREE.Vector2(0.5, 0.5)
    const clock = new THREE.Clock()

    const renderLoop = () => {
      if (runtime.disposed || !renderer || paused || lost) {
        rafId = 0
        return
      }

      const dt = Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value += dt

      targetMouse.set(stateRef.current.mouseX, 1.0 - stateRef.current.mouseY)
      uniforms.uMouse.value.lerp(targetMouse, 0.14)
      uniforms.uParamA.value = THREE.MathUtils.lerp(
        uniforms.uParamA.value,
        stateRef.current.paramA,
        0.12
      )

      // Smooth 350ms cubic ease-out preset crossfade + automatic old texture disposal
      if (runtime.crossfading) {
        const elapsed = performance.now() - runtime.crossfadeStartMs
        const rawT = Math.min(1, Math.max(0, elapsed / CROSSFADE_MS))
        const easedT = 1 - Math.pow(1 - rawT, 3)
        uniforms.uMix.value = easedT

        if (rawT >= 1) {
          runtime.crossfading = false
          uniforms.uMix.value = 1
          uniforms.uHasPrevTexture.value = 0
          uniforms.uPrevTexture.value = null
          if (runtime.prevTexture) {
            runtime.prevTexture.dispose()
            runtime.prevTexture = null
          }
        }
      }

      // Smooth decay for Notas y Colores lane pulses
      stateRef.current.lanes.multiplyScalar(Math.pow(0.06, dt))
      uniforms.uBeatLanes.value.copy(stateRef.current.lanes)

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(renderLoop)
    }

    const startLoop = () => {
      if (!runtime.disposed && !paused && !lost && rafId === 0) {
        clock.getDelta()
        rafId = requestAnimationFrame(renderLoop)
      }
    }

    const stopLoop = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    }

    const onVisibilityChange = () => {
      paused = document.hidden
      if (paused) {
        stopLoop()
      } else {
        startLoop()
      }
    }

    const onContextLost = (e: Event) => {
      e.preventDefault()
      lost = true
      setContextLost(true)
      stopLoop()
    }

    const onContextRestored = () => {
      lost = false
      setContextLost(false)
      setRestoreCount((n) => n + 1)
      startLoop()
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (!renderer || runtime.disposed) return
      const rect = entries[0]?.contentRect
      if (!rect || rect.width < 10 || rect.height < 10) return
      renderer.setSize(rect.width, rect.height, false)
      uniforms.uResolution.value.set(rect.width, rect.height)
    })
    resizeObserver.observe(host)

    document.addEventListener('visibilitychange', onVisibilityChange)
    renderer.domElement.addEventListener(
      'webglcontextlost',
      onContextLost,
      false
    )
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      onContextRestored,
      false
    )

    setContextLost(false)
    startLoop()

    return () => {
      runtime.disposed = true
      runtimeRef.current = null
      stopLoop()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (renderer) {
        renderer.domElement.removeEventListener(
          'webglcontextlost',
          onContextLost
        )
        renderer.domElement.removeEventListener(
          'webglcontextrestored',
          onContextRestored
        )
      }
      geometry.dispose()
      material.dispose()
      if (runtime.currentTexture) {
        runtime.currentTexture.dispose()
        runtime.currentTexture = null
      }
      if (runtime.prevTexture) {
        runtime.prevTexture.dispose()
        runtime.prevTexture = null
      }
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement)
        }
      }
    }
  }, [inView, webglOk, mode, lowPower])

  // Effect 2: Hot-swap preset texture into persistent shader with smooth 350ms GLSL crossfade
  useEffect(() => {
    const runtime = runtimeRef.current
    if (!inView || !webglOk || !runtime || runtime.disposed) return

    const token = ++loadTokenRef.current
    runtime.loader.load(activeTextureSrc, (loaded) => {
      if (runtime.disposed || token !== loadTokenRef.current) {
        loaded.dispose()
        return
      }
      loaded.minFilter = THREE.LinearFilter
      loaded.magFilter = THREE.LinearFilter
      loaded.generateMipmaps = false

      if (runtime.currentTexture) {
        if (runtime.prevTexture) {
          runtime.prevTexture.dispose()
        }
        runtime.prevTexture = runtime.currentTexture
        runtime.currentTexture = loaded

        runtime.uniforms.uPrevTexture.value = runtime.prevTexture
        runtime.uniforms.uHasPrevTexture.value = 1
        runtime.uniforms.uTexture.value = loaded
        runtime.uniforms.uHasTexture.value = 1
        runtime.uniforms.uMix.value = 0
        runtime.crossfadeStartMs = performance.now()
        runtime.crossfading = true
      } else {
        runtime.currentTexture = loaded
        runtime.uniforms.uTexture.value = loaded
        runtime.uniforms.uHasTexture.value = 1
        runtime.uniforms.uHasPrevTexture.value = 0
        runtime.uniforms.uMix.value = 1
        runtime.crossfading = false
      }
    })
  }, [inView, webglOk, mode, activeTextureSrc, restoreCount])

  const handlePointer = (clientX: number, clientY: number) => {
    const el = canvasHostRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    stateRef.current.mouseX = x
    stateRef.current.mouseY = y

    // For Kane no Hibiki, horizontal position simulates ultrasonic foot-traffic sensor.
    // Update ref immediately for 60fps shader smoothness; throttle React HUD state sync.
    if (mode === 'kane') {
      const prox = Math.max(
        0,
        Math.min(1, Number((1 - Math.abs(x - 0.5) * 1.6).toFixed(2)))
      )
      stateRef.current.paramA = prox
      const nowMs =
        typeof performance !== 'undefined' ? performance.now() : Date.now()
      if (nowMs - lastKaneSyncMsRef.current >= 55) {
        lastKaneSyncMsRef.current = nowMs
        setParamA(prox)
      }
    }
  }

  const handleReset = () => {
    playHoverTick(soundEnabled)
    stateRef.current.mouseX = 0.5
    stateRef.current.mouseY = 0.5
    stateRef.current.paramA = defaultParamA
    setParamA(defaultParamA)
    setComboStreak(0)
  }

  // Simulated ultrasonic distance (0.40m close when paramA=1, 6.00m far when paramA=0)
  const simulatedMeters = useMemo(
    () => (6.0 - paramA * 5.6).toFixed(2),
    [paramA]
  )

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0C13]/90 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
      style={{
        boxShadow: `0 24px 80px -24px ${project.theme.glowRgba}`,
      }}
    >
      {/* Header strip */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full"
              style={{ backgroundColor: project.theme.accentHex }}
            />
            <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-400 uppercase">
              {project.interactiveLab.subtitle[lang]}
            </span>
          </div>
          <h4 className="mt-1 font-display text-lg font-bold tracking-tight text-white sm:text-xl">
            {project.interactiveLab.title[lang]}
          </h4>
        </div>

        {/* Scene / Texture Preset Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset, idx) => (
            <button
              key={preset.src}
              type="button"
              onClick={() => {
                playHoverTick(soundEnabled)
                setPresetIdx(idx)
              }}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-all ${
                presetIdx === idx
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-200'
              }`}
            >
              {preset.label[lang]}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            aria-label={lang === 'en' ? 'Reset lab view' : 'Reiniciar vista'}
            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] tracking-wider text-zinc-400 uppercase transition-colors hover:border-white/30 hover:text-white"
          >
            {lang === 'en' ? 'Reset' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Shader Canvas Viewport */}
      <div
        data-cursor="DRAG / MOVE"
        style={{ touchAction: 'pan-y' }}
        onMouseMove={(e) => handlePointer(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            handlePointer(e.touches[0].clientX, e.touches[0].clientY)
          }
        }}
        onClick={(e) => handlePointer(e.clientX, e.clientY)}
        className="relative aspect-[16/9] w-full cursor-crosshair overflow-hidden rounded-2xl border border-white/10 bg-black"
      >
        {/* Static fallback preview if WebGL is off, offscreen, or recovering from context loss */}
        {(!inView || !webglOk || contextLost) && (
          <img
            src={activeTextureSrc}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Dedicated imperative WebGL host with zero React-managed children */}
        <div
          ref={canvasHostRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* Overlay Telemetry HUD */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-black/65 px-3 py-1 backdrop-blur-md">
          <span className="font-mono text-[10px] tracking-wider text-zinc-300">
            GLSL · {MODE_TELEMETRY[mode]}
          </span>
          {mode === 'kane' && (
            <span
              className="font-mono text-[10px] font-semibold"
              style={{ color: project.theme.accentHex }}
            >
              /osc/dist: {simulatedMeters}m
            </span>
          )}
          {mode === 'notas' && lastTriggerLabel && (
            <span
              className="font-mono text-[10px] font-semibold"
              style={{ color: project.theme.secondaryHex }}
            >
              {lastTriggerLabel}
            </span>
          )}
          {mode === 'notas' && comboStreak > 1 && (
            <span
              className="font-mono text-[10px] font-semibold"
              style={{ color: project.theme.accentHex }}
            >
              x{comboStreak}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Controls Footer */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
          {project.interactiveLab.instructions[lang]}
        </p>

        {mode === 'palenque' && (
          <div className="flex min-w-[230px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] whitespace-nowrap text-zinc-300">
              {lang === 'en' ? 'Sun / Rays' : 'Sol / Rayos'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={paramA}
              aria-label="Volumetric sunlight intensity"
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#F59E0B]"
            />
          </div>
        )}

        {mode === 'kane' && (
          <div className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] whitespace-nowrap text-zinc-300">
              {lang === 'en' ? 'Distance' : 'Distancia'}: {simulatedMeters}m
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={paramA}
              aria-label="Ultrasonic sensor distance"
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#FB7185]"
            />
          </div>
        )}

        {mode === 'sogno' && (
          <div className="flex min-w-[230px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] whitespace-nowrap text-zinc-300">
              {lang === 'en' ? 'LiDAR Lens' : 'Lente LiDAR'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={paramA}
              aria-label="LiDAR lens radius"
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#22D3EE]"
            />
          </div>
        )}

        {mode === 'tadc2' && (
          <div className="flex min-w-[230px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] whitespace-nowrap text-zinc-300">
              {lang === 'en' ? 'Glitch / CRT' : 'Glitch / CRT'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={paramA}
              aria-label="CRT glitch intensity"
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#EF4444]"
            />
          </div>
        )}

        {mode === 'reminiscencia' && (
          <div className="flex min-w-[230px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] whitespace-nowrap text-zinc-300">
              {lang === 'en' ? 'VHS Signal' : 'Señal VHS'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={paramA}
              aria-label="VHS signal corruption"
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#A855F7]"
            />
          </div>
        )}

        {mode === 'vestigio' && (
          <div className="flex min-w-[230px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] whitespace-nowrap text-zinc-300">
              {lang === 'en' ? 'Clay Lathe' : 'Torno / Relieve'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={paramA}
              aria-label="Clay sculpting lathe intensity"
              onChange={(e) => setParamA(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#F59E0B]"
            />
          </div>
        )}

        {mode === 'notas' && (
          <div className="grid grid-cols-4 gap-2">
            {NOTAS_LANES.map((lane, idx) => (
              <button
                key={lane.key}
                type="button"
                aria-label={`Play note ${lane.key} ${lane.label}`}
                onClick={() => triggerBeatLane(idx)}
                className="flex flex-col items-center justify-center rounded-xl border px-3 py-2 font-mono text-xs font-bold transition-transform active:scale-95"
                style={{
                  borderColor: activeLanes[idx]
                    ? lane.color
                    : 'rgba(255,255,255,0.14)',
                  backgroundColor: activeLanes[idx]
                    ? `${lane.color}33`
                    : 'rgba(255,255,255,0.04)',
                  color: lane.color,
                  boxShadow: activeLanes[idx]
                    ? `0 0 22px ${lane.color}88`
                    : 'none',
                }}
              >
                <span>{lane.key}</span>
                <span className="text-[9px] font-normal text-zinc-300">
                  {lane.label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
