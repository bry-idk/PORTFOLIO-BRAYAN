import React, { useEffect, useRef, useState } from 'react'
import { Film, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Lang, VideoAsset } from '../types/portfolio'
import { mediaUrl } from '../utils/mediaUrl'

export interface VideoPlayerProps {
  video: VideoAsset
  lang: Lang
  accentHex: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  lang,
  accentHex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const vidRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [preloadMode, setPreloadMode] = useState<'none' | 'metadata'>('none')
  const [hasError, setHasError] = useState(false)

  // Upgrade preload="none" -> "metadata" only when approaching viewport,
  // and auto-pause playback if the video scrolls out of view.
  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof IntersectionObserver === 'undefined') return

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPreloadMode('metadata')
            preloadObserver.disconnect()
            break
          }
        }
      },
      { rootMargin: '260px 0px', threshold: 0.01 }
    )

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (!entry.isIntersecting) {
          const el = vidRef.current
          if (el && !el.paused) {
            el.pause()
          }
        }
      },
      { threshold: 0.05 }
    )

    preloadObserver.observe(container)
    visibilityObserver.observe(container)

    return () => {
      preloadObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [])

  const togglePlay = () => {
    if (hasError) return
    const el = vidRef.current
    if (!el) return
    if (preloadMode === 'none') {
      setPreloadMode('metadata')
    }
    if (el.paused) {
      const playPromise = el.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setPlaying(false)
        })
      }
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const el = vidRef.current
    if (!el) return
    el.muted = !el.muted
    setMuted(el.muted)
  }

  const handleRetry = () => {
    setHasError(false)
    setPreloadMode('metadata')
    window.setTimeout(() => {
      vidRef.current?.load()
    }, 0)
  }

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#080A11]/95 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.85)] transition-colors duration-300 hover:border-white/20"
    >
      {/* Subtle top accent hairline */}
      <div
        aria-hidden="true"
        className="h-px w-full opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
        }}
      />

      <div className="relative aspect-video w-full overflow-hidden bg-[#05060A]">
        {hasError ? (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#06080E]">
            {video.poster && (
              <img
                src={mediaUrl(video.poster)}
                alt={video.title[lang]}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-55"
              />
            )}
            <div className="crt-scanlines pointer-events-none absolute inset-0 opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
            <div className="relative z-10 flex max-w-sm flex-col items-center gap-3 px-6 text-center">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border bg-black/70 text-zinc-200 backdrop-blur-md"
                style={{ borderColor: `${accentHex}66`, color: accentHex }}
              >
                <Film className="h-5 w-5" />
              </span>
              <p className="font-mono text-[11px] tracking-widest text-zinc-200 uppercase">
                {lang === 'en'
                  ? 'Preview Still · Stream Unavailable'
                  : 'Fotograma de Vista Previa · Video No Disponible'}
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3.5 py-1.5 font-mono text-[11px] text-zinc-100 backdrop-blur-md transition hover:border-white/45 hover:bg-white/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {lang === 'en' ? 'Retry Reel' : 'Reintentar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={vidRef}
              src={mediaUrl(video.src)}
              poster={video.poster ? mediaUrl(video.poster) : undefined}
              muted={muted}
              playsInline
              loop
              preload={preloadMode}
              controls={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => {
                setPlaying(false)
                setHasError(true)
              }}
              className="h-full w-full object-cover"
            />

            {!playing && (
              <button
                type="button"
                onClick={togglePlay}
                data-cursor="PLAY"
                aria-label={`${lang === 'en' ? 'Play video' : 'Reproducir video'}: ${video.title[lang]}`}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/55 via-black/25 to-black/20 transition-colors duration-300 hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2EFF7B]"
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
                  style={{
                    borderColor: `${accentHex}88`,
                    boxShadow: `0 0 42px ${accentHex}55`,
                  }}
                >
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </span>
              </button>
            )}
          </>
        )}

        <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[10px] tracking-wider text-zinc-200 backdrop-blur-md">
            <span
              className={`h-1.5 w-1.5 rounded-full ${playing ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: accentHex }}
            />
            REEL · {video.durationLabel}
          </span>

          {!hasError && (
            <div className="pointer-events-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={
                  muted
                    ? lang === 'en'
                      ? 'Unmute'
                      : 'Activar audio'
                    : lang === 'en'
                      ? 'Mute'
                      : 'Silenciar audio'
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/70 text-zinc-200 backdrop-blur-md transition hover:border-white/50 hover:text-white"
              >
                {muted ? (
                  <VolumeX className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={
                  playing
                    ? lang === 'en'
                      ? 'Pause'
                      : 'Pausar'
                    : lang === 'en'
                      ? 'Play'
                      : 'Reproducir'
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/70 text-zinc-200 backdrop-blur-md transition hover:border-white/50 hover:text-white"
              >
                {playing ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-white/[0.08] bg-[#07090F]/95 px-4 py-3.5 sm:px-5">
        <h5 className="font-sans text-sm font-semibold tracking-tight text-white sm:text-[15px]">
          {video.title[lang]}
        </h5>
        <p className="text-xs leading-relaxed text-zinc-400">
          {video.caption[lang]}
        </p>
      </div>
    </div>
  )
}
