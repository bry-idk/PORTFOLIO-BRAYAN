import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { BEHANCE_EXACT_URL } from '../data/profileData'
import { PROJECTS_DATA } from '../data/projectsData'
import { Lang, ProjectData } from '../types/portfolio'
import { AmbientToggle } from './AmbientToggle'

export interface NavbarProps {
  lang: Lang
  onToggleLang: (lang: Lang) => void
  activeProject: ProjectData | null
  onJumpTo: (selector: string) => void
  scrollProgress?: number
  soundEnabled?: boolean
  onToggleSound?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  activeProject,
  onJumpTo,
  scrollProgress = 0,
  soundEnabled = false,
  onToggleSound,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalCount = String(PROJECTS_DATA.length).padStart(2, '0')
  const activeAccent = activeProject?.theme.accentHex || '#2EFF7B'
  const clampedProgress = Number.isFinite(scrollProgress)
    ? Math.max(0, Math.min(1, scrollProgress))
    : 0

  const navItems = [
    {
      index: '01',
      href: '#works',
      label: { en: `Works (${totalCount})`, es: `Obras (${totalCount})` },
    },
    {
      index: '02',
      href: '#practice',
      label: { en: 'Practice & Bio', es: 'Práctica y Bio' },
    },
    {
      index: '03',
      href: '#cv',
      label: { en: 'Trajectory & Skills', es: 'Trayectoria' },
    },
    {
      index: '04',
      href: '#awards',
      label: { en: 'Awards', es: 'Premios' },
    },
    {
      index: '05',
      href: '#connect',
      label: { en: 'Connect', es: 'Contacto' },
    },
  ]

  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    onJumpTo(href)
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-[64px] border-b border-white/[0.09] bg-[#05060A]/94 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
        {/* Brand Monogram + Live Active-Project Telemetry */}
        <button
          type="button"
          onClick={() => handleNavClick('#hero')}
          data-cursor="HOME"
          className="group flex min-w-0 items-center gap-3 text-left"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border bg-[#0C0F18] font-display text-[11px] font-extrabold tracking-tight text-white transition-colors duration-500"
            style={{
              borderColor: `${activeAccent}55`,
              boxShadow: `inset 0 0 18px ${activeAccent}18`,
            }}
          >
            BM
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="font-mono text-[9.5px] font-medium tracking-[0.22em] text-zinc-500 uppercase">
              Brayan Marín · 2026
            </p>
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500"
                style={{
                  backgroundColor: activeAccent,
                  boxShadow: `0 0 8px ${activeAccent}`,
                }}
              />
              <span className="truncate font-sans text-xs font-medium text-zinc-200 transition-colors group-hover:text-white">
                {activeProject
                  ? `${activeProject.indexLabel} · ${activeProject.title}`
                  : 'Digital Interaction'}
              </span>
            </div>
          </div>
          {/* Mobile subtle live dot indicator */}
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full sm:hidden"
            style={{
              backgroundColor: activeAccent,
              boxShadow: `0 0 8px ${activeAccent}`,
            }}
            aria-hidden="true"
          />
        </button>

        {/* Desktop Editorial Nav Links */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="group relative rounded-lg px-3 py-1.5 font-sans text-xs font-medium tracking-wide text-zinc-400 transition-colors hover:text-white"
            >
              <span>{item.label[lang]}</span>
              <span
                className="pointer-events-none absolute right-3 bottom-0.5 left-3 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ backgroundColor: activeAccent }}
              />
            </button>
          ))}
        </nav>

        {/* Right Controls: Sound Toggle + EN / ES + Behance + Mobile Menu */}
        <div className="flex shrink-0 items-center gap-2">
          {onToggleSound ? (
            <AmbientToggle
              lang={lang}
              enabled={soundEnabled}
              onToggle={onToggleSound}
              accentHex={activeAccent}
            />
          ) : null}

          <div
            role="group"
            aria-label={lang === 'en' ? 'Language selector' : 'Selector de idioma'}
            className="inline-flex h-8 items-center rounded-xl border border-white/[0.12] bg-black/50 p-0.5"
          >
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              aria-pressed={lang === 'en'}
              className={`rounded-[9px] px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-wider transition-all ${
                lang === 'en'
                  ? 'bg-[#2EFF7B] text-[#05060A] shadow-[0_0_14px_rgba(46,255,123,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('es')}
              aria-pressed={lang === 'es'}
              className={`rounded-[9px] px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-wider transition-all ${
                lang === 'es'
                  ? 'bg-[#8B3DFF] text-white shadow-[0_0_14px_rgba(139,61,255,0.45)]'
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
            data-cursor="OPEN"
            className="hidden h-8 items-center gap-1 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 font-mono text-[10.5px] font-semibold tracking-wider text-zinc-200 transition hover:border-[#2EFF7B]/55 hover:bg-[#2EFF7B]/10 hover:text-white sm:inline-flex"
          >
            <span>Behance</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#2EFF7B]" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] text-zinc-100 transition hover:border-white/30 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* 1.5px Full-Bleed Scroll Progress Hairline along bottom edge (y=64px) */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1.5px] bg-white/[0.05]"
        aria-hidden="true"
      >
        <div
          className="h-full w-full origin-left transition-[transform,background] duration-150 ease-out will-change-transform"
          style={{
            transform: `scaleX(${clampedProgress})`,
            background: `linear-gradient(90deg, #2EFF7B 0%, ${activeAccent} 100%)`,
            boxShadow:
              clampedProgress > 0.01 ? `0 0 10px ${activeAccent}80` : 'none',
          }}
        />
      </div>

      {/* Accessible Mobile Drawer (Escape-to-close) */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id="mobile-nav-drawer"
            role="navigation"
            aria-label={lang === 'en' ? 'Mobile navigation' : 'Navegación móvil'}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-3 mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#070910]/96 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl sm:mx-6 lg:hidden"
          >
            {activeProject ? (
              <div className="mb-3 flex items-center justify-between border-b border-white/[0.08] pb-2.5 font-mono text-[10px] tracking-[0.2em] text-zinc-400 uppercase">
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: activeAccent }}
                  />
                  {activeProject.indexLabel} · {activeProject.title}
                </span>
                <span>{Math.round(clampedProgress * 100)}%</span>
              </div>
            ) : null}

            <div className="flex flex-col divide-y divide-white/[0.06]">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  className="flex items-center justify-between py-3 text-left font-sans text-sm font-medium text-zinc-200 transition hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-zinc-500">
                      {item.index}
                    </span>
                    <span>{item.label[lang]}</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
                </button>
              ))}
            </div>

            <a
              href={BEHANCE_EXACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-between rounded-xl border border-[#2EFF7B]/35 bg-[#2EFF7B]/10 px-4 py-2.5 font-mono text-xs font-semibold tracking-wider text-[#2EFF7B] transition hover:bg-[#2EFF7B]/15"
            >
              <span>Behance Portfolio 2026</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
