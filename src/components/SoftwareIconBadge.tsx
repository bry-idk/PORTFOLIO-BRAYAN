import React from 'react'
import { SOFTWARE_META } from '../data/projectsData'
import { SoftwareId } from '../types/portfolio'

interface Props {
  id: SoftwareId
}

export const SoftwareIconBadge: React.FC<Props> = ({ id }) => {
  const meta = SOFTWARE_META[id]

  return (
    <div
      title={meta.name}
      className="group relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0D1018]/90 px-2.5 py-1.5 backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08]"
    >
      <span
        className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/15 font-mono text-[10px] font-bold tracking-tighter shadow-inner"
        style={{
          color: meta.color,
          background: `radial-gradient(circle at 30% 25%, ${meta.color}26, rgba(10,12,18,0.95))`,
        }}
      >
        {meta.short}
      </span>
      <span className="font-sans text-xs font-medium text-zinc-200 group-hover:text-white">
        {meta.name}
      </span>
    </div>
  )
}
