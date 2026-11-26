import React, { useEffect, useRef } from 'react'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang, MediaAsset, ProjectId } from '../types/portfolio'
import { NextProjectLink, ProjectChapter } from './ProjectChapter'

export interface ProjectsShowcaseProps {
  lang: Lang
  activeProjectId: ProjectId | null
  onJumpTo: (selector: string) => void
  onOpenLightbox: (items: MediaAsset[], index: number) => void
  soundEnabled?: boolean
}

export const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({
  lang,
  activeProjectId,
  onJumpTo,
  onOpenLightbox,
  soundEnabled = false,
}) => {
  const dockRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const totalCountLabel = String(PROJECTS_DATA.length).padStart(2, '0')
  const activeProject =
    PROJECTS_DATA.find((p) => p.id === activeProjectId) || null
  const activeIndexLabel = activeProject ? activeProject.indexLabel : '01'
  const activeAccent = activeProject?.theme.accentHex || '#2EFF7B'

  // Smoothly auto-center active project pill horizontally inside dock
  useEffect(() => {
    if (!activeProjectId) return
    const pill = pillRefs.current[activeProjectId]
    const dock = dockRef.current
    if (!pill || !dock) return

    // Only invoke scrollIntoView when the sticky dock is already within viewport
    // so horizontal centering never causes an unwanted vertical jump.
    const dockRect = dock.getBoundingClientRect()
    const dockVisible =
      dockRect.height > 0 &&
      dockRect.top >= 0 &&
      dockRect.bottom <= window.innerHeight

    if (dockVisible && typeof pill.scrollIntoView === 'function') {
      try {
        pill.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      } catch {
        // Safe jsdom fallback
      }
    }
  }, [activeProjectId])

  return (
    <section id="works" className="relative z-10">
      {/* Flush Seamless Sticky Chapter Dock directly below Navbar */}
      <div
        ref={dockRef}
        className="sticky top-[64px] z-40 w-full border-y border-white/[0.08] bg-[#06070B]/95 backdrop-blur-2xl"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2 sm:px-8 lg:px-12">
          {/* Live Chapter Counter */}
          <div className="flex shrink-0 items-center gap-2 border-r border-white/10 pr-3 font-mono text-[11px] tracking-wider">
            <span
              className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: activeAccent,
                boxShadow: `0 0 10px ${activeAccent}`,
              }}
            />
            <span className="font-semibold text-zinc-100">
              {activeIndexLabel}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">{totalCountLabel}</span>
          </div>

          {/* Edge-faded Horizontal Chapter Pills */}
          <div
            className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-3 py-0.5"
            style={{
              maskImage:
                'linear-gradient(to right, transparent 0%, black 18px, black calc(100% - 18px), transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, black 18px, black calc(100% - 18px), transparent 100%)',
            }}
          >
            {PROJECTS_DATA.map((p) => {
              const isActive = activeProjectId === p.id
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    pillRefs.current[p.id] = el
                  }}
                  type="button"
                  onClick={() => onJumpTo(`#project-${p.slug}`)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2EFF7B] ${
                    isActive
                      ? 'bg-white/[0.1] text-white'
                      : 'border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                  style={{
                    borderColor: isActive
                      ? `${p.theme.accentHex}88`
                      : 'transparent',
                    boxShadow: isActive
                      ? `0 0 18px -6px ${p.theme.accentHex}80`
                      : undefined,
                  }}
                >
                  <span
                    className="font-bold"
                    style={{ color: p.theme.accentHex }}
                  >
                    {p.indexLabel}
                  </span>
                  <span className="whitespace-nowrap">{p.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Render all portfolio projects in curated presentation order */}
      {PROJECTS_DATA.map((project, index) => {
        const next = PROJECTS_DATA[index + 1]
        const nextProject: NextProjectLink | null = next
          ? {
              slug: next.slug,
              indexLabel: next.indexLabel,
              title: next.title,
              accentHex: next.theme.accentHex,
            }
          : null

        return (
          <ProjectChapter
            key={project.id}
            project={project}
            lang={lang}
            onOpenLightbox={onOpenLightbox}
            onJumpTo={onJumpTo}
            nextProject={nextProject}
            soundEnabled={soundEnabled}
          />
        )
      })}
    </section>
  )
}
