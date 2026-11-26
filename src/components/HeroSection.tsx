import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { BEHANCE_EXACT_URL, PROFILE_DATA } from '../data/profileData'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang } from '../types/portfolio'
import { IntroCurtain } from './IntroCurtain'
import { Magnetic } from './Magnetic'

export interface HeroSectionProps {
  lang: Lang
  onJumpTo: (selector: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ lang, onJumpTo }) => {
  const totalCount = String(PROJECTS_DATA.length).padStart(2, '0')

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-between overflow-x-clip px-4 pt-24 pb-20 sm:px-8 sm:pt-28 sm:pb-14 lg:px-12"
    >
      {/* Fast non-blocking editorial curtain reveal */}
      <IntroCurtain lang={lang} />

      {/* Subtle halftone top field + radial obsidian legibility scrim over live WebGL */}
      <div
        className="halftone-grid pointer-events-none absolute inset-x-0 top-0 h-48 opacity-35"
        aria-hidden="true"
      />
      <div
        className="hero-legibility-scrim pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center">
        {/* Refined Architectural Studio Header Line */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-white/[0.1] pb-3.5 font-mono text-[10.5px] tracking-[0.2em] text-zinc-400 uppercase sm:mb-10"
        >
          <div className="flex items-center gap-2.5 text-zinc-200">
            <span className="animate-pulse-soft h-1.5 w-1.5 rounded-full bg-[#2EFF7B] shadow-[0_0_10px_#2EFF7B]" />
            <span className="font-semibold text-[#2EFF7B]">
              {PROFILE_DATA.brandTitle} · {PROFILE_DATA.year}
            </span>
          </div>

          <div className="flex items-center gap-5 text-zinc-400">
            <span>
              {PROFILE_DATA.contact.location} · 06°15&apos;N 75°34&apos;W
            </span>
            <span className="hidden items-center gap-2 border-l border-white/15 pl-5 text-zinc-300 md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8B3DFF] shadow-[0_0_8px_#8B3DFF]" />
              WEBGL / GLSL FIELD LIVE
            </span>
          </div>
        </motion.div>

        {/* Main Editorial Split */}
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Monumental Typography Column */}
          <div className="min-w-0 lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 flex items-center gap-3"
            >
              <span className="h-px w-7 bg-[#2EFF7B]/75" aria-hidden="true" />
              <p className="font-mono text-[11px] font-semibold tracking-[0.28em] text-zinc-300 uppercase sm:text-xs">
                {PROFILE_DATA.greeting[lang]}
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="display-safe font-display text-[clamp(1.65rem,4.35vw,3.95rem)] leading-[0.94] font-extrabold tracking-[-0.03em] text-white"
            >
              <span className="block">PORTFOLIO</span>
              <span className="block bg-gradient-to-r from-[#2EFF7B] via-emerald-100 to-white bg-clip-text text-transparent">
                DIGITAL
              </span>
              <span className="block bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                INTERACTION
              </span>
            </motion.h1>

            {/* Artist Identity Lockup */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 border-l border-[#2EFF7B]/50 pl-4 sm:mt-8"
            >
              <p className="font-sans text-lg font-bold tracking-[0.14em] text-white uppercase sm:text-xl">
                {PROFILE_DATA.fullName.toUpperCase()}
              </p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed tracking-[0.16em] text-zinc-300/90 sm:text-xs">
                {PROFILE_DATA.headlineTag[lang]}
              </p>
            </motion.div>

            {/* Tactile Magnetic CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9"
            >
              <Magnetic strength={0.26}>
                <button
                  type="button"
                  onClick={() => onJumpTo('#works')}
                  data-cursor="WORKS"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-[#2EFF7B] px-6 py-3.5 font-sans text-sm font-bold tracking-wide text-[#05060A] shadow-[0_0_30px_rgba(46,255,123,0.32)] transition duration-300 hover:bg-[#57ff96] hover:shadow-[0_0_40px_rgba(46,255,123,0.5)]"
                >
                  <span>
                    {lang === 'en'
                      ? `Explore ${totalCount} Selected Works`
                      : `Explorar ${totalCount} Obras`}
                  </span>
                  <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>
              </Magnetic>

              <Magnetic strength={0.22}>
                <button
                  type="button"
                  onClick={() => onJumpTo('#practice')}
                  data-cursor="CV"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.18] bg-[#080B13]/75 px-5 py-3.5 font-sans text-sm font-semibold text-zinc-100 backdrop-blur-xl transition duration-300 hover:border-[#8B3DFF]/80 hover:bg-[#8B3DFF]/15 hover:text-white"
                >
                  {lang === 'en' ? 'Artist Practice & CV' : 'Práctica y CV'}
                </button>
              </Magnetic>

              <Magnetic strength={0.22}>
                <a
                  href={BEHANCE_EXACT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="OPEN"
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.03] px-4 py-3.5 font-mono text-xs font-semibold tracking-wider text-zinc-200 backdrop-blur-md transition duration-300 hover:border-[#2EFF7B]/55 hover:text-white"
                >
                  <span>Behance</span>
                  <ArrowUpRight className="h-4 w-4 text-[#2EFF7B] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Right Architectural Dossier Index Rail (01 — 07) */}
          <motion.aside
            aria-label={lang === 'en' ? 'Selected works index' : 'Índice de obras seleccionadas'}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 rounded-2xl border border-white/[0.1] bg-[#06080F]/72 p-4 backdrop-blur-2xl sm:p-5 lg:col-span-4"
          >
            <div className="mb-2.5 flex items-center justify-between border-b border-white/[0.1] pb-2.5">
              <span className="font-mono text-[10px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">
                {lang === 'en' ? 'Dossier · Selected Works' : 'Archivo · Obras'}
              </span>
              <span className="font-mono text-[10.5px] font-semibold text-[#2EFF7B]">
                01 — {totalCount}
              </span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {PROJECTS_DATA.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onJumpTo(`#project-${p.slug}`)}
                  data-cursor="VIEW"
                  className="group relative flex w-full items-center justify-between gap-3 py-2.5 pr-1 pl-2.5 text-left transition-colors duration-200 hover:bg-white/[0.035]"
                >
                  {/* Hover vertical accent hairline */}
                  <span
                    className="pointer-events-none absolute top-1.5 bottom-1.5 left-0 w-[2px] origin-center scale-y-0 rounded-full transition-transform duration-300 group-hover:scale-y-100"
                    style={{ backgroundColor: p.theme.accentHex }}
                    aria-hidden="true"
                  />

                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full opacity-80 transition-transform duration-300 group-hover:scale-125 group-hover:opacity-100"
                        style={{ backgroundColor: p.theme.accentHex }}
                      />
                      <span
                        className="font-mono text-[11px] font-bold"
                        style={{ color: p.theme.accentHex }}
                      >
                        {p.indexLabel}
                      </span>
                    </span>

                    <div className="min-w-0 transition-transform duration-300 group-hover:translate-x-0.5">
                      <p className="truncate font-sans text-[13.5px] font-semibold text-zinc-100 group-hover:text-white">
                        {p.title}
                      </p>
                      <p className="truncate font-mono text-[10px] text-zinc-400/90">
                        {p.projectType[lang]}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                </button>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Bottom Interaction Telemetry — kept cleanly clear of bottom-right Netlify badge */}
      <div className="relative z-10 mx-auto mt-10 flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/[0.09] pt-4 pr-0 font-mono text-[10.5px] tracking-[0.16em] text-zinc-400 uppercase sm:pr-44">
        <button
          type="button"
          onClick={() => onJumpTo('#works')}
          data-cursor="SCROLL"
          className="group inline-flex items-center gap-2 text-zinc-200 transition hover:text-[#2EFF7B]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 transition group-hover:border-[#2EFF7B]">
            <ArrowDown className="h-3 w-3 animate-bounce" />
          </span>
          <span>{lang === 'en' ? 'SCROLL TO BEGIN' : 'DESLIZA PARA INICIAR'}</span>
        </button>

        <span className="text-zinc-500">
          {lang === 'en'
            ? 'POINTER / TOUCH REACTIVE SHADER FIELD'
            : 'CAMPO SHADER REACTIVO AL CURSOR / TACTO'}
        </span>
      </div>
    </section>
  )
}
