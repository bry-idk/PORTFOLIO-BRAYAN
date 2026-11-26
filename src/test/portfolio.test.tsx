import fs from 'node:fs'
import path from 'node:path'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { BEHANCE_EXACT_URL, PROFILE_DATA } from '../data/profileData'
import { PROJECTS_DATA, SOFTWARE_META } from '../data/projectsData'

afterEach(() => {
  window.localStorage.clear()
})

describe('Portfolio Data Fidelity & Media Integrity', () => {
  it('maintains all 7 projects in curated portfolio order', () => {
    expect(PROJECTS_DATA.map((p) => p.title)).toEqual([
      'Crónicas de Palenque',
      'Kane no Hibiki',
      'SOGNO',
      'Notas y Colores',
      'The Amazing Digital Circus 2',
      'Reminiscencia',
      'Vestigio',
    ])
    expect(PROJECTS_DATA.map((p) => p.order)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('uses the exact Behance URL from link behance.txt', () => {
    expect(BEHANCE_EXACT_URL).toBe(
      'https://www.behance.net/gallery/254153935/PORTFOLIO-DIGITAL-INTERACTION-2026'
    )
    expect(PROFILE_DATA.contact.behanceUrl).toBe(BEHANCE_EXACT_URL)
  })

  it('has all referenced media files present in public/media with no duplicate gallery paths', () => {
    const publicRoot = path.resolve(process.cwd(), 'public')
    expect(
      fs.existsSync(
        path.join(publicRoot, PROFILE_DATA.portraitUrl.replace(/^\//, ''))
      )
    ).toBe(true)

    for (const project of PROJECTS_DATA) {
      expect(
        fs.existsSync(
          path.join(publicRoot, project.coverImage.replace(/^\//, ''))
        )
      ).toBe(true)

      const seenSrcs = new Set<string>()
      for (const item of project.gallery) {
        expect(seenSrcs.has(item.src)).toBe(false)
        seenSrcs.add(item.src)
        const diskPath = path.join(publicRoot, item.src.replace(/^\//, ''))
        expect(fs.existsSync(diskPath)).toBe(true)
      }

      for (const vid of project.videos) {
        const vidPath = path.join(publicRoot, vid.src.replace(/^\//, ''))
        expect(fs.existsSync(vidPath)).toBe(true)
      }
    }
  })

  it('contains all 13 Career entries, 7 Education entries, and 5 Awards from portfolio pag 1.pdf', () => {
    expect(PROFILE_DATA.careerOverview).toHaveLength(13)
    expect(PROFILE_DATA.education).toHaveLength(7)
    expect(PROFILE_DATA.awards).toHaveLength(5)
    expect(PROFILE_DATA.awards.map((a) => a.project)).toEqual([
      'LITHIUM',
      'Symbiosis',
      'Crónicas de Palenque',
      'Sogno 2',
      'Sogno',
    ])

    for (const p of PROJECTS_DATA) {
      for (const sw of p.software) {
        expect(SOFTWARE_META[sw]).toBeDefined()
      }
    }
  })
})

describe('Portfolio Interactive UI & Bilingual EN/ES Switcher', () => {
  it('renders all 7 project chapters, bio, awards, exact Behance link, and switches language EN <-> ES live', () => {
    render(<App />)

    // Verify EN content initially
    expect(screen.getAllByText(/BRAYAN MARÍN AMPUDIA/i).length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText(/My artistic practice explores individual and collective memory/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Crónicas de Palenque/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Kane no Hibiki/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^SOGNO$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Notas y Colores/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /The Amazing Digital Circus 2/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Reminiscencia/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Vestigio/i })).toBeInTheDocument()

    // Verify exact Behance link exists in DOM
    const behanceLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === BEHANCE_EXACT_URL)
    expect(behanceLinks.length).toBeGreaterThanOrEqual(2)

    // Switch to ES
    const esBtn = screen.getByRole('button', { name: 'ES' })
    fireEvent.click(esBtn)

    expect(
      screen.getByText(/Mi práctica artística explora la memoria individual y colectiva/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/PREMIOS Y RECONOCIMIENTOS/i)
    ).toBeInTheDocument()

    // Switch back to EN
    const enBtn = screen.getByRole('button', { name: 'EN' })
    fireEvent.click(enBtn)
    expect(screen.getByText(/AWARDS & RECOGNITIONS/i)).toBeInTheDocument()
  })

  it('filters Career Overview by year cleanly without losing entries on reset', () => {
    render(<App />)
    const btn2026 = screen.getByRole('button', { name: '2026' })
    fireEvent.click(btn2026)
    expect(screen.getByText(/Spatial Experience Director/i)).toBeInTheDocument()
    expect(screen.queryByText(/Nexia Studios/i)).not.toBeInTheDocument()

    const btnAll = screen.getByRole('button', { name: 'ALL' })
    fireEvent.click(btnAll)
    expect(screen.getByText(/Nexia Studios/i)).toBeInTheDocument()
  })

  it('persists ES language selection across remounts and opens/navigates/closes the media lightbox', async () => {
    const { unmount } = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'ES' }))
    expect(window.localStorage.getItem('bma-portfolio-lang')).toBe('es')
    unmount()

    render(<App />)
    expect(
      screen.getByText(/PREMIOS Y RECONOCIMIENTOS/i)
    ).toBeInTheDocument()

    // Click first gallery portal image button to open Lightbox
    const zoomButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('data-cursor') === 'ZOOM')
    expect(zoomButtons.length).toBeGreaterThan(5)
    fireEvent.click(zoomButtons[0])

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText(/^1 \/ \d+$/)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText(/^2 \/ \d+$/)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('updates Kane no Hibiki ultrasonic simulator distance and triggers Notas y Colores pad buttons safely', () => {
    render(<App />)

    const slider = screen.getByLabelText('Ultrasonic sensor distance')
    fireEvent.change(slider, { target: { value: '1' } })
    expect(screen.getByText('/osc/dist: 0.40m')).toBeInTheDocument()

    fireEvent.change(slider, { target: { value: '0' } })
    expect(screen.getByText('/osc/dist: 6.00m')).toBeInTheDocument()

    const padD = screen.getByRole('button', { name: 'Play note D DO / C4' })
    fireEvent.click(padD)
    expect(screen.getByText('D · DO / C4')).toBeInTheDocument()
  })
})
