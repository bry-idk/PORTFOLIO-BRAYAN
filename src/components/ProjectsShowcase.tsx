import React from 'react'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang, MediaAsset, ProjectId } from '../types/portfolio'
import { ProjectChapter } from './ProjectChapter'

interface Props {
  lang: Lang
  activeProjectId: ProjectId | null
  onJumpTo: (selector: string) => void
  onOpenLightbox: (items: MediaAsset[], index: number) => void
}

export const ProjectsShowcase: React.FC<Props> = ({
  lang,
  activeProjectId,
  onJumpTo,
  onOpenLightbox,
}) => {
  return (
    <section id="works" className="relative z-10">
      {/* Sticky Project Chapter Dock */}
      <div className="sticky top-[68px] z-40 mx-auto w-full max-w-7xl px-4 py-2 sm:px-8 lg:px-12">
        <div className="flex w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-[#07090F]/85 p-1.5 backdrop-blur-xl no-scrollbar">
          {PROJECTS_DATA.map((p) => {
            const isActive = activeProjectId === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onJumpTo(`#project-${p.slug}`)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-white/[0.12] text-white'
                    : 'border-transparent text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200'
                }`}
                style={{
                  borderColor: isActive ? `${p.theme.accentHex}88` : 'transparent',
                }}
              >
                <span style={{ color: p.theme.accentHex }}>{p.indexLabel}</span>
                <span>{p.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Render all portfolio projects in curated presentation order */}
      {PROJECTS_DATA.map((project) => (
        <ProjectChapter
          key={project.id}
          project={project}
          lang={lang}
          onOpenLightbox={onOpenLightbox}
        />
      ))}
    </section>
  )
}
