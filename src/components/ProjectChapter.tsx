import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, ChevronDown, ChevronUp, Cpu, Layers, Monitor } from 'lucide-react'
import { PROFILE_DATA } from '../data/profileData'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang, MediaAsset, ProjectData } from '../types/portfolio'
import { ShaderImagePortal } from './ShaderImagePortal'
import { SoftwareIconBadge } from './SoftwareIconBadge'
import { VideoPlayer } from './VideoPlayer'
import { InteractiveProjectLab } from './webgl/InteractiveProjectLab'

interface Props {
  project: ProjectData
  lang: Lang
  onOpenLightbox: (items: MediaAsset[], index: number) => void
}

export const ProjectChapter: React.FC<Props> = ({
  project,
  lang,
  onOpenLightbox,
}) => {
  const [showArchiveExtras, setShowArchiveExtras] = useState(true)

  const linkedAwards = PROFILE_DATA.awards.filter((a) =>
    project.awardRefs?.includes(a.id)
  )

  const mediaMap = new Map(project.gallery.map((m) => [m.id, m]))
  const videoMap = new Map(project.videos.map((v) => [v.id, v]))
  const totalProjectsLabel = String(PROJECTS_DATA.length).padStart(2, '0')

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

  const openAssetInFullGallery = (assetId: string) => {
    const idx = project.gallery.findIndex((g) => g.id === assetId)
    onOpenLightbox(project.gallery, idx >= 0 ? idx : 0)
  }

  return (
    <article
      id={`project-${project.slug}`}
      data-project-id={project.id}
      className="relative scroll-mt-24 overflow-x-clip border-t border-white/10 py-20 sm:py-28"
    >
      {/* Subtle project-specific ambient radial aura */}
      <div
        className="pointer-events-none absolute top-16 right-0 h-[420px] w-[420px] rounded-full opacity-20 blur-[140px]"
        style={{ background: project.theme.accentHex }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* ======================== PROJECT HEADER ======================== */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65 }}
          className="mb-12"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-full border px-3.5 py-1 font-mono text-xs font-bold tracking-widest uppercase"
              style={{
                borderColor: `${project.theme.accentHex}66`,
                backgroundColor: `${project.theme.accentHex}1A`,
                color: project.theme.accentHex,
              }}
            >
              {project.indexLabel} / {totalProjectsLabel} · {project.pdfPages}
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 font-mono text-xs text-zinc-300">
              {project.projectType[lang]}
            </span>
            {project.studioOrContext && (
              <span className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1 font-mono text-xs text-zinc-400">
                {project.studioOrContext[lang]}
              </span>
            )}
          </div>

          {/* Differentiated Title Lockups per Project */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {project.id === 'kane-no-hibiki' && project.titleLogos ? (
                <div className="flex flex-wrap items-center gap-6">
                  <img
                    src={project.titleLogos.primary}
                    alt="Kane no Hibiki"
                    className="h-16 w-auto object-contain drop-shadow-[0_6px_24px_rgba(251,113,133,0.35)] sm:h-24"
                  />
                  {project.titleLogos.secondary && (
                    <img
                      src={project.titleLogos.secondary}
                      alt="鐘の響き"
                      className="h-14 w-auto object-contain opacity-90 sm:h-20"
                    />
                  )}
                </div>
              ) : project.id === 'sogno' && project.titleLogos ? (
                <div className="flex flex-wrap items-center gap-5">
                  <img
                    src={project.titleLogos.primary}
                    alt="SOGNO"
                    className="h-14 w-auto object-contain sm:h-20"
                  />
                  {project.titleLogos.secondary && (
                    <img
                      src={project.titleLogos.secondary}
                      alt="SOGNO 2"
                      className="h-16 w-auto object-contain sm:h-24"
                    />
                  )}
                </div>
              ) : project.id === 'notas-y-colores' && project.titleLogos ? (
                <div className="flex flex-wrap items-center gap-5">
                  <img
                    src={project.titleLogos.primary}
                    alt="Notas & Colores"
                    className="h-24 w-auto object-contain drop-shadow-[0_12px_30px_rgba(236,72,153,0.35)] sm:h-32"
                  />
                  <span className="font-mono text-xs tracking-widest text-cyan-300 uppercase">
                    Un viaje por la Música
                  </span>
                </div>
              ) : project.id === 'the-amazing-digital-circus-2' &&
                project.titleLogos ? (
                <img
                  src={project.titleLogos.primary}
                  alt="The Amazing Digital Circus 2"
                  className="h-24 w-auto object-contain drop-shadow-[0_12px_28px_rgba(239,68,68,0.35)] sm:h-36"
                />
              ) : project.id === 'vestigio' && project.titleLogos ? (
                <img
                  src={project.titleLogos.primary}
                  alt="ALFAR: Arqueologías del Barro"
                  className="h-20 w-auto object-contain drop-shadow-[0_10px_28px_rgba(245,158,11,0.3)] sm:h-28"
                />
              ) : null}

              <h2
                className={`font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl ${
                  project.titleLogos ? 'mt-4' : ''
                }`}
              >
                {project.title}
                {project.nativeTitle && (
                  <span
                    className="ml-3 text-2xl font-semibold sm:text-4xl"
                    style={{ color: project.theme.accentHex }}
                  >
                    {project.nativeTitle}
                  </span>
                )}
              </h2>
            </div>

            {linkedAwards.length > 0 && (
              <div className="flex flex-col gap-2">
                {linkedAwards.map((aw) => (
                  <div
                    key={aw.id}
                    className="inline-flex items-center gap-2.5 rounded-2xl border border-[#2EFF7B]/35 bg-[#2EFF7B]/10 px-4 py-2.5 backdrop-blur-md"
                  >
                    <Award className="h-4 w-4 shrink-0 text-[#2EFF7B]" />
                    <div className="text-xs">
                      <p className="font-semibold text-white">
                        {aw.title[lang]}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-300">
                        {aw.project} · {aw.venue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ======================== OVERVIEW & COVER GRID ======================== */}
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Left: Overview & Tech Specs */}
          <div className="space-y-6 rounded-3xl border border-white/10 bg-[#0A0C13]/85 p-6 backdrop-blur-xl sm:p-8 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3
                className="font-mono text-xs font-bold tracking-[0.24em] uppercase"
                style={{ color: project.theme.accentHex }}
              >
                {lang === 'en' ? 'OVERVIEW' : 'VISIÓN GENERAL'}
              </h3>
              <span className="font-mono text-[11px] text-zinc-500">
                #{project.order}
              </span>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-zinc-200 sm:text-[17px]">
              {project.overviewParagraphs.map((para, i) => (
                <p key={i}>{para[lang]}</p>
              ))}
            </div>

            {/* Technical Metadata Pills */}
            <div className="grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase">
                  <Layers className="h-3.5 w-3.5" style={{ color: project.theme.accentHex }} />
                  <span>{lang === 'en' ? 'Project Type' : 'Tipo de Proyecto'}</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {project.projectType[lang]}
                </p>
              </div>

              {project.platforms && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase">
                    <Monitor className="h-3.5 w-3.5" style={{ color: project.theme.secondaryHex }} />
                    <span>{lang === 'en' ? 'Platforms' : 'Plataformas'}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {project.platforms[lang]}
                  </p>
                </div>
              )}

              <div
                className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${
                  project.platforms ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="mb-1.5 flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase">
                  <Cpu className="h-3.5 w-3.5" style={{ color: project.theme.secondaryHex }} />
                  <span>{lang === 'en' ? 'Technologies' : 'Tecnologías'}</span>
                </div>
                <p className="text-sm font-medium text-zinc-100">
                  {project.technologies[lang]}
                </p>
              </div>
            </div>

            {/* Software Badges */}
            <div className="border-t border-white/10 pt-5">
              <p className="mb-3 font-mono text-[11px] font-semibold tracking-widest text-zinc-400 uppercase">
                Software
              </p>
              <div className="flex flex-wrap gap-2">
                {project.software.map((sw) => (
                  <SoftwareIconBadge key={sw} id={sw} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Cover Artwork & Primary Showcase */}
          <div className="min-w-0 space-y-5 lg:col-span-5">
            <div
              className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#080A10] shadow-2xl"
              style={{
                boxShadow: `0 25px 70px -25px ${project.theme.glowRgba}`,
              }}
            >
              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-[#06070B] p-4 sm:min-h-[460px]">
                <img
                  src={project.coverImage}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-2xl"
                />
                <img
                  src={project.coverImage}
                  alt={project.coverAlt[lang]}
                  className="relative z-10 max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className="relative z-10 flex items-center justify-between border-t border-white/10 bg-[#07090F]/95 px-4 py-3">
                <span className="font-mono text-[11px] text-zinc-400">
                  {lang === 'en' ? 'OFFICIAL COVER KEY ART' : 'PORTADA OFICIAL'}
                </span>
                <span
                  className="font-mono text-[11px] font-semibold"
                  style={{ color: project.theme.accentHex }}
                >
                  {project.indexLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================== PRIMARY VIDEO REEL (IF PRESENT) ======================== */}
        {primaryVideo && (
          <div className="mt-10">
            <VideoPlayer
              video={primaryVideo}
              lang={lang}
              accentHex={project.theme.accentHex}
            />
          </div>
        )}

        {/* ======================== INTERACTIVE GLSL TECH LAB ======================== */}
        <div className="mt-12">
          <InteractiveProjectLab project={project} lang={lang} />
        </div>

        {/* ======================== TADC2 CHARACTER RIG CUTOUTS SHOWCASE ======================== */}
        {project.id === 'the-amazing-digital-circus-2' &&
          project.characterCutouts && (
            <div className="mt-12 grid items-center gap-6 rounded-3xl border border-white/12 bg-gradient-to-br from-red-500/10 via-[#0A0C13] to-fuchsia-500/10 p-6 sm:grid-cols-3 sm:p-8">
              <div className="flex justify-center">
                <img
                  src={project.characterCutouts[0]}
                  alt="Caine 3D Character Rig"
                  loading="lazy"
                  className="h-56 w-auto object-contain drop-shadow-[0_14px_30px_rgba(239,68,68,0.35)] transition-transform duration-500 hover:-translate-y-2"
                />
              </div>
              <div className="text-center">
                <span className="font-mono text-[11px] font-bold tracking-widest text-fuchsia-300 uppercase">
                  {lang === 'en' ? 'ELASTIC 3D CHARACTER RIGS' : 'RIGS ELÁSTICOS 3D'}
                </span>
                <p className="mt-2 font-display text-2xl font-bold text-white">
                  Squash, Stretch &amp; LookDev
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                  {lang === 'en'
                    ? 'Custom facial & body rigs sculpted for extreme cartoon expressiveness and retro-digital shading.'
                    : 'Rigs faciales y corporales personalizados para expresividad extrema y shaders retro-digitales.'}
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src={project.characterCutouts[1]}
                  alt="Caine Close-Up 3D Rig"
                  loading="lazy"
                  className="h-56 w-auto object-contain drop-shadow-[0_14px_30px_rgba(217,70,239,0.35)] transition-transform duration-500 hover:-translate-y-2"
                />
              </div>
            </div>
          )}

        {/* ======================== PDF CHAPTERS & HIGHLIGHTS ======================== */}
        <div className="mt-14 space-y-12">
          {project.chapters.map((chapter) => {
            const chapterMedia = (chapter.mediaIds || [])
              .map((id) => mediaMap.get(id))
              .filter((m): m is MediaAsset => Boolean(m))
            const chapterVideo = chapter.videoId
              ? videoMap.get(chapter.videoId)
              : undefined

            return (
              <div
                key={chapter.id}
                className="rounded-3xl border border-white/10 bg-[#080A10]/85 p-6 backdrop-blur-lg sm:p-8"
              >
                <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: project.theme.accentHex }}
                  />
                  <h3 className="font-display text-xl font-bold tracking-wide text-white sm:text-2xl">
                    {chapter.title[lang]}
                  </h3>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                  {/* Text & Highlights */}
                  <div
                    className={`space-y-5 ${
                      chapterVideo || chapterMedia.length > 0
                        ? 'lg:col-span-6'
                        : 'lg:col-span-12'
                    }`}
                  >
                    {chapter.body?.map((p, idx) => (
                      <p
                        key={idx}
                        className="text-sm leading-relaxed text-zinc-300 sm:text-base"
                      >
                        {p[lang]}
                      </p>
                    ))}

                    {chapter.highlights?.map((hl, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <h4
                          className="font-display text-sm font-bold sm:text-base"
                          style={{ color: project.theme.accentHex }}
                        >
                          {hl.title[lang]}
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-zinc-300">
                          {hl.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: project.theme.secondaryHex,
                                }}
                              />
                              <span>{b[lang]}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Chapter Paired Media & Video */}
                  {(chapterVideo || chapterMedia.length > 0) && (
                    <div className="space-y-4 lg:col-span-6">
                      {chapterVideo && (
                        <VideoPlayer
                          video={chapterVideo}
                          lang={lang}
                          accentHex={project.theme.accentHex}
                        />
                      )}
                      {chapterMedia.length > 0 && (
                        <div
                          className={`grid gap-4 ${
                            chapterMedia.length === 1
                              ? 'grid-cols-1'
                              : 'sm:grid-cols-2'
                          }`}
                        >
                          {chapterMedia.map((asset) => (
                            <ShaderImagePortal
                              key={asset.id}
                              asset={asset}
                              lang={lang}
                              accentHex={project.theme.accentHex}
                              onOpen={() => openAssetInFullGallery(asset.id)}
                              className={
                                asset.aspect === 'portrait'
                                  ? 'aspect-[3/4]'
                                  : 'aspect-[16/10]'
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ======================== ADDITIONAL MOTION & VIDEO DOCUMENTATION ======================== */}
        {remainingVideos.length > 0 && (
          <div className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold tracking-[0.22em] text-zinc-400 uppercase">
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
          <div className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold tracking-[0.22em] text-zinc-400 uppercase">
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {remainingPdfStills.map((asset, i) => {
                const len = remainingPdfStills.length
                const spanClass =
                  len === 5 && i === 0
                    ? 'aspect-[16/9] sm:col-span-2'
                    : i === 0 && len % 3 === 1
                      ? 'aspect-[16/9] sm:col-span-2 lg:col-span-3'
                      : 'aspect-[16/10]'

                return (
                  <ShaderImagePortal
                    key={asset.id}
                    asset={asset}
                    lang={lang}
                    accentHex={project.theme.accentHex}
                    onOpen={() => openAssetInFullGallery(asset.id)}
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
            className="mt-12 rounded-3xl border border-white/15 bg-gradient-to-r from-white/[0.04] to-transparent p-6 text-center font-display text-xl font-bold tracking-tight text-white sm:p-8 sm:text-3xl"
            style={{ borderColor: `${project.theme.accentHex}44` }}
          >
            &ldquo;{project.closingQuote[lang]}&rdquo;
          </blockquote>
        )}

        {/* ======================== FOLDER ARCHIVE / BTS / WIP EXTRAS ======================== */}
        {folderExtras.length > 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <button
              type="button"
              onClick={() => setShowArchiveExtras((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-400 uppercase">
                  {lang === 'en'
                    ? 'PROJECT ARCHIVE · BTS / WIP & ADDITIONAL ASSETS'
                    : 'ARCHIVO DEL PROYECTO · DETRÁS DE CÁMARAS / WIP'}
                </span>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {folderExtras.length}{' '}
                  {lang === 'en'
                    ? 'supplementary captures from the project folder'
                    : 'capturas complementarias de la carpeta del proyecto'}
                </p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300">
                {showArchiveExtras ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>

            {showArchiveExtras && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {folderExtras.map((asset) => (
                  <ShaderImagePortal
                    key={asset.id}
                    asset={asset}
                    lang={lang}
                    accentHex={project.theme.accentHex}
                    onOpen={() => openAssetInFullGallery(asset.id)}
                    className={
                      asset.aspect === 'portrait'
                        ? 'aspect-[3/4]'
                        : 'aspect-[16/10]'
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
