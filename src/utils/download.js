import { downloadName } from '@/utils/file'

/**
 * Saves a blob under `filename` via a throwaway object URL.
 *
 * `<a download>` is ignored for cross-origin hrefs — the browser navigates or
 * opens a tab instead — so every download goes through a fetched blob, which is
 * same-origin as far as the anchor is concerned.
 */
const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Revoking synchronously can cancel the save on some mobile browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

const fetchBlob = async (url, signal) => {
  const response = await fetch(url, { signal, mode: 'cors', credentials: 'omit' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.blob()
}

/**
 * Whether the photo host allows cross-origin reads.
 *
 * The event images are served by plain Apache with no `Access-Control-Allow-Origin`
 * header, which makes the blob path impossible: `fetch` rejects and a canvas
 * would be tainted. Rather than fail 80 times, this is probed once per session
 * against the first photo and the answer decides the whole strategy.
 *
 * @type {Promise<boolean>|null}
 */
let corsProbe = null

export const canFetchPhotos = (sampleUrl) => {
  corsProbe ??= fetchBlob(sampleUrl)
    .then(() => true)
    .catch(() => false)
  return corsProbe
}

/** Resets the memoised probe — used when a new result set arrives. */
export const resetCorsProbe = () => {
  corsProbe = null
}

/** True when the browser can hand blobs to the OS share sheet (iOS/Android). */
export const canShareFiles = () =>
  typeof navigator !== 'undefined' &&
  typeof navigator.canShare === 'function' &&
  typeof navigator.share === 'function'

/**
 * Safari refuses programmatic multi-file downloads: in a burst of anchor
 * clicks only the first is honoured and the rest are dropped without an error.
 * On iOS the share sheet is the only route that saves a whole set.
 */
export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as a Mac; the touch points give it away.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

/** iOS gets unhappy sharing very large sets; keep each sheet manageable. */
export const SHARE_BATCH_LIMIT = 20

/**
 * Saves one photo.
 *
 * @returns {Promise<'saved'|'opened'>} how it was delivered, so the caller can
 *   tell the user whether the file landed or merely opened in a tab.
 */
export async function downloadPhoto(photo, index, fullName, signal) {
  const filename = downloadName(photo, index, fullName)
  try {
    saveBlob(await fetchBlob(photo.url, signal), filename)
    return 'saved'
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    // Last resort: a tab the user can long-press / right-click to save.
    window.open(photo.url, '_blank', 'noopener')
    return 'opened'
  }
}

/**
 * Hands a set of photos to the OS share sheet so the user can "Save to Photos"
 * in one gesture. Only viable when the host allows fetching the bytes.
 *
 * @returns {Promise<'shared'|'cancelled'|'unavailable'>}
 */
export async function sharePhotos({ photos, fullName, onProgress, signal }) {
  if (!canShareFiles()) return 'unavailable'

  const files = []
  for (const [index, photo] of photos.entries()) {
    if (signal?.aborted) return 'cancelled'
    try {
      const blob = await fetchBlob(photo.url, signal)
      files.push(new File([blob], downloadName(photo, index, fullName), { type: blob.type }))
      onProgress?.({ done: files.length, total: photos.length, failed: 0 })
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled'
      return 'unavailable'
    }
  }

  if (!files.length || !navigator.canShare({ files })) return 'unavailable'

  try {
    await navigator.share({ files, title: 'My event photos' })
    return 'shared'
  } catch (error) {
    // Dismissing the sheet is a cancel. NotAllowedError means the user gesture
    // expired while the images were downloading — the caller retries that with
    // `sharePreparedFiles` from a fresh tap.
    if (error?.name === 'AbortError') return 'cancelled'
    if (error?.name === 'NotAllowedError') return 'gesture-expired'
    return 'unavailable'
  }
}

/**
 * Fetches the photos without sharing them, so the bytes are ready in advance.
 *
 * @returns {Promise<{ files: File[], failed: number, cancelled: boolean }>}
 */
export async function preparePhotoFiles({ photos, fullName, onProgress, signal }) {
  const files = []
  let failed = 0

  for (const [index, photo] of photos.entries()) {
    if (signal?.aborted) return { files, failed, cancelled: true }
    try {
      const blob = await fetchBlob(photo.url, signal)
      files.push(new File([blob], downloadName(photo, index, fullName), { type: blob.type }))
    } catch (error) {
      if (error?.name === 'AbortError') return { files, failed, cancelled: true }
      failed += 1
    }
    onProgress?.({ done: index + 1, total: photos.length, failed })
  }

  return { files, failed, cancelled: false }
}

/**
 * Opens the share sheet for files that are already in memory.
 *
 * Kept separate from fetching on purpose: `navigator.share` only works while a
 * user gesture is still active, and downloading dozens of photos first uses
 * that budget up. Calling this straight out of a tap handler is what makes the
 * sheet appear reliably on iOS.
 */
export async function sharePreparedFiles(files) {
  if (!canShareFiles() || !files.length) return 'unavailable'
  if (!navigator.canShare({ files })) return 'unavailable'

  try {
    await navigator.share({ files, title: 'My event photos' })
    return 'shared'
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled'
    return 'unavailable'
  }
}

/**
 * Downloads many photos with bounded concurrency.
 *
 * A results set can hold 80–100 images, and firing them all at once stalls
 * mobile Safari and trips per-origin connection limits, so a small pool walks
 * the queue and reports progress after each file.
 *
 * @param {object} options
 * @param {import('@/services/faceSearchService').Photo[]} options.photos
 * @param {string} options.fullName
 * @param {(progress: { done: number, total: number, failed: number }) => void} [options.onProgress]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ done: number, failed: number, cancelled: boolean }>}
 */
export async function downloadPhotos({ photos, fullName, onProgress, signal, concurrency = 3 }) {
  let cursor = 0
  let done = 0
  let failed = 0
  let cancelled = false

  const worker = async () => {
    while (cursor < photos.length) {
      if (signal?.aborted) {
        cancelled = true
        return
      }
      const index = cursor++
      try {
        const outcome = await downloadPhoto(photos[index], index, fullName, signal)
        if (outcome !== 'saved') failed += 1
      } catch (error) {
        if (error?.name === 'AbortError') {
          cancelled = true
          return
        }
        failed += 1
      }
      done += 1
      onProgress?.({ done, total: photos.length, failed })
      // A beat between saves keeps the browser's download prompt responsive.
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, photos.length) }, worker))
  return { done, failed, cancelled }
}
