import { useState } from 'react'

import { CloseIcon, DownloadIcon } from '@/components/ui/Icons'
import { Portal } from '@/components/ui/Portal'

/** Opened per tap — a burst of window.open calls is blocked as a popup. */
const CHUNK = 5

/**
 * Shown when the photo host refuses cross-origin reads.
 *
 * Without an `Access-Control-Allow-Origin` header the page cannot read the
 * image bytes at all, so zipping, sharing and blob downloads are equally
 * impossible. Opening the photos in tabs is the one route left, and each tap
 * opens a handful so the browser does not treat them as a popup flood.
 */
export function BlockedDownloadSheet({ photos, onClose }) {
  const [opened, setOpened] = useState(0)
  const remaining = photos.length - opened

  const openNext = () => {
    const next = photos.slice(opened, opened + CHUNK)
    next.forEach((photo) => window.open(photo.url, '_blank', 'noopener'))
    setOpened((current) => current + next.length)
  }

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Saving your photos"
        className="fixed inset-0 z-50 grid place-items-center overscroll-contain bg-ink-900/70 px-6 backdrop-blur-sm"
        style={{ height: '100dvh' }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-bold text-ink-900">Save your photos</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-cream-200"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            This gallery cannot save photos directly. Each photo opens in a new tab — press and
            hold it, then choose <span className="font-semibold text-ink-900">Save to Photos</span>.
          </p>

          <div className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-sm tabular-nums text-ink-600">
            {opened} of {photos.length} opened
          </div>

          {remaining > 0 ? (
            <button
              type="button"
              onClick={openNext}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99]"
            >
              <DownloadIcon className="size-4" />
              Open next {Math.min(CHUNK, remaining)}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </Portal>
  )
}
