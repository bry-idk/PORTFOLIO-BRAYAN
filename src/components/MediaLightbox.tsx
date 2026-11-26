import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Lang, MediaAsset } from '../types/portfolio'

export interface MediaLightboxProps {
  items: MediaAsset[]
  activeIndex: number | null
  lang: Lang
  accentHex?: string
  onClose: () => void
  onChangeIndex: (index: number) => void
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  items,
  activeIndex,
  lang,
  accentHex = '#2EFF7B',
  onClose,
  onChangeIndex,
}) => {
  const touchStartX = useRef<number | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [zoomed, setZoomed] = useState(false)

  const isOpen = activeIndex !== null && items[activeIndex] !== undefined
  const activeItem = isOpen ? items[activeIndex] : null

  // Reset zoom whenever slide changes or lightbox closes
  useEffect(() => {
    setZoomed(false)
  }, [activeIndex, isOpen])

  // Focus management: focus close button on open, trap Tab, restore focus on close
  useEffect(() => {
    if (!isOpen) return

    prevFocusRef.current = document.activeElement as HTMLElement | null
    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus?.()
    }, 0)

    return () => {
      window.clearTimeout(focusTimer)
      prevFocusRef.current?.focus?.()
      prevFocusRef.current = null
    }
  }, [isOpen])

  // Center active thumbnail in filmstrip smoothly
  useEffect(() => {
    if (!isOpen || activeIndex === null) return
    const thumb = thumbRefs.current[activeIndex]
    if (thumb && typeof thumb.scrollIntoView === 'function') {
      try {
        thumb.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      } catch {
        // Safe fallback in non-browser environments
      }
    }
  }, [isOpen, activeIndex])

  // Keyboard navigation + Escape + focus trap
  useEffect(() => {
    if (!isOpen || activeIndex === null) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowRight' && items.length > 1) {
        onChangeIndex((activeIndex + 1) % items.length)
        return
      }
      if (e.key === 'ArrowLeft' && items.length > 1) {
        onChangeIndex((activeIndex - 1 + items.length) % items.length)
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
          )
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, activeIndex, items.length, onClose, onChangeIndex])

  return (
    <AnimatePresence>
      {isOpen && activeItem && activeIndex !== null && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.alt[lang]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[#040508]/95 p-4 backdrop-blur-2xl sm:p-6"
          onClick={onClose}
          onTouchStart={(e) => {
            if (zoomed) return
            touchStartX.current = e.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(e) => {
            if (zoomed || touchStartX.current === null || items.length <= 1) {
              touchStartX.current = null
              return
            }
            const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
            const diff = endX - touchStartX.current
            if (diff > 50) {
              onChangeIndex((activeIndex - 1 + items.length) % items.length)
            } else if (diff < -50) {
              onChangeIndex((activeIndex + 1) % items.length)
            }
            touchStartX.current = null
          }}
        >
          {/* Ambient accent top hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 h-[2px] opacity-80"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentHex}, transparent)`,
            }}
          />

          {/* Top toolbar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 flex w-full max-w-6xl items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 font-mono text-xs text-zinc-400">
              {activeItem.pdfPageRef && (
                <span
                  className="rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    borderColor: `${accentHex}55`,
                    backgroundColor: `${accentHex}18`,
                    color: accentHex,
                  }}
                >
                  {activeItem.pdfPageRef}
                </span>
              )}
              <span className="font-mono text-xs font-medium text-zinc-200">
                {activeIndex + 1} / {items.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-pressed={zoomed}
                aria-label={
                  zoomed
                    ? lang === 'en'
                      ? 'Zoom out to fit'
                      : 'Ajustar a pantalla'
                    : lang === 'en'
                      ? 'Zoom in 1.5x'
                      : 'Acercar 1.5x'
                }
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 font-mono text-xs text-zinc-100 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B]"
                style={{
                  borderColor: zoomed ? `${accentHex}99` : undefined,
                  color: zoomed ? accentHex : undefined,
                }}
              >
                {zoomed ? (
                  <ZoomOut className="h-4 w-4" />
                ) : (
                  <ZoomIn className="h-4 w-4" />
                )}
                <span>{zoomed ? '1.5×' : '1.0×'}</span>
              </button>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label={lang === 'en' ? 'Close lightbox' : 'Cerrar visor'}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B]"
                style={{
                  boxShadow: `0 0 0 1px ${accentHex}33`,
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Center stage + Prev/Next controls */}
          <div className="relative my-3 flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center">
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChangeIndex(
                      (activeIndex - 1 + items.length) % items.length
                    )
                  }}
                  aria-label={
                    lang === 'en' ? 'Previous image' : 'Imagen anterior'
                  }
                  className="absolute left-0 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B] sm:left-2"
                  style={{ borderColor: `${accentHex}44` }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChangeIndex((activeIndex + 1) % items.length)
                  }}
                  aria-label={lang === 'en' ? 'Next image' : 'Siguiente imagen'}
                  className="absolute right-0 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B] sm:right-2"
                  style={{ borderColor: `${accentHex}44` }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <motion.div
              key={activeItem.id}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className={`flex max-h-full w-full items-center justify-center px-12 sm:px-16 ${
                zoomed ? 'overflow-auto' : 'overflow-hidden'
              }`}
            >
              <img
                src={activeItem.src}
                alt={activeItem.alt[lang]}
                onClick={() => setZoomed((z) => !z)}
                className={`rounded-xl border border-white/15 object-contain shadow-2xl transition-transform duration-300 ease-out ${
                  zoomed
                    ? 'max-h-[68vh] w-auto max-w-full cursor-zoom-out scale-150'
                    : 'max-h-[64vh] w-auto max-w-full cursor-zoom-in scale-100'
                }`}
              />
            </motion.div>
          </div>

          {/* Bottom caption + filmstrip selector */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 flex w-full max-w-5xl flex-col gap-3"
          >
            <div className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm backdrop-blur-md">
              <p className="text-xs leading-relaxed text-zinc-200 sm:text-sm">
                {activeItem.caption[lang]}
              </p>
              <span className="hidden shrink-0 font-mono text-[10px] tracking-wider text-zinc-500 uppercase sm:inline">
                {lang === 'en' ? 'ESC · ←/→' : 'ESC · ←/→'}
              </span>
            </div>

            {items.length > 1 && (
              <div
                aria-label={
                  lang === 'en' ? 'Gallery thumbnails' : 'Miniaturas de galería'
                }
                className="no-scrollbar flex items-center gap-2 overflow-x-auto px-1 py-1"
              >
                {items.map((item, idx) => {
                  const isCurrent = idx === activeIndex
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        thumbRefs.current[idx] = el
                      }}
                      type="button"
                      onClick={() => onChangeIndex(idx)}
                      aria-label={`${lang === 'en' ? 'View image' : 'Ver imagen'} ${idx + 1}: ${item.alt[lang]}`}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={`relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFF7B] sm:h-12 sm:w-20 ${
                        isCurrent
                          ? 'opacity-100 scale-[1.03]'
                          : 'border-white/10 opacity-45 hover:opacity-85'
                      }`}
                      style={{
                        borderColor: isCurrent ? accentHex : undefined,
                        boxShadow: isCurrent
                          ? `0 0 0 1px ${accentHex}, 0 6px 18px -6px ${accentHex}88`
                          : undefined,
                      }}
                    >
                      <img
                        src={item.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
