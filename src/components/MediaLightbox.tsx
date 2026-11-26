import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Lang, MediaAsset } from '../types/portfolio'

interface Props {
  items: MediaAsset[]
  activeIndex: number | null
  lang: Lang
  onClose: () => void
  onChangeIndex: (index: number) => void
}

export const MediaLightbox: React.FC<Props> = ({
  items,
  activeIndex,
  lang,
  onClose,
  onChangeIndex,
}) => {
  const touchStartX = useRef<number | null>(null)
  const isOpen = activeIndex !== null && items[activeIndex] !== undefined
  const activeItem = isOpen ? items[activeIndex] : null

  useEffect(() => {
    if (!isOpen || activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % items.length)
      }
      if (e.key === 'ArrowLeft') {
        onChangeIndex((activeIndex - 1 + items.length) % items.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, activeIndex, items.length, onClose, onChangeIndex])

  return (
    <AnimatePresence>
      {isOpen && activeItem && activeIndex !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.alt[lang]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-xl sm:p-8"
          onClick={onClose}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
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
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'en' ? 'Close lightbox' : 'Cerrar visor'}
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-[#2EFF7B] hover:text-[#2EFF7B]"
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChangeIndex((activeIndex - 1 + items.length) % items.length)
                }}
                aria-label={lang === 'en' ? 'Previous image' : 'Imagen anterior'}
                className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-[#2EFF7B] hover:text-[#2EFF7B] sm:left-6"
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
                className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-[#2EFF7B] hover:text-[#2EFF7B] sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <motion.div
            key={activeItem.id}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-5xl flex-col items-center gap-4"
          >
            <img
              src={activeItem.src}
              alt={activeItem.alt[lang]}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl border border-white/15 object-contain shadow-2xl"
            />
            <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
              <p className="text-zinc-200">{activeItem.caption[lang]}</p>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                {activeItem.pdfPageRef && (
                  <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[#2EFF7B]">
                    {activeItem.pdfPageRef}
                  </span>
                )}
                <span>
                  {activeIndex + 1} / {items.length}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
