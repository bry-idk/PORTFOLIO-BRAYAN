import React, { useEffect, useRef, useState } from 'react'

export const CustomCursor: React.FC = () => {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string>('')
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    if (!isFinePointer) return

    let mouseX = -100
    let mouseY = -100
    let curX = -100
    let curY = -100
    let rafId = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!visibleRef.current) {
        visibleRef.current = true
        curX = e.clientX
        curY = e.clientY
        setVisible(true)
      }

      const target = (e.target as HTMLElement | null)?.closest(
        '[data-cursor]'
      ) as HTMLElement | null
      if (target) {
        setHovering(true)
        setLabel(target.getAttribute('data-cursor') || '')
      } else {
        const interactive = (e.target as HTMLElement | null)?.closest(
          'a, button, [role="button"], input[type="range"]'
        )
        setHovering(Boolean(interactive))
        setLabel('')
      }
    }

    const onLeave = () => {
      visibleRef.current = false
      setVisible(false)
    }

    const tick = () => {
      curX += (mouseX - curX) * 0.18
      curY += (mouseY - curY) * 0.18
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
      }
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="custom-cursor-layer pointer-events-none fixed inset-0 z-[90] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full border transition-[width,height,border-color,background-color] duration-200 ${
          hovering
            ? 'h-14 w-14 border-[#2EFF7B]/90 bg-[#2EFF7B]/10 backdrop-blur-[2px]'
            : 'h-8 w-8 border-white/35 bg-transparent'
        }`}
      >
        {label ? (
          <span className="font-mono text-[9px] font-semibold tracking-widest text-[#2EFF7B] uppercase">
            {label}
          </span>
        ) : null}
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-[#2EFF7B] shadow-[0_0_10px_#2EFF7B]"
      />
    </div>
  )
}
