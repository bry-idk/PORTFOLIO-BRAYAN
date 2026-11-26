import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ContactFooter } from './components/ContactFooter'
import { CustomCursor } from './components/CustomCursor'
import { HeroSection } from './components/HeroSection'
import { MediaLightbox } from './components/MediaLightbox'
import { Navbar } from './components/Navbar'
import { ProfileSection } from './components/ProfileSection'
import { ProjectsShowcase } from './components/ProjectsShowcase'
import { ExperienceCanvas } from './components/webgl/ExperienceCanvas'
import { PROJECTS_DATA } from './data/projectsData'
import { Lang, MediaAsset, ProjectId } from './types/portfolio'

gsap.registerPlugin(ScrollTrigger)

const LANG_STORAGE_KEY = 'bma-portfolio-lang'

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    // Ignore storage access errors
  }
  return 'en'
}

export function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang)
  const [activeProjectId, setActiveProjectId] = useState<ProjectId | null>(null)
  const [lightboxState, setLightboxState] = useState<{
    items: MediaAsset[]
    index: number | null
  }>({ items: [], index: null })

  const lenisRef = useRef<Lenis | null>(null)

  const handleToggleLang = useCallback((next: Lang) => {
    setLang(next)
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // Ignore storage access errors
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Initialize Lenis smooth scroll + GSAP ScrollTrigger sync
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let lenis: Lenis | null = null
    let rafCallback: ((time: number) => void) | null = null

    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)

      rafCallback = (time: number) => {
        lenis?.raf(time * 1000)
      }
      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)
    }

    const computeActiveProject = () => {
      const midY = window.innerHeight * 0.42
      let matched: ProjectId | null = null
      for (const project of PROJECTS_DATA) {
        const el = document.getElementById(`project-${project.slug}`)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= midY && rect.bottom >= midY) {
          matched = project.id
          break
        }
      }
      setActiveProjectId((prev) => (prev === matched ? prev : matched))
    }

    window.addEventListener('scroll', computeActiveProject, { passive: true })
    computeActiveProject()

    return () => {
      window.removeEventListener('scroll', computeActiveProject)
      if (rafCallback) {
        gsap.ticker.remove(rafCallback)
      }
      if (lenis) {
        lenis.destroy()
      }
      lenisRef.current = null
    }
  }, [])

  const handleJumpTo = useCallback((selector: string) => {
    const target = document.querySelector(selector) as HTMLElement | null
    if (!target) return
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -70 })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const activeProject = useMemo(
    () => PROJECTS_DATA.find((p) => p.id === activeProjectId) || null,
    [activeProjectId]
  )

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#06070B] text-zinc-100">
      {/* Persistent Three.js / GLSL Background Canvas */}
      <ExperienceCanvas activeTheme={activeProject?.theme || null} />

      {/* Desktop Kinetic Cursor */}
      <CustomCursor />

      {/* Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        activeProject={activeProject}
        onJumpTo={handleJumpTo}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection lang={lang} onJumpTo={handleJumpTo} />

        <ProjectsShowcase
          lang={lang}
          activeProjectId={activeProjectId}
          onJumpTo={handleJumpTo}
          onOpenLightbox={(items, index) => setLightboxState({ items, index })}
        />

        <ProfileSection lang={lang} />
      </main>

      <ContactFooter lang={lang} />

      {/* Editorial Media Lightbox */}
      <MediaLightbox
        items={lightboxState.items}
        activeIndex={lightboxState.index}
        lang={lang}
        onClose={() => setLightboxState({ items: [], index: null })}
        onChangeIndex={(index) =>
          setLightboxState((prev) => ({ ...prev, index }))
        }
      />
    </div>
  )
}

export default App
