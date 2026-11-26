import React, { useState } from 'react'
import { ArrowUp, ArrowUpRight, Check, Copy, Mail, MapPin } from 'lucide-react'
import { BEHANCE_EXACT_URL, PROFILE_DATA } from '../data/profileData'
import { Lang } from '../types/portfolio'
import { Magnetic } from './Magnetic'

export interface ContactFooterProps {
  lang: Lang
  onJumpTo?: (selector: string) => void
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  lang,
  onJumpTo,
}) => {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_DATA.contact.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // Clipboard fallback ignored
    }
  }

  const handleBackToTop = () => {
    if (onJumpTo) {
      onJumpTo('#hero')
      return
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer
      id="connect"
      className="relative z-10 scroll-mt-24 overflow-hidden border-t border-white/[0.1] bg-[#05060A]/95 pt-20 pb-24 backdrop-blur-2xl sm:pt-28 sm:pb-20"
    >
      {/* Atmospheric top horizon glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(46,255,123,0.12)_0%,rgba(139,61,255,0.08)_45%,transparent_72%)] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Top Row: Eyebrow + Magnetic Back to Top */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.09] pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2EFF7B] shadow-[0_0_10px_#2EFF7B]" />
            <p className="font-mono text-xs font-bold tracking-[0.26em] text-[#2EFF7B] uppercase">
              {lang === 'en' ? "LET'S CONNECT" : 'CONECTEMOS'}
            </p>
            <span className="hidden font-mono text-[10.5px] tracking-[0.18em] text-zinc-500 uppercase sm:inline">
              / {lang === 'en' ? 'COMMISSIONS & XR COLLABORATIONS' : 'COMISIONES Y COLABORACIONES XR'}
            </span>
          </div>

          <Magnetic strength={0.28}>
            <button
              type="button"
              onClick={handleBackToTop}
              data-cursor="TOP"
              aria-label={lang === 'en' ? 'Back to top' : 'Volver arriba'}
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.03] px-4 py-2 font-mono text-[10.5px] font-semibold tracking-[0.18em] text-zinc-300 uppercase transition duration-300 hover:border-[#2EFF7B]/60 hover:bg-[#2EFF7B]/10 hover:text-white"
            >
              <span>{lang === 'en' ? 'Top' : 'Inicio'}</span>
              <ArrowUp className="h-3.5 w-3.5 text-[#2EFF7B] transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </Magnetic>
        </div>

        {/* Monumental Editorial Closing Statement */}
        <div className="mt-10 max-w-4xl sm:mt-12">
          <h2 className="display-safe break-words font-display text-[clamp(1.9rem,5.2vw,4.35rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white">
            {lang === 'en'
              ? 'Let’s build living spaces together.'
              : 'Construyamos espacios vivos juntos.'}
          </h2>
        </div>

        {/* Studio Contact Channels */}
        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {/* Email Card with Copy Toast Feedback */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-[#080B13]/90 p-5 transition duration-300 hover:border-white/25">
            <a
              href={`mailto:${PROFILE_DATA.contact.email}`}
              data-cursor="MAIL"
              className="flex min-w-0 items-center gap-3.5 text-zinc-100 transition hover:text-[#2EFF7B]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#8B3DFF]/35 bg-[#8B3DFF]/15 text-[#c49bff]">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                  Email
                </p>
                <p className="mt-0.5 truncate font-sans text-sm font-semibold">
                  {PROFILE_DATA.contact.email}
                </p>
              </div>
            </a>

            <button
              type="button"
              onClick={copyEmail}
              aria-label={lang === 'en' ? 'Copy email' : 'Copiar correo'}
              className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-2.5 font-mono text-[10px] font-semibold tracking-wider uppercase transition ${
                copied
                  ? 'border-[#2EFF7B]/60 bg-[#2EFF7B]/15 text-[#2EFF7B]'
                  : 'border-white/[0.14] bg-white/[0.04] text-zinc-300 hover:border-[#2EFF7B]/60 hover:text-[#2EFF7B]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{lang === 'en' ? 'Copied' : 'Copiado'}</span>
                </>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Behance Exact URL Featured Card */}
          <a
            href={BEHANCE_EXACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="OPEN"
            className="group flex items-center justify-between gap-3 rounded-2xl border border-[#2EFF7B]/35 bg-gradient-to-br from-[#2EFF7B]/[0.12] via-[#0B1411] to-[#080B13] p-5 transition duration-300 hover:border-[#2EFF7B]/70 hover:shadow-[0_0_32px_rgba(46,255,123,0.16)]"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2EFF7B] font-mono text-xs font-extrabold text-[#05060A]">
                Bē
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#2EFF7B] uppercase">
                  Behance Portfolio
                </p>
                <p className="mt-0.5 truncate font-sans text-sm font-semibold text-white">
                  {PROFILE_DATA.contact.behanceLabel}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#2EFF7B] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Studio Location + Socials */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-[#080B13]/90 p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-[#8B3DFF]" />
              <span className="font-sans text-sm font-medium text-zinc-200">
                {PROFILE_DATA.contact.location}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <a
                href={PROFILE_DATA.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="OPEN"
                className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-zinc-200 transition hover:border-[#2EFF7B]/60 hover:text-white"
              >
                IG: {PROFILE_DATA.contact.instagramHandle}
              </a>
              <a
                href={PROFILE_DATA.contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="OPEN"
                className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-zinc-200 transition hover:border-[#8B3DFF]/70 hover:text-white"
              >
                in: {PROFILE_DATA.contact.linkedinLabel}
              </a>
            </div>
          </div>
        </div>

        {/* Colophon Row — extra right & bottom clearance for Netlify badge */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-6 font-mono text-[10.5px] tracking-wider text-zinc-500 sm:pr-44">
          <span>
            © {PROFILE_DATA.year} {PROFILE_DATA.fullName} · Digital Interaction
          </span>
          <span>
            {lang === 'en'
              ? 'Built with React · Three.js · Custom GLSL · GSAP · Lenis'
              : 'Desarrollado con React · Three.js · GLSL Personalizado · GSAP · Lenis'}
          </span>
        </div>
      </div>
    </footer>
  )
}
