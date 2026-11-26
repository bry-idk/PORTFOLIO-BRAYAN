import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Camera,
  CameraOff,
  ChevronDown,
  ChevronUp,
  Hand,
  RefreshCw,
  X,
} from 'lucide-react'
import { Lang } from '../types/portfolio'
import {
  AIR_SCROLL_LOWER_ZONE_START,
  AIR_SCROLL_UPPER_ZONE_END,
  AirScrollGesture,
  AirScrollTrackerState,
  evaluateAirScrollFrame,
  HandLandmarkPoint,
  INITIAL_AIR_SCROLL_STATE,
} from '../utils/handGestureScroll'

export interface GestureScrollControllerProps {
  lang: Lang
  accentHex?: string
  paused?: boolean
  onScrollDelta: (deltaY: number) => void
  onClose: () => void
}

type TrackerStatus =
  | 'initializing'
  | 'active'
  | 'denied'
  | 'unsupported'
  | 'error'

type SpeedPreset = 0.7 | 1.0 | 1.45

const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm'
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

const HAND_SKELETON_EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
]

const GESTURE_COLOR: Record<AirScrollGesture, string> = {
  none: '#94A3B8',
  fist: '#FB7185',
  pinch: '#22D3EE',
  open_up: '#2EFF7B',
  open_hold: '#FBBF24',
  open_down: '#2EFF7B',
}

function getGestureLabel(gesture: AirScrollGesture, lang: Lang): string {
  if (lang === 'es') {
    switch (gesture) {
      case 'open_up':
        return 'SUBIENDO ▲'
      case 'open_down':
        return 'BAJANDO ▼'
      case 'open_hold':
        return 'PAUSA'
      case 'pinch':
        return 'PINZA · DRAG'
      case 'fist':
        return 'PUÑO · FRENO'
      default:
        return 'MUESTRA MANO'
    }
  }
  switch (gesture) {
    case 'open_up':
      return 'SCROLL UP ▲'
    case 'open_down':
      return 'SCROLL DOWN ▼'
    case 'open_hold':
      return 'HOLD'
    case 'pinch':
      return 'PINCH · DRAG'
    case 'fist':
      return 'FIST · BRAKE'
    default:
      return 'SHOW HAND'
  }
}

function drawHandHudOverlay(
  canvas: HTMLCanvasElement,
  landmarks: HandLandmarkPoint[] | null,
  gesture: AirScrollGesture,
  handY: number | null,
  accentHex: string,
  lang: Lang
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  const upperY = Math.round(AIR_SCROLL_UPPER_ZONE_END * h)
  const lowerY = Math.round(AIR_SCROLL_LOWER_ZONE_START * h)

  // Highlight active vertical cruise zone when open hand is controlling scroll
  if (gesture === 'open_up') {
    ctx.fillStyle = 'rgba(46, 255, 123, 0.14)'
    ctx.fillRect(0, 0, w, upperY)
  } else if (gesture === 'open_down') {
    ctx.fillStyle = 'rgba(46, 255, 123, 0.14)'
    ctx.fillRect(0, lowerY, w, h - lowerY)
  } else if (gesture === 'open_hold') {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.08)'
    ctx.fillRect(0, upperY, w, lowerY - upperY)
  }

  // Subtle dashed zone guide lines
  ctx.save()
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, upperY)
  ctx.lineTo(w, upperY)
  ctx.moveTo(0, lowerY)
  ctx.lineTo(w, lowerY)
  ctx.stroke()
  ctx.restore()

  // Localized zone directional micro-labels
  ctx.font = '600 9px "JetBrains Mono", monospace'
  ctx.fillStyle =
    gesture === 'open_up' ? '#2EFF7B' : 'rgba(228, 228, 231, 0.55)'
  ctx.fillText(lang === 'es' ? '▲ SUBIR' : '▲ UP', 8, 13)
  ctx.fillStyle =
    gesture === 'open_down' ? '#2EFF7B' : 'rgba(228, 228, 231, 0.55)'
  ctx.fillText(lang === 'es' ? '▼ BAJAR' : '▼ DOWN', 8, h - 7)

  if (!landmarks || landmarks.length < 21) return

  const strokeColor =
    gesture === 'open_up' || gesture === 'open_down'
      ? accentHex
      : GESTURE_COLOR[gesture]

  // Mirror horizontally to align cleanly with `-scale-x-100` selfie video
  ctx.lineWidth = 1.6
  ctx.strokeStyle = strokeColor
  ctx.beginPath()
  for (const [startIdx, endIdx] of HAND_SKELETON_EDGES) {
    const a = landmarks[startIdx]
    const b = landmarks[endIdx]
    ctx.moveTo((1 - a.x) * w, a.y * h)
    ctx.lineTo((1 - b.x) * w, b.y * h)
  }
  ctx.stroke()

  // Draw landmark nodes & emphasis on thumb/index fingertips
  for (let i = 0; i < landmarks.length; i++) {
    const pt = landmarks[i]
    const px = (1 - pt.x) * w
    const py = pt.y * h
    const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20
    ctx.beginPath()
    ctx.arc(px, py, isTip ? 2.8 : 1.7, 0, Math.PI * 2)
    ctx.fillStyle =
      gesture === 'pinch' && (i === 4 || i === 8) ? '#FFFFFF' : strokeColor
    ctx.fill()
  }

  // Right-edge smoothed hand height indicator pip
  if (handY !== null) {
    const markerY = Math.max(4, Math.min(h - 4, handY * h))
    ctx.fillStyle = strokeColor
    ctx.fillRect(w - 5, markerY - 4, 3, 8)
  }
}

export const GestureScrollController: React.FC<
  GestureScrollControllerProps
> = ({
  lang,
  accentHex = '#2EFF7B',
  paused = false,
  onScrollDelta,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackerRef = useRef<AirScrollTrackerState>(INITIAL_AIR_SCROLL_STATE)
  const speedRef = useRef<SpeedPreset>(1.0)
  const onScrollDeltaRef = useRef(onScrollDelta)
  const pausedRef = useRef(paused)
  const accentHexRef = useRef(accentHex)
  const langRef = useRef(lang)

  onScrollDeltaRef.current = onScrollDelta
  pausedRef.current = paused
  accentHexRef.current = accentHex
  langRef.current = lang

  const [status, setStatus] = useState<TrackerStatus>('initializing')
  const [gesture, setGesture] = useState<AirScrollGesture>('none')
  const [minimized, setMinimized] = useState(false)
  const [speed, setSpeed] = useState<SpeedPreset>(1.0)
  const [errorCode, setErrorCode] = useState<'not_found' | 'init_failed' | null>(
    null
  )
  const [retryToken, setRetryToken] = useState(0)

  const handleSpeedChange = useCallback((next: SpeedPreset) => {
    speedRef.current = next
    setSpeed(next)
  }, [])

  // Clear stale momentum/pinch anchor whenever paused (e.g., lightbox opened)
  useEffect(() => {
    if (paused) {
      trackerRef.current = { ...INITIAL_AIR_SCROLL_STATE }
      setGesture('none')
    }
  }, [paused])

  // Render guide lines immediately on mount / language switch
  useEffect(() => {
    if (canvasRef.current && status !== 'active') {
      drawHandHudOverlay(canvasRef.current, null, 'none', null, accentHex, lang)
    } else if (canvasRef.current && status === 'active') {
      drawHandHudOverlay(
        canvasRef.current,
        null,
        trackerRef.current.gesture,
        trackerRef.current.smoothedY,
        accentHex,
        lang
      )
    }
  }, [lang, status, accentHex])

  useEffect(() => {
    let disposed = false
    let rafId: number | null = null
    let stream: MediaStream | null = null
    let handLandmarker: {
      detectForVideo: (
        videoFrame: HTMLVideoElement,
        timestamp: number
      ) => { landmarks?: HandLandmarkPoint[][] }
      close: () => void
    } | null = null

    trackerRef.current = { ...INITIAL_AIR_SCROLL_STATE }
    setStatus('initializing')
    setGesture('none')
    setErrorCode(null)

    const stopAll = () => {
      if (rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        stream = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      if (handLandmarker) {
        try {
          handLandmarker.close()
        } catch {
          // Safe cleanup fallback
        }
        handLandmarker = null
      }
    }

    async function bootstrapMediaPipe() {
      if (
        typeof window === 'undefined' ||
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        if (!disposed) {
          setStatus('unsupported')
        }
        return
      }

      try {
        // 1. Request webcam stream while dynamically importing MediaPipe in parallel
        const streamPromise = navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 320 },
            height: { ideal: 240 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: false,
        })
        const visionPromise = import('@mediapipe/tasks-vision')

        const [resolvedStream, visionPkg] = await Promise.all([
          streamPromise,
          visionPromise,
        ])

        if (disposed) {
          resolvedStream.getTracks().forEach((t) => t.stop())
          return
        }

        stream = resolvedStream
        const videoEl = videoRef.current
        if (videoEl) {
          videoEl.srcObject = resolvedStream
          try {
            await videoEl.play()
          } catch {
            // Autoplay guard handled once frames stream
          }
        }

        const { FilesetResolver, HandLandmarker } = visionPkg
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL)
        if (disposed) return

        try {
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: HAND_MODEL_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.5,
          })
        } catch {
          if (disposed) return
          handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: HAND_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.5,
          })
        }

        if (disposed) {
          stopAll()
          return
        }

        setStatus('active')

        let lastTimestampMs = 0
        let lastFrameTimeMs =
          typeof performance !== 'undefined' ? performance.now() : Date.now()
        let lastVideoTime = -1

        const stepFrame = () => {
          if (disposed) return
          rafId = requestAnimationFrame(stepFrame)

          if (document.hidden || pausedRef.current) return
          const vid = videoRef.current
          if (!vid || !handLandmarker || vid.readyState < 2) return
          if (vid.currentTime === lastVideoTime) return
          lastVideoTime = vid.currentTime

          const nowMs =
            typeof performance !== 'undefined' ? performance.now() : Date.now()
          const dtSec = Math.max(0.008, (nowMs - lastFrameTimeMs) / 1000)
          lastFrameTimeMs = nowMs

          const detectTs = nowMs > lastTimestampMs ? nowMs : lastTimestampMs + 1
          lastTimestampMs = detectTs

          let primaryHand: HandLandmarkPoint[] | undefined
          try {
            const result = handLandmarker.detectForVideo(vid, detectTs)
            primaryHand = result.landmarks?.[0]
          } catch {
            return
          }

          const evaluated = evaluateAirScrollFrame({
            landmarks: primaryHand,
            prevState: trackerRef.current,
            dtSeconds: dtSec,
            viewportHeight: window.innerHeight || 800,
            sensitivity: speedRef.current,
          })

          trackerRef.current = evaluated.nextState
          setGesture((prev) =>
            prev === evaluated.gesture ? prev : evaluated.gesture
          )

          if (canvasRef.current) {
            drawHandHudOverlay(
              canvasRef.current,
              primaryHand ?? null,
              evaluated.gesture,
              evaluated.handY,
              accentHexRef.current,
              langRef.current
            )
          }

          if (Math.abs(evaluated.deltaY) >= 0.05) {
            onScrollDeltaRef.current(evaluated.deltaY)
          }
        }

        rafId = requestAnimationFrame(stepFrame)
      } catch (err) {
        if (disposed) return
        stopAll()
        const errName =
          err && typeof err === 'object' && 'name' in err
            ? String((err as { name?: string }).name)
            : ''
        if (
          errName === 'NotAllowedError' ||
          errName === 'PermissionDeniedError' ||
          errName === 'SecurityError'
        ) {
          setStatus('denied')
        } else if (
          errName === 'NotFoundError' ||
          errName === 'DevicesNotFoundError'
        ) {
          setStatus('error')
          setErrorCode('not_found')
        } else {
          setStatus('error')
          setErrorCode('init_failed')
        }
      }
    }

    void bootstrapMediaPipe()

    return () => {
      disposed = true
      stopAll()
    }
  }, [retryToken])

  const activeColor =
    gesture === 'open_up' || gesture === 'open_down'
      ? accentHex
      : GESTURE_COLOR[gesture]

  return (
    <aside
      aria-label={
        lang === 'en'
          ? 'MediaPipe air gesture scroll controller'
          : 'Controlador MediaPipe de scroll por gestos'
      }
      className="fixed bottom-4 left-4 z-50 w-[236px] overflow-hidden rounded-2xl border bg-[#06080F]/90 shadow-[0_24px_60px_rgba(0,0,0,0.72)] backdrop-blur-2xl transition-colors duration-300 sm:bottom-6 sm:left-6 sm:w-[264px]"
      style={{
        borderColor:
          status === 'active'
            ? `${activeColor}66`
            : 'rgba(255, 255, 255, 0.14)',
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              status === 'active' ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor:
                status === 'active' ? activeColor : 'rgb(161, 161, 170)',
              boxShadow:
                status === 'active' ? `0 0 8px ${activeColor}` : undefined,
            }}
          />
          <Hand
            className="h-3.5 w-3.5 shrink-0 text-zinc-300"
            aria-hidden="true"
          />
          <span className="truncate font-mono text-[10px] font-semibold tracking-[0.16em] text-zinc-100 uppercase">
            {lang === 'en' ? 'MediaPipe Air' : 'Gestos Aire'}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setMinimized((v) => !v)}
            aria-label={
              minimized
                ? lang === 'en'
                  ? 'Expand camera preview'
                  : 'Expandir vista previa'
                : lang === 'en'
                  ? 'Minimize camera preview'
                  : 'Minimizar vista previa'
            }
            className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            {minimized ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label={
              lang === 'en'
                ? 'Close webcam gesture scroll'
                : 'Cerrar control por cámara'
            }
            className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-rose-500/20 hover:text-rose-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Keep <video> mounted when minimized so tracking persists seamlessly */}
      <div className={minimized ? 'sr-only' : 'relative aspect-[4/3] w-full bg-[#040508]'}>
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="h-full w-full -scale-x-100 object-cover opacity-70"
        />
        <canvas
          ref={canvasRef}
          width={264}
          height={198}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {status === 'initializing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#06080F]/85 px-4 text-center">
            <Camera
              className="h-5 w-5 animate-pulse"
              style={{ color: accentHex }}
            />
            <p className="font-mono text-[10px] tracking-[0.14em] text-zinc-200 uppercase">
              {lang === 'en'
                ? 'Starting Webcam & AI...'
                : 'Iniciando Cámara e IA...'}
            </p>
          </div>
        )}

        {(status === 'denied' ||
          status === 'unsupported' ||
          status === 'error') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#06080F]/95 px-4 text-center">
            <CameraOff className="h-5 w-5 text-rose-400" />
            <p className="font-sans text-xs leading-snug text-zinc-200">
              {status === 'denied'
                ? lang === 'es'
                  ? 'Permiso de cámara denegado.'
                  : 'Camera permission denied.'
                : status === 'unsupported'
                  ? lang === 'es'
                    ? 'Requiere HTTPS/localhost y webcam.'
                    : 'Requires HTTPS/localhost & webcam.'
                  : errorCode === 'not_found'
                    ? lang === 'es'
                      ? 'No se detectó cámara web disponible.'
                      : 'No webcam device detected.'
                    : lang === 'es'
                      ? 'No se pudo iniciar cámara o modelo MediaPipe.'
                      : 'Failed to initialize camera or MediaPipe model.'}
            </p>
            {status !== 'unsupported' && (
              <button
                type="button"
                onClick={() => setRetryToken((n) => n + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wider text-white uppercase transition hover:border-white/35"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{lang === 'en' ? 'Retry' : 'Reintentar'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Live Telemetry & Speed Controls */}
      <div className="space-y-2 px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="truncate font-mono text-[10px] font-semibold tracking-wider uppercase"
            style={{
              color:
                status === 'active'
                  ? activeColor
                  : 'rgba(161, 161, 170, 0.9)',
            }}
          >
            {paused
              ? lang === 'es'
                ? 'PAUSADO EN VISOR'
                : 'PAUSED IN VIEWER'
              : status === 'active'
                ? getGestureLabel(gesture, lang)
                : status === 'initializing'
                  ? lang === 'es'
                    ? 'INICIANDO IA...'
                    : 'STARTING AI...'
                  : lang === 'es'
                    ? 'CÁMARA INACTIVA'
                    : 'CAMERA INACTIVE'}
          </span>

          <div
            role="group"
            aria-label={
              lang === 'en' ? 'Air scroll speed' : 'Velocidad de scroll'
            }
            className="flex shrink-0 items-center gap-1"
          >
            {([0.7, 1.0, 1.45] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSpeedChange(preset)}
                aria-pressed={speed === preset}
                className={`rounded-md px-1.5 py-0.5 font-mono text-[9.5px] font-semibold transition ${
                  speed === preset
                    ? 'bg-white/[0.14] text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {preset === 1.0 ? '1×' : `${preset}×`}
              </button>
            ))}
          </div>
        </div>

        {!minimized && (
          <p className="font-mono text-[9.5px] leading-relaxed text-zinc-400">
            {lang === 'es'
              ? 'Palma arriba/abajo · Pinza arrastra · Puño frena'
              : 'Palm high/low · Pinch drags · Fist brakes'}
          </p>
        )}
      </div>
    </aside>
  )
}

export default GestureScrollController
