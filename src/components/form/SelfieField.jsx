import { useRef, useState } from 'react'

import { CameraIcon, RetryIcon } from '@/components/ui/Icons'
import { cn } from '@/utils/cn'
import { formatBytes, validateImage } from '@/utils/file'

/**
 * Selfie input driven by the device's own camera app.
 *
 * `capture="user"` asks for the front lens. Phones treat it as a hint — some
 * open whichever lens the camera app used last — which is accepted here: the
 * native camera gives autofocus, exposure and full sensor resolution, and a
 * sharp rear-camera shot matches better than a soft in-page capture. Camera is
 * the only source; there is deliberately no gallery path.
 */
export function SelfieField({ label, value, previewUrl, onChange, error }) {
  const cameraInputRef = useRef(null)
  const [localError, setLocalError] = useState(null)

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-taking and picking the same file
    if (!file) return

    const message = validateImage(file)
    setLocalError(message)
    if (message) return

    // The camera file is passed through untouched: browsers honour the EXIF
    // orientation when displaying it, and the server reads the same tag.
    onChange(file)
  }

  const shownError = error ?? localError
  const openCamera = () => {
    setLocalError(null)
    cameraInputRef.current?.click()
  }

  return (
    <div className="space-y-2">
      <p className="text-base font-semibold text-ink-900">{label}</p>

      <div
        className={cn(
          'overflow-hidden rounded-field bg-white ring-2 transition-shadow duration-200',
          shownError ? 'ring-brand-700' : 'ring-brand-500/80',
        )}
      >
        {previewUrl ? (
          <div className="flex items-center gap-3 p-3">
            <img
              src={previewUrl}
              alt="Your selfie preview"
              className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-cream-300"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">
                {value?.name || 'selfie.jpg'}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                {value ? `${formatBytes(value.size)} · ready to search` : 'Ready to search'}
              </p>
            </div>
            <button
              type="button"
              onClick={openCamera}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cream-100 px-3.5 py-2 text-xs font-semibold text-ink-600 transition hover:bg-cream-200"
            >
              <RetryIcon className="size-3.5" /> Retake
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openCamera}
            className="group flex w-full flex-col items-center gap-2 px-5 py-6 text-center transition hover:bg-cream-50"
          >
            <CameraIcon className="size-10 text-ink-900" strokeWidth={1.5} />
            <span className="text-base font-semibold text-ink-900 sm:text-lg">
              Click to take a selfie
            </span>
            <span className="text-xs text-ink-400">Opens your camera</span>
          </button>
        )}
      </div>

      {shownError && <p className="text-sm font-medium text-brand-700">{shownError}</p>}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={handleFile}
        tabIndex={-1}
      />
    </div>
  )
}
