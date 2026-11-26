import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react'
import { BEHANCE_EXACT_URL, PROFILE_DATA } from '../data/profileData'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang } from '../types/portfolio'

interface Props {
  lang: Lang
  onJumpTo: (selector: string) => void
}

export const HeroSection: React.FC<Props> = ({ lang, onJumpTo }) => {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col justify-between overflow-x-clip px-4 pt-28 pb-12 sm:px-8 lg:px-12"
    >
      {/* Subtle architectural halftone framing */}
      <div
        className="halftone-grid pointer-events-none absolute inset-x-0 top-0 h-44 opacity-40"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center">
        {/* Top editorial telemetry bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-wrap items-center gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2EFF7B]/35 bg-[#2EFF7B]/10 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-[#2EFF7B] uppercase backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            {PROFILE_DATA.brandTitle} · {PROFILE_DATA.year}
          </span>
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 font-mono text-[11px] tracking-wider text-zinc-300 backdrop-blur-md">
            {PROFILE_DATA.contact.location} · 06°15&apos;N 75°34&apos;W
          </span>
          <span className="hidden rounded-full border border-[#8B3DFF]/35 bg-[#8B3DFF]/15 px-3.5 py-1 font-mono text-[11px] tracking-wider text-violet-200 backdrop-blur-md md:inline-flex">
            WEBGL / GLSL INTERACTIVE FIELD ACTIVE
          </span>
        </motion.div>

        {/* Hero Typography */}
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mb-3 font-mono text-xs font-semibold tracking-[0.26em] text-zinc-400 uppercase sm:text-sm"
            >
              {PROFILE_DATA.greeting[lang]}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.14 }}
              className="font-display text-[clamp(1.75rem,7vw,4.15rem)] leading-[0.96] font-extrabold tracking-tight text-white"
            >
              PORTFOLIO
              <span className="block bg-gradient-to-r from-[#2EFF7B] via-white to-[#8B3DFF] bg-clip-text text-transparent">
                DIGITAL
              </span>
              <span className="block bg-gradient-to-b from-zinc-100 to-zinc-500 bg-clip-text text-transparent">
                INTERACTION
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-display text-xl font-bold tracking-wide text-white sm:text-2xl">
                  {PROFILE_DATA.fullName.toUpperCase()}
                </p>
                <p className="mt-1 font-mono text-xs tracking-wider text-zinc-400">
                  {PROFILE_DATA.headlineTag[lang]}
                </p>
              </div>
            </motion.div>

            {/* Primary CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.34 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <button
                type="button"
                onClick={() => onJumpTo('#works')}
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#2EFF7B] px-6 py-3.5 font-sans text-sm font-bold text-[#06070B] shadow-[0_0_32px_rgba(46,255,123,0.4)] transition hover:scale-[1.02] hover:bg-[#52ff92]"
              >
                <span>
                  {lang === 'en'
                    ? 'Explore 05 Selected Works'
                    : 'Explorar 05 Obras'}
                </span>
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </button>

              <button
                type="button"
                onClick={() => onJumpTo('#practice')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.05] px-5 py-3.5 font-sans text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#8B3DFF] hover:bg-[#8B3DFF]/15"
              >
                {lang === 'en' ? 'Artist Practice & CV' : 'Práctica y CV'}
              </button>

              <a
                href={BEHANCE_EXACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 px-4 py-3.5 font-mono text-xs font-semibold text-zinc-200 transition hover:border-white/40 hover:text-white"
              >
                <span>Behance</span>
                <ArrowUpRight className="h-4 w-4 text-[#2EFF7B]" />
              </a>
            </motion.div>
          </div>

          {/* Right Quick Index Capsule matching exact PDF project order */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.3 }}
            className="min-w-0 rounded-3xl border border-white/12 bg-[#07090F]/75 p-5 backdrop-blur-xl lg:col-span-4"
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-zinc-400 uppercase">
                {lang === 'en' ? 'Index · PDF Sequence' : 'Índice · Orden PDF'}
              </span>
              <span className="font-mono text-[11px] text-[#2EFF7B]">
                01 — 05
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {PROJECTS_DATA.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onJumpTo(`#project-${p.slug}`)}
                  className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: p.theme.accentHex }}
                    >
                      {p.indexLabel}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-semibold text-zinc-100 group-hover:text-white">
                        {p.title}
                      </p>
                      <p className="truncate font-mono text-[10px] text-zinc-400">
                        {p.projectType[lang]}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom interaction cue */}
      <div className="relative z-10 mx-auto mt-10 flex w-full max-w-7xl items-center justify-between border-t border-white/10 pt-4 font-mono text-[11px] text-zinc-400">
        <span>
          {lang === 'en'
            ? 'MOVE CURSOR / TOUCH TO WARP SHADER FIELD'
            : 'MUEVE EL CURSOR / TOCA PARA DEFORMAR EL SHADER'}
        </span>
        <button
          type="button"
          onClick={() => onJumpTo('#works')}
          className="inline-flex items-center gap-1.5 text-zinc-300 transition hover:text-[#2EFF7B]"
        >
          <span>{lang === 'en' ? 'SCROLL TO BEGIN' : 'DESLIZA PARA INICIAR'}</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </div>
    </section>
  )
}
