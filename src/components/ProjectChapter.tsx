import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  Award,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Monitor,
} from 'lucide-react'
import { PROFILE_DATA } from '../data/profileData'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang, MediaAsset, ProjectData } from '../types/portfolio'
import { mediaUrl } from '../utils/mediaUrl'
import { ShaderImagePortal } from './ShaderImagePortal'
import { SoftwareIconBadge } from './SoftwareIconBadge'
import { VideoPlayer } from './VideoPlayer'
import { InteractiveProjectLab } from './webgl/InteractiveProjectLab'

gsap.registerPlugin(ScrollTrigger)

export interface NextProjectLink {
  slug: string
  indexLabel: string
  title: string
  accentHex: string
}

export interface ProjectChapterProps {
  project: ProjectData
  lang: Lang
  onOpenLightbox: (items: MediaAsset[], index: number) => void
  onJumpTo?: (selector: string) => void
  nextProject?: NextProjectLink | null
  soundEnabled?: boolean
}

export const ProjectChapter: React.FC<ProjectChapterProps> = ({
  project,
  lang,
  onOpenLightbox,
  onJumpTo,
  nextProject = null,
  soundEnabled = false,
}) => {
  const [showArchiveExtras, setShowArchiveExtras] = useState(false)
  const articleRef = useRef<HTMLElement>(null)
  const watermarkRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)

  const linkedAwards = PROFILE_DATA.awards.filter((a) =>
    project.awardRefs?.includes(a.id)
  )

  const mediaMap = new Map(project.gallery.map((m) => [m.id, m]))
  const videoMap = new Map(project.videos.map((v) => [v.id, v]))
  const totalProjectsLabel = String(PROJECTS_DATA.length).padStart(2, '0')
  const isEvenOrder = project.order % 2 === 0

  const primaryVideoIdByProject: Partial<Record<ProjectData['id'], string>> = {
    'cronicas-de-palenque': 'palenque-main',
    'kane-no-hibiki': 'kane-video-main',
    reminiscencia: 'rem-gameplay',
    vestigio: 'ves-hand-tracking',
  }
  const primaryVideoId = primaryVideoIdByProject[project.id]
  const primaryVideo = primaryVideoId ? videoMap.get(primaryVideoId) : undefined

  const usedVideoIds = new Set<string>()
  if (primaryVideo) usedVideoIds.add(primaryVideo.id)
  project.chapters.forEach((ch) => {
    if (ch.videoId) usedVideoIds.add(ch.videoId)
  })
  const remainingVideos = project.videos.filter((v) => !usedVideoIds.has(v.id))

  const folderExtras = project.gallery.filter((g) => g.group === 'folder-extra')
  const pdfGridOrPrimary = project.gallery.filter(
    (g) => g.group !== 'folder-extra'
  )

  // Determine which media IDs were already placed inside chapters so we display remaining PDF stills cleanly in Showcase Grid
  const usedInChapters = new Set<string>()
  project.chapters.forEach((ch) =>
    ch.mediaIds?.forEach((id) => usedInChapters.add(id))
  )
  const remainingPdfStills = pdfGridOrPrimary.filter(
    (m) => !usedInChapters.has(m.id)
  )

  // Subtle museum-grade GSAP ScrollTrigger parallax & editorial motion
  // Respects prefers-reduced-motion, cleans up via gsap.context(), and never hides content at opacity: 0
  useEffect(() => {
    const el = articleRef.current
    if (!el || typeof window === 'undefined') return

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    // Skip in headless/jsdom environments where layout dimensions are 0
    if (el.getBoundingClientRect().height <= 0) return

    const ctx = gsap.context(() => {
      if (watermarkRef.current) {
        gsap.fromTo(
          watermarkRef.current,
          { y: -28 },
          {
            y: 38,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        )
      }

      if (coverRef.current) {
        gsap.fromTo(
          coverRef.current,
          { y: 18 },
          {
            y: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: coverRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.5,
            },
          }
        )
      }
    }, articleRef)

    return () => ctx.revert()
  }, [])

  const openAssetInFullGallery = (assetId: string) => {
    const idx = project.gallery.findIndex((g) => g.id === assetId)
    onOpenLightbox(project.gallery, idx >= 0 ? idx : 0)
  }

  return (
    <article
      ref={articleRef}
      id={`project-${project.slug}`}
      data-project-id={project.id}
      className="relative scroll-mt-[136px] overflow-x-clip py-20 sm:py-28"
    >
      {/* Crisp 1px architectural chapter divider with accent fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${project.theme.accentHex}70 22%, rgba(255,255,255,0.12) 60%, transparent 100%)`,
        }}
      />

      {/* Rich ambient project chromatic bleed */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-12 h-[480px] w-[480px] rounded-full opacity-[0.16] blur-[155px] ${
          isEvenOrder ? '-left-24' : '-right-24'
        }`}
        style={{ background: project.theme.accentHex }}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-24 h-[360px] w-[360px] rounded-full opacity-[0.09] blur-[140px] ${
          isEvenOrder ? 'right-0' : 'left-0'
        }`}
        style={{ background: project.theme.secondaryHex }}
      />

      {/* Oversized atmospheric watermark numeral */}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        className={`pointer-events-none absolute top-6 z-0 select-none font-display text-[clamp(7.5rem,20vw,16rem)] font-extrabold leading-none tracking-tighter text-stroke-subtle opacity-[0.14] ${
          isEvenOrder ? 'left-2 sm:left-8' : 'right-2 sm:right-8'
        }`}
      >
        {project.indexLabel}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* ======================== EDITORIAL EXHIBITION HEADER ======================== */}
        <header className="relative mb-14 rounded-2xl border-b border-white/[0.08] pb-10">
          {/* Soft obsidian legibility vignette so metadata never washes out over fluid highlights */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-4 -top-4 bottom-0 -z-10 rounded-2xl bg-[radial-gradient(ellipse_90%_85%_at_22%_45%,rgba(5,6,10,0.72)_0%,rgba(5,6,10,0.35)_55%,transparent_88%)]"
          />
          {/* Architectural Metadata Rail */}
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.18em] uppercase">
            <span
              className="inline-flex items-center gap-2 font-bold"
              style={{ color: project.theme.accentHex }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: project.theme.accentHex,
                  boxShadow: `0 0 10px ${project.theme.accentHex}`,
                }}
              />
              {project.indexLabel} / {totalProjectsLabel}
            </span>
            <span className="text-white/20">/</span>
            <span className="text-zinc-400">{project.pdfPages}</span>
            <span className="text-white/20">/</span>
            <span className="text-zinc-200">{project.projectType[lang]}</span>
            {project.studioOrContext && (
              <>
                <span className="hidden text-white/20 sm:inline">/</span>
                <span className="text-zinc-400">
                  {project.studioOrContext[lang]}
                </span>
              </>
            )}
          </div>

          {/* Differentiated Title Lockups per Project */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              {project.id === 'kane-no-hibiki' && project.titleLogos ? (
                <div className="mb-5 flex flex-wrap items-center gap-6">
                  <img
                    src={mediaUrl(project.titleLogos.primary)}
                    alt="Kane no Hibiki"
                    decoding="async"
                    className="h-14 w-auto object-contain drop-shadow-[0_6px_24px_rgba(251,113,133,0.35)] sm:h-20"
                  />
                  {project.titleLogos.secondary && (
                    <img
                      src={mediaUrl(project.titleLogos.secondary)}
                      alt="鐘の響き"
                      decoding="async"
                      className="h-12 w-auto object-contain opacity-90 sm:h-16"
                    />
                  )}
                </div>
              ) : project.id === 'sogno' && project.titleLogos ? (
                <div className="mb-5 flex flex-wrap items-center gap-5">
                  <img
                    src={mediaUrl(project.titleLogos.primary)}
                    alt="SOGNO"
                    decoding="async"
                    className="h-12 w-auto object-contain sm:h-[4.5rem]"
                  />
                  {project.titleLogos.secondary && (
                    <img
                      src={mediaUrl(project.titleLogos.secondary)}
                      alt="SOGNO 2"
                      decoding="async"
                      className="h-14 w-auto object-contain sm:h-20"
                    />
                  )}
                </div>
              ) : project.id === 'notas-y-colores' && project.titleLogos ? (
                <div className="mb-5 flex flex-wrap items-center gap-5">
                  <img
                    src={mediaUrl(project.titleLogos.primary)}
                    alt="Notas & Colores"
                    decoding="async"
                    className="h-20 w-auto object-contain drop-shadow-[0_12px_30px_rgba(236,72,153,0.35)] sm:h-28"
                  />
                  <span className="font-mono text-xs tracking-widest text-cyan-300 uppercase">
                    Un viaje por la Música
                  </span>
                </div>
              ) : project.id === 'the-amazing-digital-circus-2' &&
                project.titleLogos ? (
                <img
                  src={mediaUrl(project.titleLogos.primary)}
                  alt="The Amazing Digital Circus 2"
                  decoding="async"
                  className="mb-5 h-20 w-auto object-contain drop-shadow-[0_12px_28px_rgba(239,68,68,0.35)] sm:h-32"
                />
              ) : project.id === 'vestigio' && project.titleLogos ? (
                <img
                  src={mediaUrl(project.titleLogos.primary)}
                  alt="ALFAR: Arqueologías del Barro"
                  decoding="async"
                  className="mb-5 h-16 w-auto object-contain drop-shadow-[0_10px_28px_rgba(245,158,11,0.3)] sm:h-24"
                />
              ) : null}

              <h2 className="font-display text-[clamp(2.15rem,5.2vw,4.25rem)] font-extrabold leading-[1.03] tracking-tight text-white break-words">
                {project.title}
                {project.nativeTitle && (
                  <span
                    className="ml-3 text-[0.58em] font-semibold"
                    style={{ color: project.theme.accentHex }}
                  >
                    {project.nativeTitle}
                  </span>
                )}
              </h2>
            </div>

            {linkedAwards.length > 0 && (
              <div className="flex shrink-0 flex-col gap-2">
                {linkedAwards.map((aw) => (
                  <div
                    key={aw.id}
                    className="inline-flex items-center gap-3 rounded-2xl border border-[#2EFF7B]/30 bg-[#070910]/85 px-4 py-3 backdrop-blur-xl"
                  >
                    <Award className="h-4 w-4 shrink-0 text-[#2EFF7B]" />
                    <div className="text-xs">
                      <p className="font-sans font-semibold text-white">
                        {aw.title[lang]}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-400">
                        {aw.project} · {aw.venue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* ======================== ASYMMETRIC OVERVIEW & COVER COMPOSITION ======================== */}
        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Editorial Overview & Technical Dossier */}
          <div
            className={`relative min-w-0 space-y-7 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#070910]/85 p-6 backdrop-blur-xl sm:p-8 lg:col-span-7 ${
              isEvenOrder ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-75"
              style={{
                background: `linear-gradient(90deg, transparent, ${project.theme.accentHex}88, transparent)`,
              }}
            />

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <h3
                className="font-mono text-[11px] font-bold tracking-[0.26em] uppercase"
                style={{ color: project.theme.accentHex }}
              >
                {lang === 'en' ? 'OVERVIEW' : 'VISIÓN GENERAL'}
              </h3>
              <span className="font-mono text-[11px] text-zinc-400">
                EXHIBIT #{project.indexLabel}
              </span>
            </div>

            <div className="space-y-4 text-base leading-[1.75] text-zinc-200 sm:text-[17px]">
              {project.overviewParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={
                    i === 0 ? 'text-zinc-100 sm:text-[18px]' : 'text-zinc-300'
                  }
                >
                  {para[lang]}
                </p>
              ))}
            </div>

            {/* Architectural Hairline Technical Spec Sheet */}
            <div className="grid gap-y-5 border-t border-white/[0.08] pt-6 sm:grid-cols-2 sm:gap-x-8">
              <div className="border-l border-white/15 pl-4">
                <div className="mb-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
                  <Layers
                    className="h-3.5 w-3.5"
                    style={{ color: project.theme.accentHex }}
                  />
                  <span>
                    {lang === 'en' ? 'Project Type' : 'Tipo de Proyecto'}
                  </span>
                </div>
                <p className="font-sans text-sm font-medium text-white">
                  {project.projectType[lang]}
                </p>
              </div>

              {project.platforms && (
                <div className="border-l border-white/15 pl-4">
                  <div className="mb-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
                    <Monitor
                      className="h-3.5 w-3.5"
                      style={{ color: project.theme.secondaryHex }}
                    />
                    <span>{lang === 'en' ? 'Platforms' : 'Plataformas'}</span>
                  </div>
                  <p className="font-sans text-sm font-medium text-white">
                    {project.platforms[lang]}
                  </p>
                </div>
              )}

              <div
                className={`border-l border-white/15 pl-4 ${
                  project.platforms ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="mb-1 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
                  <Cpu
                    className="h-3.5 w-3.5"
                    style={{ color: project.theme.secondaryHex }}
                  />
                  <span>
                    {lang === 'en' ? 'Technologies' : 'Tecnologías'}
                  </span>
                </div>
                <p className="font-sans text-sm font-medium text-zinc-100">
                  {project.technologies[lang]}
                </p>
              </div>
            </div>

            {/* Software Studio Micro-Chips */}
            <div className="border-t border-white/[0.08] pt-5">
              <p className="mb-3 font-mono text-[10px] font-semibold tracking-[0.24em] text-zinc-400 uppercase">
                Software
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.software.map((sw) => (
                  <SoftwareIconBadge key={sw} id={sw} />
                ))}
              </div>
            </div>
          </div>

          {/* Framed Cover Key Art */}
          <div
            ref={coverRef}
            className={`min-w-0 lg:col-span-5 ${
              isEvenOrder ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <figure
              className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#070910]"
              style={{
                boxShadow: `0 28px 80px -30px ${project.theme.glowRgba}`,
              }}
            >
              <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-[#05060A] p-4 sm:min-h-[440px]">
                <img
                  src={mediaUrl(project.coverImage)}
                  alt=""
                  aria-hidden="true"
                  loading={project.order <= 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-2xl"
                />
                <img
                  src={mediaUrl(project.coverImage)}
                  alt={project.coverAlt[lang]}
                  loading={project.order <= 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="relative z-10 max-h-[480px] w-auto max-w-full rounded-xl object-contain shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <figcaption className="relative z-10 flex items-center justify-between border-t border-white/[0.08] bg-[#070910]/95 px-4 py-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
                  {lang === 'en' ? 'OFFICIAL COVER KEY ART' : 'PORTADA OFICIAL'}
                </span>
                <span
                  className="font-mono text-[11px] font-bold"
                  style={{ color: project.theme.accentHex }}
                >
                  {project.indexLabel}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* ======================== PRIMARY VIDEO REEL (IF PRESENT) ======================== */}
        {primaryVideo && (
          <div className="mt-14">
            <VideoPlayer
              video={primaryVideo}
              lang={lang}
              accentHex={project.theme.accentHex}
            />
          </div>
        )}

        {/* ======================== INTERACTIVE GLSL TECH LAB ======================== */}
        <div className="mt-14">
          <InteractiveProjectLab
            project={project}
            lang={lang}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* ======================== TADC2 CHARACTER RIG CUTOUTS SHOWCASE ======================== */}
        {project.id === 'the-amazing-digital-circus-2' &&
          project.characterCutouts && (
            <div className="mt-14 grid items-center gap-8 rounded-2xl border border-white/[0.09] bg-[#070910]/85 bg-gradient-to-r from-red-500/[0.06] via-[#070910]/85 to-fuchsia-500/[0.06] p-6 backdrop-blur-xl sm:grid-cols-3 sm:p-8">
              <div className="flex justify-center">
                <img
                  src={mediaUrl(project.characterCutouts[0])}
                  alt="Caine 3D Character Rig"
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-auto object-contain drop-shadow-[0_14px_30px_rgba(239,68,68,0.35)] transition-transform duration-500 hover:-translate-y-2"
                />
              </div>
              <div className="text-center">
                <span className="font-mono text-[10px] font-bold tracking-[0.24em] text-fuchsia-300 uppercase">
                  {lang === 'en'
                    ? 'ELASTIC 3D CHARACTER RIGS'
                    : 'RIGS ELÁSTICOS 3D'}
                </span>
                <p className="mt-2 font-sans text-2xl font-bold tracking-tight text-white">
                  Squash, Stretch &amp; LookDev
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-300">
                  {lang === 'en'
                    ? 'Custom facial & body rigs sculpted for extreme cartoon expressiveness and retro-digital shading.'
                    : 'Rigs faciales y corporales personalizados para expresividad extrema y shaders retro-digitales.'}
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src={mediaUrl(project.characterCutouts[1])}
                  alt="Caine Close-Up 3D Rig"
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-auto object-contain drop-shadow-[0_14px_30px_rgba(217,70,239,0.35)] transition-transform duration-500 hover:-translate-y-2"
                />
              </div>
            </div>
          )}

        {/* ======================== EDITORIAL CHAPTERS & HIGHLIGHTS ======================== */}
        {project.chapters.length > 0 && (
          <div className="mt-14 space-y-10">
            {project.chapters.map((chapter, chIndex) => {
              const chapterMedia = (chapter.mediaIds || [])
                .map((id) => mediaMap.get(id))
                .filter((m): m is MediaAsset => Boolean(m))
              const chapterVideo = chapter.videoId
                ? videoMap.get(chapter.videoId)
                : undefined
              const hasMedia = Boolean(chapterVideo || chapterMedia.length > 0)
              const flipChapter = (project.order + chIndex) % 2 === 1 && hasMedia

              return (
                <section
                  key={chapter.id}
                  className="rounded-2xl border border-white/[0.09] bg-[#070910]/85 p-6 backdrop-blur-xl sm:p-8"
                >
                  <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/[0.08] pb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: project.theme.accentHex }}
                      >
                        {project.indexLabel}.{chIndex + 1}
                      </span>
                      <h3 className="font-sans text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {chapter.title[lang]}
                      </h3>
                    </div>
                  </div>

                  <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
                    {/* Text & Highlights */}
                    <div
                      className={`space-y-5 ${
                        hasMedia ? 'lg:col-span-6' : 'lg:col-span-12'
                      } ${flipChapter ? 'lg:order-2' : 'lg:order-1'}`}
                    >
                      {chapter.body?.map((p, idx) => (
                        <p
                          key={idx}
                          className="text-sm leading-[1.78] text-zinc-200 sm:text-[16px]"
                        >
                          {p[lang]}
                        </p>
                      ))}

                      {chapter.highlights && chapter.highlights.length > 0 && (
                        <div className="space-y-4">
                          {chapter.highlights.map((hl, idx) => (
                            <div
                              key={idx}
                              className="rounded-r-xl border-l-2 bg-white/[0.025] py-3 pr-4 pl-5"
                              style={{
                                borderLeftColor: `${project.theme.accentHex}99`,
                              }}
                            >
                              <h4
                                className="font-sans text-sm font-semibold tracking-tight sm:text-[15px]"
                                style={{ color: project.theme.accentHex }}
                              >
                                {hl.title[lang]}
                              </h4>
                              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-zinc-300">
                                {hl.bullets.map((b, bIdx) => (
                                  <li
                                    key={bIdx}
                                    className="flex items-start gap-2.5"
                                  >
                                    <span
                                      className="mt-2 h-1 w-1 shrink-0 rounded-full"
                                      style={{
                                        backgroundColor:
                                          project.theme.secondaryHex,
                                      }}
                                    />
                                    <span>{b[lang]}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chapter Paired Media & Video */}
                    {hasMedia && (
                      <div
                        className={`space-y-4 lg:col-span-6 ${
                          flipChapter ? 'lg:order-1' : 'lg:order-2'
                        }`}
                      >
                        {chapterVideo && (
                          <VideoPlayer
                            video={chapterVideo}
                            lang={lang}
                            accentHex={project.theme.accentHex}
                          />
                        )}
                        {chapterMedia.length > 0 && (
                          <div
                            className={`grid items-stretch gap-4 ${
                              chapterMedia.length === 1
                                ? 'grid-cols-1'
                                : 'sm:grid-cols-2'
                            }`}
                          >
                            {chapterMedia.map((asset, mIdx) => (
                              <ShaderImagePortal
                                key={asset.id}
                                asset={asset}
                                lang={lang}
                                accentHex={project.theme.accentHex}
                                aspect={asset.aspect}
                                onOpen={() => openAssetInFullGallery(asset.id)}
                                priority={
                                  project.order === 1 &&
                                  chIndex === 0 &&
                                  mIdx === 0
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* ======================== ADDITIONAL MOTION & VIDEO DOCUMENTATION ======================== */}
        {remainingVideos.length > 0 && (
          <div className="mt-16 border-t border-white/[0.08] pt-10">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-mono text-[11px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
                {lang === 'en'
                  ? 'MOTION & SYSTEM DOCUMENTATION'
                  : 'REGISTRO AUDIOVISUAL DEL SISTEMA'}
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                {remainingVideos.length}{' '}
                {lang === 'en' ? 'REELS' : 'VIDEOS'}
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {remainingVideos.map((vid) => (
                <VideoPlayer
                  key={vid.id}
                  video={vid}
                  lang={lang}
                  accentHex={project.theme.accentHex}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================== REMAINING PDF SHOWCASE STILLS ======================== */}
        {remainingPdfStills.length > 0 && (
          <div className="mt-16 border-t border-white/[0.08] pt-10">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-mono text-[11px] font-bold tracking-[0.24em] text-zinc-400 uppercase">
                {project.order <= 5
                  ? lang === 'en'
                    ? 'VISUAL SHOWCASE SEQUENCE (PDF ORDER)'
                    : 'SECUENCIA VISUAL DE EXHIBICIÓN (ORDEN PDF)'
                  : lang === 'en'
                    ? 'VISUAL SHOWCASE SEQUENCE'
                    : 'SECUENCIA VISUAL DE EXHIBICIÓN'}
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                {remainingPdfStills.length}{' '}
                {lang === 'en' ? 'FRAMES' : 'CUADROS'}
              </span>
            </div>

            <div
              className={`grid items-stretch gap-4 sm:grid-cols-2 ${
                remainingPdfStills.length === 2 ? '' : 'lg:grid-cols-3'
              }`}
            >
              {remainingPdfStills.map((asset, i) => {
                const len = remainingPdfStills.length
                const isLeadSpan =
                  len !== 2 &&
                  ((len === 5 && i === 0) || (i === 0 && len % 3 === 1))
                const spanClass =
                  len === 5 && i === 0
                    ? 'sm:col-span-2'
                    : len !== 2 && i === 0 && len % 3 === 1
                      ? 'sm:col-span-2 lg:col-span-3'
                      : ''

                return (
                  <ShaderImagePortal
                    key={asset.id}
                    asset={asset}
                    lang={lang}
                    accentHex={project.theme.accentHex}
                    aspect={isLeadSpan ? 'wide' : asset.aspect}
                    onOpen={() => openAssetInFullGallery(asset.id)}
                    priority={project.order === 1 && i === 0}
                    className={spanClass}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* ======================== CLOSING QUOTE (PALENQUE P10) ======================== */}
        {project.closingQuote && (
          <blockquote
            className="mt-16 rounded-2xl border border-white/[0.09] bg-[#070910]/85 px-6 py-10 text-center font-sans text-xl font-medium tracking-tight text-zinc-100 backdrop-blur-xl sm:text-3xl"
            style={{
              borderColor: `${project.theme.accentHex}44`,
            }}
          >
            &ldquo;{project.closingQuote[lang]}&rdquo;
          </blockquote>
        )}

        {/* ======================== COLLAPSIBLE ARCHIVE / BTS / WIP DRAWER ======================== */}
        {folderExtras.length > 0 && (
          <div className="mt-14 border-t border-white/[0.08] pt-6">
            <button
              type="button"
              onClick={() => setShowArchiveExtras((v) => !v)}
              aria-expanded={showArchiveExtras}
              className="group flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.09] bg-[#070910]/85 px-5 py-4 text-left backdrop-blur-xl transition-colors duration-200 hover:border-white/25 hover:bg-[#0B0E18]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B]"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-zinc-200 uppercase">
                  {lang === 'en'
                    ? 'PROJECT ARCHIVE · BTS / WIP'
                    : 'ARCHIVO DEL PROYECTO · BTS / WIP'}
                </span>
                <span
                  className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    borderColor: `${project.theme.accentHex}55`,
                    backgroundColor: `${project.theme.accentHex}14`,
                    color: project.theme.accentHex,
                  }}
                >
                  +{folderExtras.length}{' '}
                  {lang === 'en' ? 'FRAMES' : 'CAPTURAS'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Preview thumbnail peek strip when collapsed */}
                {!showArchiveExtras && (
                  <div
                    aria-hidden="true"
                    className="hidden items-center -space-x-2 sm:flex"
                  >
                    {folderExtras.slice(0, 3).map((extra) => (
                      <img
                        key={extra.id}
                        src={mediaUrl(extra.src)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-7 w-11 rounded border border-white/20 object-cover opacity-70 transition-opacity group-hover:opacity-100"
                      />
                    ))}
                  </div>
                )}

                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 transition-colors group-hover:text-white">
                  <span>
                    {showArchiveExtras
                      ? lang === 'en'
                        ? 'Collapse'
                        : 'Ocultar'
                      : lang === 'en'
                        ? 'Inspect Archive'
                        : 'Explorar Archivo'}
                  </span>
                  {showArchiveExtras ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              </div>
            </button>

            {showArchiveExtras && (
              <div className="mt-5 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {folderExtras.map((asset) => (
                  <ShaderImagePortal
                    key={asset.id}
                    asset={asset}
                    lang={lang}
                    accentHex={project.theme.accentHex}
                    aspect={asset.aspect}
                    onOpen={() => openAssetInFullGallery(asset.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================== CINEMATIC "NEXT WORK ->" BRIDGE ======================== */}
        {nextProject && (
          <div className="mt-16 border-t border-white/[0.08] pt-8">
            <button
              type="button"
              data-cursor="NEXT"
              onClick={() => onJumpTo?.(`#project-${nextProject.slug}`)}
              className="group relative flex w-full items-center justify-between gap-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015] px-6 py-6 text-left transition-all duration-300 hover:border-white/25 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B] sm:px-8 sm:py-7"
            >
              {/* Hover accent glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(600px circle at 85% 50%, ${nextProject.accentHex}24, transparent 70%)`,
                }}
              />

              <div className="relative z-10 min-w-0">
                <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.22em] text-zinc-400 uppercase">
                  <span>{lang === 'en' ? 'NEXT WORK' : 'SIGUIENTE OBRA'}</span>
                  <span style={{ color: nextProject.accentHex }}>
                    {nextProject.indexLabel}
                  </span>
                </div>
                <p className="mt-2 truncate font-display text-2xl font-bold tracking-tight text-white transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
                  {nextProject.title}
                </p>
              </div>

              <span
                className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/50 text-zinc-200 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"
                style={{
                  borderColor: `${nextProject.accentHex}66`,
                  boxShadow: `0 0 28px -8px ${nextProject.accentHex}88`,
                }}
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
