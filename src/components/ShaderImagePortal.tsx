import React, { useRef, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { Lang, MediaAsset } from '../types/portfolio'

interface Props {
  asset: MediaAsset
  lang: Lang
  accentHex: string
  onOpen: () => void
  className?: string
  showCaptionBar?: boolean
}

export const ShaderImagePortal: React.FC<Props> = ({
  asset,
  lang,
  accentHex,
  onOpen,
  className = '',
  showCaptionBar = true,
}) => {
  const cardRef = useRef<HTMLButtonElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 })
  const [hovered, setHovered] = useState(false)

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({
      rx: (0.5 - py) * 7,
      ry: (px - 0.5) * 7,
      gx: px * 100,
      gy: py * 100,
    })
  }

  return (
    <button
      ref={cardRef}
      type="button"
      data-cursor="ZOOM"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 })
      }}
      onMouseMove={handleMove}
      style={{
        transform: hovered
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(1.015)`
          : 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
        boxShadow: hovered ? `0 22px 60px -18px ${accentHex}44` : 'none',
      }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0A0C12] text-left transition-all duration-300 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B] ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={asset.src}
          alt={asset.alt[lang]}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* Specular optical glare sweep */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle 280px at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.16), transparent 70%)`,
          }}
        />

        {/* Top badges */}
        <div className="pointer-events-none absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
          {asset.pdfPageRef ? (
            <span className="rounded-full border border-white/20 bg-black/65 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-zinc-200 backdrop-blur-md">
              {asset.pdfPageRef}
            </span>
          ) : (
            <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 font-mono text-[10px] text-zinc-300 backdrop-blur-md">
              ARCHIVE
            </span>
          )}
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {showCaptionBar && (
        <div className="border-t border-white/10 bg-[#080A10]/95 px-3.5 py-2.5">
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-300 group-hover:text-white">
            {asset.caption[lang]}
          </p>
        </div>
      )}
    </button>
  )
}
