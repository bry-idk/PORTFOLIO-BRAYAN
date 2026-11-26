import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { ContactFooter } from './components/ContactFooter'
import { CustomCursor } from './components/CustomCursor'
import { HeroSection } from './components/HeroSection'
import { MediaLightbox } from './components/MediaLightbox'
import { Navbar } from './components/Navbar'
import {
  PracticeIntroSection,
  TrajectoryAndAwardsSection,
} from './components/ProfileSection'
import { ProjectsShowcase } from './components/ProjectsShowcase'
import { ExperienceCanvas } from './components/webgl/ExperienceCanvas'
import { PROJECTS_DATA } from './data/projectsData'
import { Lang, MediaAsset, ProjectId } from './types/portfolio'
import * as synthAudio from './utils/synthAudio'

const GestureScrollController = lazy(
  () => import('./components/GestureScrollController')
)

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

function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type SectionId = 'hero' | 'practice' | 'works' | 'cv' | 'awards' | 'connect'

export function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang)
  const [activeProjectId, setActiveProjectId] = useState<ProjectId | null>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const [inHero, setInHero] = useState<boolean>(true)
  const [scrollProgress, setScrollProgress] = useState<number>(0)
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    getInitialReducedMotion
  )
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false)
  const [gestureEnabled, setGestureEnabled] = useState<boolean>(false)
  const [lightboxState, setLightboxState] = useState<{
    items: MediaAsset[]
    index: number | null
  }>({ items: [], index: null })

  const lenisRef = useRef<Lenis | null>(null)
  const soundEnabledRef = useRef<boolean>(false)
  const gestureScrollResidualRef = useRef<number>(0)

  const isLightboxOpen =
    lightboxState.index !== null &&
    lightboxState.items[lightboxState.index] !== undefined

  const handleToggleLang = useCallback((next: Lang) => {
    setLang(next)
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // Ignore storage access errors
    }
  }, [])

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabledRef.current
    let resolved = next

    if (
      'toggleAmbientDrone' in synthAudio &&
      typeof synthAudio.toggleAmbientDrone === 'function'
    ) {
      const result = (
        synthAudio.toggleAmbientDrone as (enabled: boolean) => boolean
      )(next)
      if (typeof result === 'boolean') {
        resolved = result
      }
    }

    soundEnabledRef.current = resolved
    setSoundEnabled(resolved)
  }, [])

  // Ensure ambient audio drone is cleanly stopped on unmount
  useEffect(() => {
    return () => {
      if (
        soundEnabledRef.current &&
        'toggleAmbientDrone' in synthAudio &&
        typeof synthAudio.toggleAmbientDrone === 'function'
      ) {
        ;(synthAudio.toggleAmbientDrone as (enabled: boolean) => boolean)(false)
      }
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Track prefers-reduced-motion changes reactively
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
  }, [])

  // Initialize Lenis smooth scroll + GSAP ScrollTrigger sync
  useEffect(() => {
    if (typeof window === 'undefined' || reducedMotion) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(rafCallback)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  // Pause/resume Lenis and lock body scroll while Lightbox is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!isLightboxOpen) return

    const prevBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenisRef.current?.stop()

    return () => {
      document.body.style.overflow = prevBodyOverflow
      lenisRef.current?.start()
    }
  }, [isLightboxOpen])

  // IntersectionObserver tracking active project chapter & hero visibility
  // Replaces per-scroll getBoundingClientRect() layout thrashing
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    const visibleProjects = new Set<ProjectId>()
    const projectOrder = PROJECTS_DATA.map((p) => p.id)

    const projectObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.projectId as
            | ProjectId
            | undefined
          if (!id) continue
          if (entry.isIntersecting) {
            visibleProjects.add(id)
          } else {
            visibleProjects.delete(id)
          }
        }

        const matched =
          projectOrder.find((id) => visibleProjects.has(id)) ?? null
        setActiveProjectId((prev) => (prev === matched ? prev : matched))
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      }
    )

    for (const project of PROJECTS_DATA) {
      const el = document.getElementById(`project-${project.slug}`)
      if (el) projectObserver.observe(el)
    }

    const heroEl = document.getElementById('hero')
    let heroObserver: IntersectionObserver | null = null
    if (heroEl) {
      heroObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (!entry) return
          const nextInHero = entry.isIntersecting
          setInHero((prev) => (prev === nextInHero ? prev : nextInHero))
        },
        { threshold: 0.15 }
      )
      heroObserver.observe(heroEl)
    }

    const visibleSections = new Set<SectionId>()
    const sectionOrder: SectionId[] = [
      'awards',
      'connect',
      'cv',
      'practice',
      'works',
      'hero',
    ]
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId
          if (entry.isIntersecting) {
            visibleSections.add(id)
          } else {
            visibleSections.delete(id)
          }
        }
        const nextSection =
          sectionOrder.find((id) => visibleSections.has(id)) ?? null
        if (nextSection) {
          setActiveSection((prev) => (prev === nextSection ? prev : nextSection))
        }
      },
      {
        rootMargin: '-28% 0px -55% 0px',
        threshold: 0,
      }
    )

    for (const secId of ['hero', 'practice', 'works', 'cv', 'awards', 'connect']) {
      const secEl = document.getElementById(secId)
      if (secEl) sectionObserver.observe(secEl)
    }

    return () => {
      projectObserver.disconnect()
      heroObserver?.disconnect()
      sectionObserver.disconnect()
    }
  }, [])

  // rAF-throttled passive global scroll progress (0..1) with cached document height
  useEffect(() => {
    if (typeof window === 'undefined') return

    let maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    )
    let rafId: number | null = null

    const updateMaxScroll = () => {
      maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      )
    }

    const computeProgress = () => {
      rafId = null
      const next = Math.min(1, Math.max(0, window.scrollY / maxScroll))
      setScrollProgress((prev) =>
        Math.abs(next - prev) >= 0.002 || next === 0 || next === 1 ? next : prev
      )
    }

    const onScroll = () => {
      if (rafId !== null) return
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(computeProgress)
      } else {
        computeProgress()
      }
    }

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateMaxScroll)
      resizeObserver.observe(document.documentElement)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateMaxScroll, { passive: true })
    computeProgress()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateMaxScroll)
      resizeObserver?.disconnect()
      if (rafId !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const handleToggleGesture = useCallback(() => {
    gestureScrollResidualRef.current = 0
    setGestureEnabled((prev) => !prev)
  }, [])

  const handleGestureScrollDelta = useCallback((deltaY: number) => {
    if (
      typeof window === 'undefined' ||
      !Number.isFinite(deltaY) ||
      deltaY === 0
    ) {
      return
    }
    const accumulated = gestureScrollResidualRef.current + deltaY
    const wholePx = Math.trunc(accumulated)
    gestureScrollResidualRef.current = accumulated - wholePx
    if (wholePx === 0) return

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    )
    const nextY = Math.max(0, Math.min(maxScroll, window.scrollY + wholePx))
    if (lenisRef.current) {
      lenisRef.current.scrollTo(nextY, { immediate: true, force: true })
    } else if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: nextY })
    }
  }, [])

  const handleJumpTo = useCallback((selector: string) => {
    const target = document.querySelector(selector) as HTMLElement | null
    if (!target) return
    const offset = selector.startsWith('#project-') ? -116 : -72
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleOpenLightbox = useCallback(
    (items: MediaAsset[], index: number) => {
      setLightboxState({ items, index })
    },
    []
  )

  const handleCloseLightbox = useCallback(() => {
    setLightboxState({ items: [], index: null })
  }, [])

  const handleChangeLightboxIndex = useCallback((index: number) => {
    setLightboxState((prev) => ({ ...prev, index }))
  }, [])

  const activeProject = useMemo(
    () => PROJECTS_DATA.find((p) => p.id === activeProjectId) || null,
    [activeProjectId]
  )

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#06070B] text-zinc-100">
      {/* Persistent Three.js / GLSL Background Canvas */}
      <ExperienceCanvas
        activeTheme={activeProject?.theme || null}
        heroFocus={inHero}
        reducedMotion={reducedMotion}
      />

      {/* Desktop Kinetic Cursor */}
      <CustomCursor accentHex={activeProject?.theme.accentHex} />

      {/* Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        activeProject={activeProject}
        activeSection={activeProjectId ? 'works' : activeSection}
        onJumpTo={handleJumpTo}
        scrollProgress={scrollProgress}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        gestureEnabled={gestureEnabled}
        onToggleGesture={handleToggleGesture}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <HeroSection lang={lang} onJumpTo={handleJumpTo} />

        <PracticeIntroSection lang={lang} onJumpTo={handleJumpTo} />

        <ProjectsShowcase
          lang={lang}
          activeProjectId={activeProjectId}
          onJumpTo={handleJumpTo}
          onOpenLightbox={handleOpenLightbox}
          soundEnabled={soundEnabled}
        />

        <TrajectoryAndAwardsSection lang={lang} onJumpTo={handleJumpTo} />
      </main>

      <ContactFooter lang={lang} onJumpTo={handleJumpTo} />

      {/* Editorial Media Lightbox */}
      <MediaLightbox
        items={lightboxState.items}
        activeIndex={lightboxState.index}
        lang={lang}
        accentHex={activeProject?.theme.accentHex}
        onClose={handleCloseLightbox}
        onChangeIndex={handleChangeLightboxIndex}
      />

      {/* Optional MediaPipe Webcam Air-Gesture Scroll HUD */}
      {gestureEnabled ? (
        <Suspense fallback={null}>
          <GestureScrollController
            lang={lang}
            accentHex={activeProject?.theme.accentHex}
            paused={isLightboxOpen}
            onScrollDelta={handleGestureScrollDelta}
            onClose={() => setGestureEnabled(false)}
          />
        </Suspense>
      ) : null}
    </div>
  )
}

export default App
