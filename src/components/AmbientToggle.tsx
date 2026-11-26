import React from 'react'
import { Lang } from '../types/portfolio'

export interface AmbientToggleProps {
  lang: Lang
  enabled: boolean
  onToggle: () => void
  accentHex?: string
}

export const AmbientToggle: React.FC<AmbientToggleProps> = ({
  lang,
  enabled,
  onToggle,
  accentHex = '#2EFF7B',
}) => {
  const ariaLabel =
    lang === 'en'
      ? enabled
        ? 'Mute ambient audio'
        : 'Enable ambient audio'
      : enabled
        ? 'Silenciar audio ambiental'
        : 'Activar audio ambiental'

  const labelText =
    lang === 'en' ? (enabled ? 'SND' : 'MUTE') : enabled ? 'SON' : 'OFF'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-cursor="AUDIO"
      className="group inline-flex h-8 items-center gap-2 rounded-xl border px-2.5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-all duration-300"
      style={{
        borderColor: enabled ? `${accentHex}66` : 'rgba(255, 255, 255, 0.14)',
        backgroundColor: enabled ? `${accentHex}14` : 'rgba(255, 255, 255, 0.03)',
        color: enabled ? '#FFFFFF' : 'rgb(161, 161, 170)',
      }}
    >
      {/* 4-bar micro equalizer */}
      <span
        className="flex h-3 items-end gap-[2px]"
        aria-hidden="true"
      >
        <span
          className={`w-[2px] origin-bottom rounded-full transition-colors duration-300 ${
            enabled ? 'animate-eq-1 h-full' : 'h-[45%]'
          }`}
          style={{ backgroundColor: enabled ? accentHex : 'rgba(161, 161, 170, 0.65)' }}
        />
        <span
          className={`w-[2px] origin-bottom rounded-full transition-colors duration-300 ${
            enabled ? 'animate-eq-2 h-full' : 'h-[75%]'
          }`}
          style={{ backgroundColor: enabled ? accentHex : 'rgba(161, 161, 170, 0.65)' }}
        />
        <span
          className={`w-[2px] origin-bottom rounded-full transition-colors duration-300 ${
            enabled ? 'animate-eq-3 h-full' : 'h-[55%]'
          }`}
          style={{ backgroundColor: enabled ? accentHex : 'rgba(161, 161, 170, 0.65)' }}
        />
        <span
          className={`w-[2px] origin-bottom rounded-full transition-colors duration-300 ${
            enabled ? 'animate-eq-4 h-full' : 'h-[35%]'
          }`}
          style={{ backgroundColor: enabled ? accentHex : 'rgba(161, 161, 170, 0.65)' }}
        />
      </span>
      <span className="hidden xl:inline">{labelText}</span>
    </button>
  )
}
