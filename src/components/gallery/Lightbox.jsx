import { useCallback, useEffect } from 'react'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
} from '@/components/ui/Icons'

/** Full-screen photo viewer with keyboard, button and swipe-free navigation. */
export function Lightbox({ photos, index, onIndexChange, onClose }) {
  const photo = photos[index]

  const go = useCallback(
    (delta) => {
      const next = (index + delta + photos.length) % photos.length
      onIndexChange(next)
    },
    [index, photos.length, onIndexChange],
  )

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [go, onClose])

  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 backdrop-blur-sm"
    >
      <header className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 text-white">
        <span className="text-sm font-medium text-white/70">
          {index + 1} / {photos.length}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={photo.url}
            download
            target="_blank"
            rel="noreferrer"
            aria-label="Open full size photo"
            className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            <DownloadIcon className="size-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo"
            className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-3 pb-3">
        <img
          key={photo.id}
          src={photo.url}
          alt={`Event photo ${index + 1}`}
          className="max-h-full max-w-full animate-fade-up rounded-2xl object-contain"
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
