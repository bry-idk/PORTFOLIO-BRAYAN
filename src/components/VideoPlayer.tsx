import React, { useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { Lang, VideoAsset } from '../types/portfolio'

interface Props {
  video: VideoAsset
  lang: Lang
  accentHex: string
}

export const VideoPlayer: React.FC<Props> = ({ video, lang, accentHex }) => {
  const vidRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)

  const togglePlay = () => {
    const el = vidRef.current
    if (!el) return
    if (el.paused) {
      void el.play()
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

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/12 bg-[#090B11] shadow-2xl">
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <video
          ref={vidRef}
          src={video.src}
          poster={video.poster}
          muted={muted}
          playsInline
          loop
          preload="metadata"
          controls={playing}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full object-cover"
        />

        {!playing && (
          <button
            type="button"
            onClick={togglePlay}
            data-cursor="PLAY"
            aria-label={`${lang === 'en' ? 'Play video' : 'Reproducir video'}: ${video.title[lang]}`}
            className="absolute inset-0 flex items-center justify-center bg-black/35 transition hover:bg-black/20"
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
              style={{ boxShadow: `0 0 36px ${accentHex}66` }}
            >
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </button>
        )}

        <div className="pointer-events-none absolute top-3 right-3 left-3 flex items-center justify-between">
          <span className="rounded-full border border-white/15 bg-black/70 px-3 py-1 font-mono text-[10px] tracking-wider text-zinc-200 backdrop-blur-md">
            REEL · {video.durationLabel}
          </span>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/70 text-zinc-200 backdrop-blur-md transition hover:border-white/50"
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
              aria-label={playing ? 'Pause' : 'Play'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/70 text-zinc-200 backdrop-blur-md transition hover:border-white/50"
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-3.5 sm:px-5">
        <h5 className="font-display text-sm font-bold text-white sm:text-base">
          {video.title[lang]}
        </h5>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          {video.caption[lang]}
        </p>
      </div>
    </div>
  )
}
