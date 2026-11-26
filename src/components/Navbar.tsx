import React, { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { BEHANCE_EXACT_URL } from '../data/profileData'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang, ProjectData } from '../types/portfolio'

interface Props {
  lang: Lang
  onToggleLang: (lang: Lang) => void
  activeProject: ProjectData | null
  onJumpTo: (selector: string) => void
}

export const Navbar: React.FC<Props> = ({
  lang,
  onToggleLang,
  activeProject,
  onJumpTo,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalCount = String(PROJECTS_DATA.length).padStart(2, '0')

  const navItems = [
    {
      href: '#works',
      label: { en: `Works (${totalCount})`, es: `Obras (${totalCount})` },
    },
    { href: '#practice', label: { en: 'Practice & Bio', es: 'Práctica y Bio' } },
    { href: '#cv', label: { en: 'Trajectory & Skills', es: 'Trayectoria' } },
    { href: '#awards', label: { en: 'Awards', es: 'Premios' } },
    { href: '#connect', label: { en: 'Connect', es: 'Contacto' } },
  ]

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    onJumpTo(href)
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-white/12 bg-[#07090F]/80 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {/* Brand Monogram + Active Project Indicator */}
        <button
          type="button"
          onClick={() => handleNavClick('#hero')}
          className="flex items-center gap-3 text-left focus-visible:outline-none"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#2EFF7B]/40 bg-gradient-to-br from-[#2EFF7B]/20 to-[#8B3DFF]/30 font-display text-xs font-extrabold tracking-tight text-white">
            BM
          </span>
          <div className="hidden sm:block">
            <p className="font-mono text-[10px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">
              Brayan Marín · 2026
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
                style={{
                  backgroundColor: activeProject?.theme.accentHex || '#2EFF7B',
                }}
              />
              <span className="font-sans text-xs font-medium text-zinc-200">
                {activeProject
                  ? `${activeProject.indexLabel} · ${activeProject.title}`
                  : 'Digital Interaction'}
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="rounded-xl px-3 py-1.5 font-sans text-xs font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              {item.label[lang]}
            </button>
          ))}
        </nav>

        {/* Right Controls: EN / ES Toggle + Behance CTA */}
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={lang === 'en' ? 'Language selector' : 'Selector de idioma'}
            className="inline-flex items-center rounded-xl border border-white/15 bg-black/50 p-0.5"
          >
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              aria-pressed={lang === 'en'}
              className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-[#2EFF7B] text-[#06070B] shadow-[0_0_16px_rgba(46,255,123,0.45)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('es')}
              aria-pressed={lang === 'es'}
              className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                lang === 'es'
                  ? 'bg-[#8B3DFF] text-white shadow-[0_0_16px_rgba(139,61,255,0.5)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ES
            </button>
          </div>

          <a
            href={BEHANCE_EXACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] font-semibold text-white transition hover:border-[#2EFF7B]/60 hover:bg-[#2EFF7B]/10 sm:inline-flex"
          >
            <span>Behance</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#2EFF7B]" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/12 bg-[#07090F]/95 p-4 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className="rounded-xl px-3 py-2.5 text-left font-sans text-sm font-medium text-zinc-200 transition hover:bg-white/10"
              >
                {item.label[lang]}
              </button>
            ))}
            <a
              href={BEHANCE_EXACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-between rounded-xl border border-[#2EFF7B]/35 bg-[#2EFF7B]/10 px-3.5 py-2.5 font-mono text-xs font-semibold text-[#2EFF7B]"
            >
              <span>Behance Portfolio 2026</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
