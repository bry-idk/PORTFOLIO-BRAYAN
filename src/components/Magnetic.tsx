import React, { useEffect, useRef } from 'react'

export interface MagneticProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

const MAX_OFFSET_PX = 14

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.28,
  className = '',
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const enabledRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      enabledRef.current = false
      return
    }
    const isFinePointer = window.matchMedia('(pointer: fine)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    enabledRef.current = isFinePointer && !prefersReduced
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabledRef.current) return
    const el = wrapperRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)

    const tx = Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, relX * strength))
    const ty = Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, relY * strength))

    el.style.transition = 'transform 0.14s cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
  }

  const handleMouseLeave = () => {
    const el = wrapperRef.current
    if (!el) return
    el.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)'
    el.style.transform = 'translate3d(0px, 0px, 0)'
  }

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-flex will-change-transform ${className}`}
    >
      {children}
    </div>
  )
}
