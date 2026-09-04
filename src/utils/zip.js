import { downloadZip } from 'client-zip'

import { downloadName } from '@/utils/file'

/**
 * Packs the photos into a single ZIP and saves it.
 *
 * This exists for iOS: Safari honours only the first anchor click in a burst,
 * so a set can never be saved as separate downloads. One archive is one
 * download, which Safari always allows.
 *
 * `client-zip` writes entries as they stream in rather than buffering the whole
 * archive, which matters here — 80 event photos is comfortably over 200MB, and
 * holding that in memory would crash a mobile tab. Nothing is compressed
 * (JPEGs are already compressed), so the ZIP is a container, not a shrink.
 *
 * @param {object} options
 * @param {import('@/services/faceSearchService').Photo[]} options.photos
 * @param {string} options.fullName
 * @param {(progress: { done: number, total: number, failed: number }) => void} [options.onProgress]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ done: number, failed: number, cancelled: boolean }>}
 */
export async function downloadPhotosAsZip({ photos, fullName, onProgress, signal }) {
  let done = 0
  let failed = 0
  let cancelled = false

  /*
   * Fetching lazily inside the generator keeps one photo in memory at a time:
   * client-zip pulls the next entry only once the previous one is written out.
   */
  async function* entries() {
    for (const [index, photo] of photos.entries()) {
      if (signal?.aborted) {
        cancelled = true
        return
      }
      try {
        const response = await fetch(photo.url, { signal, mode: 'cors', credentials: 'omit' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        yield {
          name: downloadName(photo, index, fullName),
          lastModified: new Date(),
          input: response,
        }
        done += 1
      } catch (error) {
        if (error?.name === 'AbortError') {
          cancelled = true
          return
        }
        // One unreachable photo must not sink the whole archive.
        failed += 1
        done += 1
      }
      onProgress?.({ done, total: photos.length, failed })
    }
  }

  const slug = (fullName || 'event-photos').trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

  /*
   * The archive is assembled into a Blob because iOS Safari has no
   * `showSaveFilePicker`, so there is nowhere to stream it to. A Blob is not a
   * JS-heap buffer — the browser may back it with disk — which is why this
   * survives a 200MB+ set where an in-memory array would not. Entries are still
   * fetched lazily above, so only one photo is in flight at a time.
   */
  const blob = await downloadZip(entries()).blob()

  if (cancelled) return { done, failed, cancelled: true }

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${slug || 'event-photos'}-photos.zip`
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 20000)

  return { done, failed, cancelled: false }
}
