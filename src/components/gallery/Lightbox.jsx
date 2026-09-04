import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DownloadIcon,
  RetryIcon,
} from '@/components/ui/Icons'
import { Portal } from '@/components/ui/Portal'
import { downloadPhoto } from '@/utils/download'
import { lockScroll } from '@/utils/scrollLock'

const SWIPE_THRESHOLD = 60
/** A mostly-vertical drag dismisses instead of paging. */
const DISMISS_THRESHOLD = 90

/** Full-screen photo viewer with keyboard, button and swipe navigation. */
export function Lightbox({ photos, index, fullName, onIndexChange, onClose }) {
  const photo = photos[index]
  const [status, setStatus] = useState('loading')
  const [statusFor, setStatusFor] = useState(index)
  const [saving, setSaving] = useState(false)
  const [drag, setDrag] = useState(0)
  const startRef = useRef(null)
  const dialogRef = useRef(null)

  // Moving to another photo restarts the load state during render.
  if (statusFor !== index) {
    setStatusFor(index)
    setStatus('loading')
  }

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
    const release = lockScroll()
    // Move focus into the dialog so Escape and screen readers behave.
    dialogRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      release()
    }
  }, [go, onClose])

  // Preload the neighbours so swiping feels instant.
  useEffect(() => {
    if (photos.length < 2) return
    ;[1, -1].forEach((delta) => {
      const neighbour = photos[(index + delta + photos.length) % photos.length]
      if (neighbour) new Image().src = neighbour.url
    })
  }, [index, photos])

  const handleSave = async () => {
    setSaving(true)
    try {
      const outcome = await downloadPhoto(photo, index, fullName)
      if (outcome === 'saved') toast.success('Photo saved')
      else toast('Opened in a new tab — long press to save it', { icon: '💾' })
    } finally {
      setSaving(false)
    }
  }

  const onTouchStart = (event) => {
    const touch = event.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchMove = (event) => {
    if (!startRef.current) return
    const touch = event.touches[0]
    const dx = touch.clientX - startRef.current.x
    const dy = touch.clientY - startRef.current.y
    // Only track a vertical drag; horizontal is paging.
    if (Math.abs(dy) > Math.abs(dx)) setDrag(dy)
  }

  const onTouchEnd = (event) => {
    if (!startRef.current) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - startRef.current.x
    const dy = touch.clientY - startRef.current.y
    startRef.current = null
    setDrag(0)

    if (Math.abs(dy) > Math.abs(dx)) {
      if (Math.abs(dy) > DISMISS_THRESHOLD) onClose()
      return
    }
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1)
  }

  if (!photo) return null

  return (
    <Portal>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-label={`Photo ${index + 1} of ${photos.length}`}
        // Dismiss on backdrop tap, but not when the tap landed on a control.
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="fixed inset-0 z-50 flex flex-col overscroll-contain bg-ink-900/95 backdrop-blur-sm outline-none"
        style={{
          // Fills the visual viewport even with Safari's dynamic toolbars.
          height: '100dvh',
          transform: drag ? `translateY(${drag * 0.4}px)` : undefined,
          opacity: drag ? Math.max(0.4, 1 - Math.abs(drag) / 400) : 1,
          transition: drag ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out',
        }}
      >
        <header className="flex shrink-0 items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 text-white">
          <span className="text-sm font-medium tabular-nums text-white/70">
            {index + 1} / {photos.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              aria-label="Save this photo"
              className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-50"
            >
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <DownloadIcon className="size-5" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close photo"
              className="grid size-11 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          {status === 'loading' && (
            <span className="absolute size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}

          {status === 'error' ? (
            <div className="text-center text-white/70">
              <RetryIcon className="mx-auto size-8" />
              <p className="mt-3 text-sm">This photo could not be loaded.</p>
            </div>
          ) : (
            <img
              key={photo.id}
              src={photo.url}
              alt={`Event photo ${index + 1}`}
              draggable={false}
              onLoad={() => setStatus('loaded')}
              onError={() => setStatus('error')}
              className={`max-h-full max-w-full rounded-2xl object-contain transition-opacity duration-300 ${
                status === 'loaded' ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

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
    </Portal>
  )
}
