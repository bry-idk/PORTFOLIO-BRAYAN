import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Briefcase, Code2, Cpu, GraduationCap, Languages, Sparkles } from 'lucide-react'
import { PROFILE_DATA } from '../data/profileData'
import { Lang } from '../types/portfolio'

interface Props {
  lang: Lang
}

export const ProfileSection: React.FC<Props> = ({ lang }) => {
  const [careerYearFilter, setCareerYearFilter] = useState<string>('ALL')
  const years = ['ALL', '2026', '2025', '2024']

  const filteredCareer =
    careerYearFilter === 'ALL'
      ? PROFILE_DATA.careerOverview
      : PROFILE_DATA.careerOverview.filter((c) => c.year === careerYearFilter)

  return (
    <section className="relative z-10 border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* ======================== ARTIST STATEMENT & PORTRAIT ======================== */}
        <div
          id="practice"
          className="grid scroll-mt-24 items-center gap-10 rounded-3xl border border-white/12 bg-[#0A0C13]/85 p-6 backdrop-blur-xl sm:p-10 lg:grid-cols-12"
        >
          <div className="min-w-0 space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2EFF7B]/35 bg-[#2EFF7B]/10 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-[#2EFF7B] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              {PROFILE_DATA.greeting[lang]}
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {lang === 'en'
                ? 'Memory, Space & Computational Poetics'
                : 'Memoria, Espacio y Poética Computacional'}
            </h2>

            <p className="text-base leading-relaxed text-zinc-200 sm:text-lg">
              {PROFILE_DATA.bioStatement[lang]}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-xs text-zinc-200">
                <Languages className="h-4 w-4 text-[#2EFF7B]" />
                <span>{PROFILE_DATA.languages[lang]}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-xs text-zinc-200">
                <span>{PROFILE_DATA.contact.location}</span>
              </div>
            </div>
          </div>

          <div className="relative flex min-w-0 justify-center lg:col-span-5">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#8B3DFF]/25 via-[#0E121B] to-[#2EFF7B]/15 p-4 pt-6">
              <div
                className="halftone-grid-dense pointer-events-none absolute inset-0 opacity-60"
                aria-hidden="true"
              />
              <img
                src={PROFILE_DATA.portraitUrl}
                alt={PROFILE_DATA.fullName}
                className="relative z-10 mx-auto h-80 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)] sm:h-96"
              />
              <div className="relative z-10 mt-3 rounded-2xl border border-white/15 bg-black/65 px-4 py-2.5 text-center backdrop-blur-md">
                <p className="font-display text-sm font-bold text-white">
                  {PROFILE_DATA.fullName}
                </p>
                <p className="font-mono text-[10px] tracking-widest text-[#2EFF7B] uppercase">
                  Digital Interaction · 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================== CAREER OVERVIEW & EDUCATION ======================== */}
        <div
          id="cv"
          className="mt-16 grid scroll-mt-24 gap-8 lg:grid-cols-12"
        >
          {/* Career Overview */}
          <div className="min-w-0 rounded-3xl border border-white/12 bg-[#0A0C13]/85 p-6 backdrop-blur-xl sm:p-8 lg:col-span-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Briefcase className="h-5 w-5 text-[#2EFF7B]" />
                <h3 className="font-display text-2xl font-bold text-white">
                  {lang === 'en' ? 'CAREER OVERVIEW' : 'TRAYECTORIA PROFESIONAL'}
                </h3>
              </div>

              <div className="flex gap-1.5">
                {years.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setCareerYearFilter(yr)}
                    className={`rounded-xl px-2.5 py-1 font-mono text-[11px] font-semibold transition ${
                      careerYearFilter === yr
                        ? 'bg-[#2EFF7B] text-[#06070B]'
                        : 'border border-white/15 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {yr === 'ALL' ? (lang === 'en' ? 'ALL' : 'TODO') : yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredCareer.map((entry, idx) => (
                <motion.div
                  key={`${entry.year}-${entry.organization}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.25) }}
                  className="flex flex-col justify-between gap-1 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 transition hover:border-[#2EFF7B]/35 hover:bg-white/[0.05] sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-sans text-sm font-semibold text-white">
                      {entry.role[lang]}
                    </p>
                    <p className="text-xs text-zinc-400">{entry.organization}</p>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-bold text-[#2EFF7B]">
                    {entry.year}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="min-w-0 rounded-3xl border border-white/12 bg-[#0A0C13]/85 p-6 backdrop-blur-xl sm:p-8 lg:col-span-5">
            <div className="mb-6 flex items-center gap-2.5 border-b border-white/10 pb-4">
              <GraduationCap className="h-5 w-5 text-[#8B3DFF]" />
              <h3 className="font-display text-2xl font-bold text-white">
                {lang === 'en' ? 'EDUCATION' : 'EDUCACIÓN'}
              </h3>
            </div>

            <div className="space-y-3.5">
              {PROFILE_DATA.education.map((edu, idx) => (
                <div
                  key={`${edu.year}-${idx}`}
                  className="relative rounded-2xl border border-white/8 bg-white/[0.025] p-4 pl-5 transition hover:border-[#8B3DFF]/45"
                >
                  <span className="absolute top-5 left-2 h-2 w-2 rounded-full bg-[#8B3DFF]" />
                  <span className="font-mono text-[11px] font-bold text-[#8B3DFF]">
                    {edu.year}
                  </span>
                  <p className="mt-0.5 font-sans text-sm font-semibold text-white">
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

        {/* ======================== SOFTWARE SKILLS MATRIX ======================== */}
        <div className="mt-16 rounded-3xl border border-white/12 bg-[#0A0C13]/85 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Code2 className="h-5 w-5 text-[#2EFF7B]" />
              <h3 className="font-display text-2xl font-bold text-white">
                {lang === 'en' ? 'SOFTWARE SKILLS' : 'HERRAMIENTAS Y SOFTWARE'}
              </h3>
            </div>
            <span className="hidden font-mono text-xs text-zinc-400 sm:inline">
              3D · POST · CODE · AI
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PROFILE_DATA.softwareSkills.map((group) => (
              <div
                key={group.id}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#8B3DFF]" />
                  <h4 className="font-mono text-xs font-bold tracking-widest text-[#2EFF7B] uppercase">
                    {group.category[lang]}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-white/8 bg-black/35 px-3 py-2 text-xs font-medium text-zinc-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ======================== AWARDS ======================== */}
        <div
          id="awards"
          className="mt-16 scroll-mt-24 rounded-3xl border border-white/12 bg-[#0A0C13]/85 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Award className="h-5 w-5 text-[#2EFF7B]" />
              <h3 className="font-display text-2xl font-bold text-white">
                {lang === 'en' ? 'AWARDS & RECOGNITIONS' : 'PREMIOS Y RECONOCIMIENTOS'}
              </h3>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              2025 — 2026
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROFILE_DATA.awards.map((award) => (
              <div
                key={award.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-[#2EFF7B]/[0.06] to-[#8B3DFF]/[0.06] p-5 transition hover:border-[#2EFF7B]/50"
              >
                <div>
                  <span className="inline-block rounded-full border border-[#2EFF7B]/40 bg-[#2EFF7B]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#2EFF7B]">
                    {award.year} · Project: {award.project}
                  </span>
                  <h4 className="mt-3 font-display text-base font-bold text-white">
                    {award.title[lang]}
                  </h4>
                </div>
                <p className="mt-3 border-t border-white/10 pt-2.5 text-xs text-zinc-400">
                  {award.venue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
