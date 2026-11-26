import React, { useEffect, useRef, useState } from 'react'

export interface CustomCursorProps {
  accentHex?: string
}

function withHexAlpha(hex: string, alphaHex: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${alphaHex}` : fallback
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  accentHex = '#2EFF7B',
}) => {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  const [label, setLabel] = useState<string>('')
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  const visibleRef = useRef(false)
  const hoveringRef = useRef(false)
  const labelRef = useRef('')

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isFinePointer || prefersReduced) return

    let mouseX = -100
    let mouseY = -100
    let curX = -100
    let curY = -100
    let rafId = 0
    let isRunning = false

    const applyTransforms = (rx: number, ry: number, dx: number, dy: number) => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0) translate(-50%, -50%)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) translate(-50%, -50%)`
      }
    }

    const tick = () => {
      const dx = mouseX - curX
      const dy = mouseY - curY

      if (Math.abs(dx) < 0.15 && Math.abs(dy) < 0.15) {
        curX = mouseX
        curY = mouseY
        applyTransforms(curX, curY, mouseX, mouseY)
        isRunning = false
        rafId = 0
        return
      }

      curX += dx * 0.18
      curY += dy * 0.18
      applyTransforms(curX, curY, mouseX, mouseY)
      rafId = requestAnimationFrame(tick)
    }

    const wakeLoop = () => {
      if (!isRunning) {
        isRunning = true
        rafId = requestAnimationFrame(tick)
      }
    }

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!visibleRef.current) {
        visibleRef.current = true
        curX = e.clientX
        curY = e.clientY
        applyTransforms(curX, curY, mouseX, mouseY)
        setVisible(true)
      }

      const rawTarget = e.target as HTMLElement | null
      const cursorTarget = rawTarget?.closest('[data-cursor]') as HTMLElement | null
      let nextHovering = false
      let nextLabel = ''

      if (cursorTarget) {
        nextHovering = true
        nextLabel = cursorTarget.getAttribute('data-cursor') || ''
      } else {
        const interactive = rawTarget?.closest(
          'a, button, [role="button"], input[type="range"]'
        )
        nextHovering = Boolean(interactive)
        nextLabel = ''
      }

      if (nextHovering !== hoveringRef.current) {
        hoveringRef.current = nextHovering
        setHovering(nextHovering)
      }
      if (nextLabel !== labelRef.current) {
        labelRef.current = nextLabel
        setLabel(nextLabel)
      }

      wakeLoop()
    }

    const onLeave = () => {
      if (visibleRef.current) {
        visibleRef.current = false
        setVisible(false)
      }
      if (hoveringRef.current) {
        hoveringRef.current = false
        setHovering(false)
      }
      if (labelRef.current) {
        labelRef.current = ''
        setLabel('')
      }
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
        isRunning = false
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const ringBorderColor = hovering
    ? withHexAlpha(accentHex, 'E0', 'rgba(46, 255, 123, 0.88)')
    : 'rgba(255, 255, 255, 0.28)'
  const ringBgColor = hovering
    ? withHexAlpha(accentHex, '18', 'rgba(46, 255, 123, 0.1)')
    : 'transparent'
  const dotGlow = withHexAlpha(accentHex, 'AA', 'rgba(46, 255, 123, 0.65)')

  return (
    <div
      className="custom-cursor-layer pointer-events-none fixed inset-0 z-[90] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full border transition-[width,height,border-color,background-color] duration-200 will-change-transform ${
          label
            ? 'h-16 w-16 backdrop-blur-[3px]'
            : hovering
              ? 'h-12 w-12 backdrop-blur-[2px]'
              : 'h-7 w-7'
        }`}
        style={{
          borderColor: ringBorderColor,
          backgroundColor: ringBgColor,
        }}
      >
        {label ? (
          <span
            className="font-mono text-[9px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: accentHex }}
          >
            {label}
          </span>
        ) : null}
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full transition-[background-color,box-shadow,transform] duration-200 will-change-transform"
        style={{
          backgroundColor: accentHex,
          boxShadow: `0 0 12px ${dotGlow}`,
        }}
      />
    </div>
  )
}
