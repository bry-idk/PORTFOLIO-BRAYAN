import React, { useEffect, useState } from 'react'
import { Lang } from '../types/portfolio'

export interface IntroCurtainProps {
  lang: Lang
  onComplete?: () => void
}

function shouldSkipCurtain(): boolean {
  if (typeof window === 'undefined') return true
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true
    }
  }
  return false
}

/**
 * Non-blocking, ultra-fast (~650ms) editorial curtain reveal.
 * Marked aria-hidden="true" and pointer-events-none so DOM text,
 * accessibility trees, user interaction, and Vitest assertions are never blocked.
 */
export const IntroCurtain: React.FC<IntroCurtainProps> = ({
  lang,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'hold' | 'lift' | 'done'>(() =>
    shouldSkipCurtain() ? 'done' : 'hold'
  )

  useEffect(() => {
    if (phase === 'done') {
      onComplete?.()
      return
    }

    const liftTimer = window.setTimeout(() => {
      setPhase('lift')
    }, 170)

    const doneTimer = window.setTimeout(() => {
      setPhase('done')
      onComplete?.()
    }, 660)

    return () => {
      window.clearTimeout(liftTimer)
      window.clearTimeout(doneTimer)
    }
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null

  const isLifting = phase === 'lift'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] flex flex-col justify-between overflow-hidden bg-[#05060A] px-6 py-8 sm:px-12"
      style={{
        transform: isLifting ? 'translate3d(0, -104%, 0)' : 'translate3d(0, 0, 0)',
        transition: 'transform 490ms cubic-bezier(0.76, 0, 0.24, 1)',
        willChange: 'transform',
      }}
    >
      {/* Subtle architectural scan texture */}
      <div className="halftone-grid absolute inset-0 opacity-30" />

      {/* Top calibration marker */}
      <div
        className="relative z-10 flex items-center justify-between font-mono text-[10px] tracking-[0.26em] text-zinc-500 uppercase transition-opacity duration-200"
        style={{ opacity: isLifting ? 0 : 1 }}
      >
        <span>BM // ARCHIVE 2026</span>
        <span>06°15&apos;N 75°34&apos;W</span>
      </div>

      {/* Center hairline sweep + minimal studio glyph */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-4 transition-all duration-200"
        style={{
          opacity: isLifting ? 0 : 1,
          transform: isLifting ? 'translate3d(0, -12px, 0)' : 'translate3d(0, 0, 0)',
        }}
      >
        <div className="flex items-center gap-3 font-mono text-[11px] font-semibold tracking-[0.3em] text-zinc-200 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2EFF7B] shadow-[0_0_10px_#2EFF7B]" />
          <span>{lang === 'en' ? 'DIGITAL INTERACTION' : 'INTERACCIÓN DIGITAL'}</span>
        </div>
        <div className="relative h-px w-full overflow-hidden bg-white/10">
          <div className="animate-curtain-line h-full w-full origin-left bg-gradient-to-r from-[#2EFF7B] via-white to-[#8B3DFF]" />
        </div>
      </div>

      {/* Bottom chromatic curtain edge */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] tracking-[0.24em] text-zinc-600 uppercase">
        <span>01 — 07</span>
        <span>GLSL / XR / SPATIAL</span>
      </div>

      <div className="absolute right-0 bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2EFF7B]/70 to-transparent" />
    </div>
  )
}
