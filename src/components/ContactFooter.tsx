import React, { useState } from 'react'
import { ArrowUpRight, Check, Copy, Mail, MapPin } from 'lucide-react'
import { BEHANCE_EXACT_URL, PROFILE_DATA } from '../data/profileData'
import { Lang } from '../types/portfolio'

interface Props {
  lang: Lang
}

export const ContactFooter: React.FC<Props> = ({ lang }) => {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE_DATA.contact.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // Fallback ignored
    }
  }

  return (
    <footer
      id="connect"
      className="relative z-10 scroll-mt-24 border-t border-white/10 bg-[#05060A]/90 pt-20 pb-12 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-[#2EFF7B]/10 via-[#0A0C13] to-[#8B3DFF]/15 p-8 sm:p-12">
          <p className="font-mono text-xs font-bold tracking-[0.26em] text-[#2EFF7B] uppercase">
            {lang === 'en' ? "LET'S CONNECT" : 'CONECTEMOS'}
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            {lang === 'en'
              ? 'Let’s build living spaces together.'
              : 'Construyamos espacios vivos juntos.'}
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Email Card */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-black/45 p-4">
              <a
                href={`mailto:${PROFILE_DATA.contact.email}`}
                className="flex min-w-0 items-center gap-3 text-zinc-100 hover:text-[#2EFF7B]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B3DFF]/25 text-[#c49bff]">
                  <Mail className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-zinc-400 uppercase">
                    Email
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {PROFILE_DATA.contact.email}
                  </p>
                </div>
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label={lang === 'en' ? 'Copy email' : 'Copiar correo'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-zinc-300 transition hover:border-[#2EFF7B] hover:text-[#2EFF7B]"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#2EFF7B]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Behance Exact URL Card */}
            <a
              href={BEHANCE_EXACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[#2EFF7B]/30 bg-[#2EFF7B]/10 p-4 transition hover:bg-[#2EFF7B]/15"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2EFF7B] font-mono text-xs font-extrabold text-[#06070B]">
                  Bē
                </span>
                <div>
                  <p className="font-mono text-[10px] text-[#2EFF7B] uppercase">
                    Behance Portfolio
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {PROFILE_DATA.contact.behanceLabel}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[#2EFF7B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Location + Instagram + LinkedIn */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 bg-black/45 p-4 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#8B3DFF]" />
                <span className="text-sm font-medium text-zinc-200">
                  {PROFILE_DATA.contact.location}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <a
                  href={PROFILE_DATA.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-zinc-200 transition hover:border-[#2EFF7B] hover:text-white"
                >
                  IG: {PROFILE_DATA.contact.instagramHandle}
                </a>
                <a
                  href={PROFILE_DATA.contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-zinc-200 transition hover:border-[#8B3DFF] hover:text-white"
                >
                  in: {PROFILE_DATA.contact.linkedinLabel}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-zinc-500">
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
