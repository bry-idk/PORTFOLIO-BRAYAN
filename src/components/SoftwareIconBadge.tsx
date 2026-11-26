import React from 'react'
import { SOFTWARE_META } from '../data/projectsData'
import { SoftwareId } from '../types/portfolio'

export interface SoftwareIconBadgeProps {
  id: SoftwareId
}

export const SoftwareIconBadge: React.FC<SoftwareIconBadgeProps> = ({ id }) => {
  const meta = SOFTWARE_META[id]

  return (
    <div
      title={meta.name}
      className="group relative inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.06]"
    >
      <span
        className="flex h-4 min-w-[1.25rem] items-center justify-center rounded-[3px] border px-1 font-mono text-[9px] font-bold leading-none tracking-tight transition-colors duration-200"
        style={{
          color: meta.color,
          borderColor: `${meta.color}40`,
          backgroundColor: `${meta.color}12`,
        }}
      >
        {meta.short}
      </span>
      <span className="font-mono text-[11px] font-medium tracking-tight text-zinc-300 transition-colors duration-200 group-hover:text-white">
        {meta.name}
      </span>
    </div>
  )
}
