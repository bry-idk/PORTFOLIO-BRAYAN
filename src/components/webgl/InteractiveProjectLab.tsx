import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { LAB_FRAGMENT_SHADER, LAB_VERTEX_SHADER } from '../../shaders/projectLabShaders'
import { Lang, ProjectData } from '../../types/portfolio'
import { playLaneNote } from '../../utils/synthAudio'
import { detectWebGLSupport } from '../../utils/webglSupport'

interface Props {
  project: ProjectData
  lang: Lang
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

export const InteractiveProjectLab: React.FC<Props> = ({ project, lang }) => {
  const mode = project.theme.labMode
  const presets = LAB_TEXTURES[mode]

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [webglOk] = useState(() => detectWebGLSupport())
  const [presetIdx, setPresetIdx] = useState(0)

  // Interactive parameters per project mode
  const [paramA, setParamA] = useState(mode === 'kane' ? 0.55 : 0.45)
  const [activeLanes, setActiveLanes] = useState<[number, number, number, number]>([
    0, 0, 0, 0,
  ])
  const [lastTriggerLabel, setLastTriggerLabel] = useState<string>('')

  const stateRef = useRef({
    mouseX: 0.5,
    mouseY: 0.5,
    paramA: 0.5,
    lanes: new THREE.Vector4(0, 0, 0, 0),
  })

  useEffect(() => {
    stateRef.current.paramA = paramA
  }, [paramA])

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

  const triggerBeatLane = useCallback(
    (laneIndex: number) => {
      playLaneNote(laneIndex)
      const vec = stateRef.current.lanes
      if (laneIndex === 0) vec.x = 1.0
      if (laneIndex === 1) vec.y = 1.0
      if (laneIndex === 2) vec.z = 1.0
      if (laneIndex === 3) vec.w = 1.0

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
      window.setTimeout(() => {
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
    },
    []
  )

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

  // Native Three.js lightweight WebGL plane inside canvasHostRef
  useEffect(() => {
    if (!inView || !webglOk || !canvasHostRef.current) return
    const host = canvasHostRef.current

    let renderer: THREE.WebGLRenderer | null = null
    let disposed = false
    let rafId = 0
    let texture: THREE.Texture | null = null

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
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

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uHasTexture: { value: 0 },
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

    const loader = new THREE.TextureLoader()
    loader.load(activeTextureSrc, (loaded) => {
      if (disposed) {
        loaded.dispose()
        return
      }
      loaded.minFilter = THREE.LinearFilter
      loaded.magFilter = THREE.LinearFilter
      texture = loaded
      uniforms.uTexture.value = loaded
      uniforms.uHasTexture.value = 1
    })

    const resizeObserver = new ResizeObserver((entries) => {
      if (!renderer || disposed) return
      const rect = entries[0]?.contentRect
      if (!rect || rect.width < 10 || rect.height < 10) return
      renderer.setSize(rect.width, rect.height, false)
      uniforms.uResolution.value.set(rect.width, rect.height)
    })
    resizeObserver.observe(host)

    const clock = new THREE.Clock()
    const renderLoop = () => {
      if (disposed || !renderer) return
      const dt = Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value += dt
      uniforms.uMouse.value.lerp(
        new THREE.Vector2(
          stateRef.current.mouseX,
          1.0 - stateRef.current.mouseY
        ),
        0.14
      )
      uniforms.uParamA.value = THREE.MathUtils.lerp(
        uniforms.uParamA.value,
        stateRef.current.paramA,
        0.12
      )

      // Smooth decay for Notas y Colores lane pulses
      stateRef.current.lanes.multiplyScalar(Math.pow(0.06, dt))
      uniforms.uBeatLanes.value.copy(stateRef.current.lanes)

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(renderLoop)
    }
    rafId = requestAnimationFrame(renderLoop)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      if (texture) texture.dispose()
      if (renderer) {
        renderer.dispose()
        if (renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement)
        }
      }
    }
  }, [inView, webglOk, mode, activeTextureSrc])

  const handlePointer = (clientX: number, clientY: number) => {
    const el = canvasHostRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    stateRef.current.mouseX = x
    stateRef.current.mouseY = y

    // For Kane no Hibiki, horizontal position directly simulates ultrasonic foot-traffic sensor!
    if (mode === 'kane') {
      setParamA(Number((1 - Math.abs(x - 0.5) * 1.6).toFixed(2)))
    }
  }

  // Simulated ultrasonic distance (0.4m close when paramA=1, 6.0m far when paramA=0)
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
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset, idx) => (
            <button
              key={preset.src}
              type="button"
              onClick={() => setPresetIdx(idx)}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-all ${
                presetIdx === idx
                  ? 'border-white/40 bg-white/15 text-white'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-200'
              }`}
            >
              {preset.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Shader Canvas Viewport */}
      <div
        data-cursor="DRAG / MOVE"
        onMouseMove={(e) => handlePointer(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            handlePointer(e.touches[0].clientX, e.touches[0].clientY)
          }
        }}
        onClick={(e) => handlePointer(e.clientX, e.clientY)}
        className="relative aspect-[16/9] w-full cursor-crosshair overflow-hidden rounded-2xl border border-white/10 bg-black"
      >
        {/* Static fallback preview if WebGL is off or offscreen */}
        {(!inView || !webglOk) && (
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
        <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 backdrop-blur-md">
          <span className="font-mono text-[10px] tracking-wider text-zinc-300">
            GLSL · REALTIME
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
        </div>
      </div>

      {/* Interactive Controls Footer */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-zinc-400">
          {project.interactiveLab.instructions[lang]}
        </p>

        {mode === 'kane' && (
          <div className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] text-zinc-300">
              {lang === 'en' ? 'Distance' : 'Distancia'}: {simulatedMeters}m
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={paramA}
              aria-label="Ultrasonic sensor distance"
              onChange={(e) => setParamA( parseFloat(e.target.value) )}
              className="h-1.5 w-full cursor-pointer accent-[#FB7185]"
            />
          </div>
        )}

        {mode === 'sogno' && (
          <div className="flex min-w-[230px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2">
            <span className="font-mono text-[11px] text-zinc-300">
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
            <span className="font-mono text-[11px] text-zinc-300">
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
            <span className="font-mono text-[11px] text-zinc-300">
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
            <span className="font-mono text-[11px] text-zinc-300">
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
