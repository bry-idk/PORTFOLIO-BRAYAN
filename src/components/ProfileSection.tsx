import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Award,
  Briefcase,
  Code2,
  Cpu,
  GraduationCap,
  Languages,
  MapPin,
} from 'lucide-react'
import { PROFILE_DATA } from '../data/profileData'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang, ProjectData } from '../types/portfolio'
import { mediaUrl } from '../utils/mediaUrl'

export interface ProfileSectionProps {
  lang: Lang
  onJumpTo?: (selector: string) => void
}

export const PracticeIntroSection: React.FC<ProfileSectionProps> = ({
  lang,
}) => {
  return (
    <section
      id="practice"
      className="relative z-10 scroll-mt-[84px] overflow-x-clip border-t border-white/[0.09] bg-gradient-to-b from-[#05060A]/50 via-[#05060A]/25 to-[#05060A]/55 pt-20 sm:pt-28"
    >
      {/* Localized obsidian legibility scrim under left editorial column (keeps WebGL sharp behind portrait) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_85%_at_25%_52%,rgba(5,6,10,0.72)_0%,rgba(5,6,10,0.34)_60%,transparent_100%)]"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Editorial Section Eyebrow */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.09] pb-4 font-mono text-[10.5px] tracking-[0.22em] text-zinc-400 uppercase">
          <span className="flex items-center gap-2.5 text-[#2EFF7B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2EFF7B]" />
            {lang === 'en'
              ? '00 · PRACTICE & STATEMENT'
              : '00 · PRESENTACIÓN Y PRÁCTICA'}
          </span>
          <span>{PROFILE_DATA.greeting[lang]}</span>
        </div>

        <div className="grid items-end gap-5 lg:grid-cols-12 lg:gap-12">
          {/* Left: Bio & Editorial Statement */}
          <div className="min-w-0 space-y-6 pb-2 lg:col-span-7 lg:pb-20">
            <h2 className="display-safe break-words font-display text-[clamp(1.5rem,3.6vw,3.1rem)] leading-[1.08] font-extrabold tracking-[-0.025em] text-white">
              {lang === 'en' ? (
                <>
                  Memory, <span className="whitespace-nowrap">Space &amp;</span>{' '}
                  Computational Poetics
                </>
              ) : (
                <>
                  Memoria, <span className="whitespace-nowrap">Espacio y</span>{' '}
                  Poética Computacional
                </>
              )}
            </h2>

            <p className="max-w-2xl font-sans text-base leading-[1.78] text-zinc-200 sm:text-[1.075rem]">
              {PROFILE_DATA.bioStatement[lang]}
            </p>

            {/* Architectural Metadata Strip */}
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.08] sm:grid-cols-2">
              <div className="flex items-center gap-3 bg-[#070910]/90 px-4 py-3.5">
                <Languages className="h-4 w-4 shrink-0 text-[#2EFF7B]" />
                <div className="min-w-0">
                  <p className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-500 uppercase">
                    {lang === 'en' ? 'Languages' : 'Idiomas'}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-zinc-200">
                    {PROFILE_DATA.languages[lang]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#070910]/90 px-4 py-3.5">
                <MapPin className="h-4 w-4 shrink-0 text-[#8B3DFF]" />
                <div className="min-w-0">
                  <p className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-500 uppercase">
                    {lang === 'en' ? 'Base' : 'Ubicación'}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-zinc-200">
                    {PROFILE_DATA.contact.location} · 06°15&apos;N 75°34&apos;W
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Open, Borderless PNG Cutout Portrait (no poster enclosure) */}
          <div className="relative flex min-w-0 items-end justify-center self-end lg:col-span-5 lg:justify-end">
            <div className="relative flex w-full max-w-[440px] items-end justify-center lg:justify-end">
              {/* Unboxed volumetric studio backlight (wide radial aura so no box clip occurs) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-4 left-1/2 h-[390px] w-[390px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,61,255,0.30)_0%,rgba(46,255,123,0.14)_44%,transparent_70%)] blur-3xl sm:h-[430px] sm:w-[430px] lg:left-[58%]"
              />
              {/* Subtle open orbital silhouette ring */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full border border-white/[0.08] shadow-[inset_0_0_40px_rgba(46,255,123,0.05)] sm:h-80 sm:w-80 lg:left-[58%]"
              />

              {/* Free-standing PNG cutout portrait anchored cleanly at the section baseline */}
              <img
                src={mediaUrl(PROFILE_DATA.portraitUrl)}
                alt={PROFILE_DATA.fullName}
                decoding="async"
                className="relative z-10 h-[370px] w-auto object-contain object-bottom sm:h-[450px] lg:h-[510px]"
                style={{
                  maskImage:
                    'linear-gradient(to bottom, #000 0%, #000 88%, transparent 100%), linear-gradient(to right, #000 0%, #000 91%, transparent 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, #000 0%, #000 88%, transparent 100%), linear-gradient(to right, #000 0%, #000 91%, transparent 100%)',
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in',
                }}
              />

              {/* Minimal floating studio signature tag beside lower edge */}
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/[0.12] bg-[#06080E]/85 px-3.5 py-2 backdrop-blur-xl sm:bottom-5 sm:left-2 sm:translate-x-0 lg:left-0">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2EFF7B] shadow-[0_0_8px_#2EFF7B]" />
                  <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-zinc-200 uppercase">
                    {PROFILE_DATA.fullName}
                  </span>
                </div>
                <p className="mt-0.5 pl-3.5 font-mono text-[9.5px] tracking-[0.16em] text-[#2EFF7B]/90 uppercase">
                  Digital Interaction · {PROFILE_DATA.year}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const TrajectoryAndAwardsSection: React.FC<ProfileSectionProps> = ({
  lang,
  onJumpTo,
}) => {
  const [careerYearFilter, setCareerYearFilter] = useState<string>('ALL')
  const years = ['ALL', '2026', '2025', '2024']

  const filteredCareer =
    careerYearFilter === 'ALL'
      ? PROFILE_DATA.careerOverview
      : PROFILE_DATA.careerOverview.filter((c) => c.year === careerYearFilter)

  const awardProjectMap = useMemo(() => {
    const map = new Map<string, ProjectData>()
    for (const project of PROJECTS_DATA) {
      if (!project.awardRefs) continue
      for (const refId of project.awardRefs) {
        map.set(refId, project)
      }
    }
    return map
  }, [])

  const handleAwardJump = (slug: string) => {
    const selector = `#project-${slug}`
    if (onJumpTo) {
      onJumpTo(selector)
      return
    }
    if (typeof document !== 'undefined') {
      document.querySelector(selector)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <section className="relative z-10 border-t border-white/[0.09] bg-[#05060A]/45 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* ======================== 08 & 09. CAREER OVERVIEW & EDUCATION ======================== */}
        <div
          id="cv"
          className="grid scroll-mt-24 gap-8 lg:grid-cols-12 lg:gap-10"
        >
          {/* Career Overview — Architectural Hairline Timeline */}
          <div className="min-w-0 rounded-2xl border border-white/[0.09] bg-[#070910]/75 p-5 backdrop-blur-md sm:p-7 lg:col-span-7">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-zinc-500 uppercase">
                  {lang === 'en' ? '08 · TRAJECTORY' : '08 · TRAYECTORIA'}
                </p>
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-[#2EFF7B]" />
                  <h3 className="display-safe font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold tracking-tight text-white">
                    {lang === 'en' ? 'CAREER OVERVIEW' : 'TRAYECTORIA PROFESIONAL'}
                  </h3>
                </div>
              </div>

              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label={lang === 'en' ? 'Filter career by year' : 'Filtrar trayectoria por año'}
              >
                {years.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setCareerYearFilter(yr)}
                    aria-pressed={careerYearFilter === yr}
                    className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider transition ${
                      careerYearFilter === yr
                        ? 'bg-[#2EFF7B] text-[#05060A] shadow-[0_0_16px_rgba(46,255,123,0.3)]'
                        : 'border border-white/[0.12] bg-white/[0.02] text-zinc-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {yr === 'ALL' ? (lang === 'en' ? 'ALL' : 'TODO') : yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {filteredCareer.map((entry, idx) => (
                <motion.div
                  key={`${entry.year}-${entry.organization}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: Math.min(idx * 0.025, 0.2) }}
                  className="group relative flex flex-col justify-between gap-1.5 py-3.5 pl-3 transition-colors duration-200 hover:bg-white/[0.025] sm:flex-row sm:items-center sm:gap-6 sm:pr-2"
                >
                  <span
                    className="pointer-events-none absolute top-2 bottom-2 left-0 w-[2px] origin-center scale-y-0 rounded-full bg-[#2EFF7B] transition-transform duration-300 group-hover:scale-y-100"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="font-sans text-[14.5px] font-semibold text-zinc-100 transition-colors group-hover:text-white">
                      {entry.role[lang]}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {entry.organization}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-semibold tracking-wider text-[#2EFF7B]/90">
                    {entry.year}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education — Vertical Hairline Rail */}
          <div className="min-w-0 rounded-2xl border border-white/[0.09] bg-[#070910]/75 p-5 backdrop-blur-md sm:p-7 lg:col-span-5">
            <div className="mb-6">
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-zinc-500 uppercase">
                {lang === 'en' ? '09 · FORMATION' : '09 · FORMACIÓN'}
              </p>
              <div className="flex items-center gap-2.5">
                <GraduationCap className="h-4 w-4 text-[#8B3DFF]" />
                <h3 className="display-safe font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold tracking-tight text-white">
                  {lang === 'en' ? 'EDUCATION' : 'EDUCACIÓN'}
                </h3>
              </div>
            </div>

            <div className="relative space-y-5 border-l border-white/[0.11] pl-6">
              {PROFILE_DATA.education.map((edu, idx) => (
                <div
                  key={`${edu.year}-${idx}`}
                  className="group relative pb-1"
                >
                  <span
                    className="absolute top-1.5 -left-[28.5px] h-2 w-2 rounded-full border border-[#8B3DFF] bg-[#05060A] transition-colors duration-300 group-hover:bg-[#8B3DFF]"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-[#a770ff]">
                    {edu.year}
                  </span>
                  <p className="mt-0.5 font-sans text-sm font-semibold leading-snug text-zinc-100 group-hover:text-white">
                    {edu.degree[lang]}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {edu.institution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================== 10. SOFTWARE SKILLS MATRIX ======================== */}
        <div className="mt-24 border-t border-white/[0.09] pt-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-zinc-500 uppercase">
                {lang === 'en' ? '10 · TECHNICAL STACK' : '10 · STACK TÉCNICO'}
              </p>
              <div className="flex items-center gap-2.5">
                <Code2 className="h-4 w-4 text-[#2EFF7B]" />
                <h3 className="display-safe font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold tracking-tight text-white">
                  {lang === 'en' ? 'SOFTWARE SKILLS' : 'HERRAMIENTAS Y SOFTWARE'}
                </h3>
              </div>
            </div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
              3D · POST · CODE · AI
            </span>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
            {PROFILE_DATA.softwareSkills.map((group, idx) => (
              <div
                key={group.id}
                className="flex flex-col bg-[#070910] p-6"
              >
                <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-[#8B3DFF]" />
                    <h4 className="font-mono text-[11px] font-bold tracking-[0.18em] text-[#2EFF7B] uppercase">
                      {group.category[lang]}
                    </h4>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 font-sans text-[13px] font-medium leading-snug text-zinc-200"
                    >
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/35"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ======================== 11. AWARDS & RECOGNITIONS ======================== */}
        <div
          id="awards"
          className="mt-24 scroll-mt-24 border-t border-white/[0.09] pt-16"
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.22em] text-zinc-500 uppercase">
                {lang === 'en' ? '11 · HONORS' : '11 · DISTINCIONES'}
              </p>
              <div className="flex items-center gap-2.5">
                <Award className="h-4 w-4 text-[#2EFF7B]" />
                <h3 className="display-safe font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-bold tracking-tight text-white">
                  {lang === 'en' ? 'AWARDS & RECOGNITIONS' : 'PREMIOS Y RECONOCIMIENTOS'}
                </h3>
              </div>
            </div>
            <span className="font-mono text-xs tracking-[0.2em] text-zinc-400">
              2025 — 2026
            </span>
          </div>

          {/* Balanced 6-col desktop grid: 2 featured 2026 awards (span 3 each) + 3 awards (span 2 each) = zero orphan gap */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {PROFILE_DATA.awards.map((award, idx) => {
              const isFeatured = idx < 2
              const linkedProject = awardProjectMap.get(award.id) || null
              const accent = linkedProject?.theme.accentHex || '#2EFF7B'
              const spanClass = isFeatured
                ? 'lg:col-span-3'
                : idx === PROFILE_DATA.awards.length - 1
                  ? 'md:col-span-2 lg:col-span-2'
                  : 'lg:col-span-2'

              const projectLabelPrefix = lang === 'en' ? 'Project:' : 'Proyecto:'

              const cardContent = (
                <>
                  {/* Top subtle chromatic edge */}
                  <div
                    className="pointer-events-none absolute top-0 right-5 left-5 h-px opacity-50 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
                    }}
                    aria-hidden="true"
                  />

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider"
                        style={{
                          borderColor: `${accent}4D`,
                          backgroundColor: `${accent}14`,
                          color: accent,
                        }}
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        {award.year} · {projectLabelPrefix} {award.project}
                      </span>

                      {linkedProject ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-wider text-zinc-400 uppercase transition-colors group-hover:text-white">
                          <span>{lang === 'en' ? 'Work' : 'Obra'}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      ) : null}
                    </div>

                    <h4
                      className={`mt-4 font-sans font-semibold leading-snug text-white ${
                        isFeatured ? 'text-lg sm:text-xl' : 'text-[15.5px] sm:text-base'
                      }`}
                    >
                      {award.title[lang]}
                    </h4>
                  </div>

                  <p className="mt-5 border-t border-white/[0.08] pt-3 font-sans text-xs leading-relaxed text-zinc-400">
                    {award.venue}
                  </p>
                </>
              )

              const sharedClassName = `group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.03] via-[#080A12] to-[#06070D] p-5 text-left transition duration-300 hover:border-white/25 sm:p-6 ${spanClass}`

              if (linkedProject) {
                return (
                  <button
                    key={award.id}
                    type="button"
                    onClick={() => handleAwardJump(linkedProject.slug)}
                    data-cursor="WORK"
                    className={`${sharedClassName} cursor-pointer`}
                  >
                    {cardContent}
                  </button>
                )
              }

              return (
                <article key={award.id} className={sharedClassName}>
                  {cardContent}
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  lang,
  onJumpTo,
}) => (
  <>
    <PracticeIntroSection lang={lang} onJumpTo={onJumpTo} />
    <TrajectoryAndAwardsSection lang={lang} onJumpTo={onJumpTo} />
  </>
)
