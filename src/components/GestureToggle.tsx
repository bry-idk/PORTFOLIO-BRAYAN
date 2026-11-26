import React from 'react'
import { Hand } from 'lucide-react'
import { Lang } from '../types/portfolio'

export interface GestureToggleProps {
  lang: Lang
  enabled: boolean
  onToggle: () => void
  accentHex?: string
}

export const GestureToggle: React.FC<GestureToggleProps> = ({
  lang,
  enabled,
  onToggle,
  accentHex = '#2EFF7B',
}) => {
  const ariaLabel =
    lang === 'en'
      ? enabled
        ? 'Disable MediaPipe webcam gesture scroll'
        : 'Enable MediaPipe webcam gesture scroll'
      : enabled
        ? 'Desactivar scroll por gestos MediaPipe'
        : 'Activar scroll por gestos MediaPipe'

  const shortLabel = lang === 'en' ? 'AIR' : 'GESTOS'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-cursor="AIR"
      className="group inline-flex h-8 items-center gap-1.5 rounded-xl border px-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-all duration-300"
      style={{
        borderColor: enabled ? `${accentHex}66` : 'rgba(255, 255, 255, 0.14)',
        backgroundColor: enabled
          ? `${accentHex}14`
          : 'rgba(255, 255, 255, 0.03)',
        color: enabled ? '#FFFFFF' : 'rgb(161, 161, 170)',
      }}
    >
      <span className="relative flex items-center justify-center">
        <Hand
          className="h-3.5 w-3.5 transition-colors duration-300"
          style={{ color: enabled ? accentHex : 'rgb(161, 161, 170)' }}
          aria-hidden="true"
        />
        {enabled && (
          <span
            className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 animate-ping rounded-full"
            style={{ backgroundColor: accentHex }}
            aria-hidden="true"
          />
        )}
      </span>
      <span className="hidden xl:inline">{shortLabel}</span>
    </button>
  )
}
