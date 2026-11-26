import React, { useEffect, useRef, useState } from 'react'
import { ImageOff, Maximize2 } from 'lucide-react'
import { Lang, MediaAsset } from '../types/portfolio'
import { mediaUrl } from '../utils/mediaUrl'

export interface ShaderImagePortalProps {
  asset: MediaAsset
  lang: Lang
  accentHex: string
  onOpen: () => void
  className?: string
  aspect?: MediaAsset['aspect']
  showCaptionBar?: boolean
  priority?: boolean
}

const ASPECT_VIEWPORT_CLASS: Record<NonNullable<MediaAsset['aspect']>, string> = {
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[16/10]',
  square: 'aspect-square',
  wide: 'aspect-[16/9]',
}

export const ShaderImagePortal: React.FC<ShaderImagePortalProps> = ({
  asset,
  lang,
  accentHex,
  onOpen,
  className = '',
  aspect,
  showCaptionBar = true,
  priority = false,
}) => {
  const cardRef = useRef<HTMLButtonElement>(null)
  const rafRef = useRef<number | null>(null)
  const pendingCoords = useRef<{ x: number; y: number } | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [asset.src])

  const resolvedAspect = aspect ?? asset.aspect ?? 'landscape'
  const viewportAspectClass = ASPECT_VIEWPORT_CLASS[resolvedAspect]
  const resolvedSrc = mediaUrl(asset.src)

  useEffect(() => {
    return () => {
      if (rafRef.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  const applyTiltFromPointer = () => {
    rafRef.current = null
    const el = cardRef.current
    const coords = pendingCoords.current
    if (!el || !coords) return

    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const px = Math.min(1, Math.max(0, (coords.x - rect.left) / rect.width))
    const py = Math.min(1, Math.max(0, (coords.y - rect.top) / rect.height))
    const rx = (0.5 - py) * 6.5
    const ry = (px - 0.5) * 6.5

    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
    el.style.setProperty('--portal-scale', '1.012')
  }

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    pendingCoords.current = { x: e.clientX, y: e.clientY }
    if (rafRef.current === null) {
      if (typeof requestAnimationFrame === 'function') {
        rafRef.current = requestAnimationFrame(applyTiltFromPointer)
      } else {
        applyTiltFromPointer()
      }
    }
  }

  const handleEnter = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--portal-scale', '1.012')
  }

  const handleLeave = () => {
    if (rafRef.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    pendingCoords.current = null
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--gx', '50%')
    el.style.setProperty('--gy', '50%')
    el.style.setProperty('--portal-scale', '1')
  }

  return (
    <button
      ref={cardRef}
      type="button"
      data-cursor="ZOOM"
      onClick={onOpen}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
      style={
        {
          '--rx': '0deg',
          '--ry': '0deg',
          '--gx': '50%',
          '--gy': '50%',
          '--portal-scale': '1',
          '--portal-accent': accentHex,
          transform:
            'perspective(960px) rotateX(var(--rx)) rotateY(var(--ry)) scale(var(--portal-scale))',
          willChange: 'transform',
        } as React.CSSProperties
      }
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#070910]/90 text-left backdrop-blur-md transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B] ${className}`}
    >
      {/* Subtle accent rim refraction on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${accentHex}66, 0 24px 60px -24px ${accentHex}55`,
        }}
      />

      <div
        className={`relative w-full shrink-0 overflow-hidden bg-[#05060A] ${viewportAspectClass}`}
      >
        {imgError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#06080F] px-4 text-center">
            <ImageOff
              className="h-6 w-6 opacity-70"
              style={{ color: accentHex }}
            />
            <span className="font-mono text-[10px] tracking-wider text-zinc-400 uppercase">
              {lang === 'en' ? 'Media Unavailable' : 'Imagen No Disponible'}
            </span>
          </div>
        ) : (
          <img
            src={resolvedSrc}
            alt={asset.alt[lang]}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          />
        )}

        {/* Cursor-tracked specular caustic glare */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle 260px at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.17), transparent 68%)',
          }}
        />

        {/* Chromatic accent caustic bloom */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle 340px at var(--gx, 50%) var(--gy, 50%), ${accentHex}33, transparent 72%)`,
          }}
        />

        {/* Editorial dark edge scrim for legible overlay badges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent"
        />

        {/* Top exhibition reference & optical zoom reticle */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 left-2.5 z-10 flex items-center justify-between gap-2">
          {asset.pdfPageRef ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-black/70 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-zinc-200 backdrop-blur-md">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accentHex }}
              />
              {asset.pdfPageRef}
            </span>
          ) : (
            <span className="rounded-md border border-white/15 bg-black/65 px-2 py-0.5 font-mono text-[10px] tracking-wider text-zinc-300 backdrop-blur-md">
              {lang === 'en' ? 'ARCHIVE' : 'ARCHIVO'}
            </span>
          )}
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 backdrop-blur-md transition-all duration-200 group-hover:opacity-100"
            style={{ borderColor: `${accentHex}70` }}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {showCaptionBar && (
        <div className="relative z-10 flex min-h-[3.75rem] flex-1 items-center gap-2.5 border-t border-white/[0.08] bg-[#070910]/95 px-3.5 py-2.5">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full opacity-80 transition-opacity group-hover:opacity-100"
            style={{ backgroundColor: accentHex }}
          />
          <p className="line-clamp-2 font-sans text-xs leading-relaxed text-zinc-300 transition-colors duration-200 group-hover:text-white">
            {asset.caption[lang]}
          </p>
        </div>
      )}
    </button>
  )
}
