import { useCallback, useEffect, useRef, useState } from 'react'
import { useEventNavigate } from '@/routes/useEventNavigate'
import toast from 'react-hot-toast'

import { BlockedDownloadSheet } from '@/components/gallery/BlockedDownloadSheet'
import { DownloadProgress } from '@/components/gallery/DownloadProgress'
import { Lightbox } from '@/components/gallery/Lightbox'
import { PhotoGrid } from '@/components/gallery/PhotoGrid'
import { SelectionBar } from '@/components/gallery/SelectionBar'
import { Button } from '@/components/ui/Button'
import { DownloadIcon, GalleryIcon } from '@/components/ui/Icons'
import { copy } from '@/config/brand'
import { SearchStatus, useSearch } from '@/store/searchContext'
import {
  canFetchPhotos,
  canShareFiles,
  downloadPhotos,
  isIOS,
  SHARE_BATCH_LIMIT,
  sharePhotos,
} from '@/utils/download'
import { downloadPhotosAsZip } from '@/utils/zip'

export default function ResultsPage() {
  const navigate = useEventNavigate()
  const { status, fullName, previewUrl, photos, emptyMessage } = useSearch()

  const [activeIndex, setActiveIndex] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(() => new Set())
  const [progress, setProgress] = useState(null)
  // Set when the photo host blocks cross-origin reads and only tabs remain.
  const [blockedPhotos, setBlockedPhotos] = useState(null)
  const abortRef = useRef(null)

  // Deep-linking straight to /results has nothing to show — send them to register.
  useEffect(() => {
    if (status !== SearchStatus.Success) navigate('/', { replace: true })
  }, [status, navigate])

  // A download in flight must not outlive the screen.
  useEffect(() => () => abortRef.current?.abort(), [])

  const exitSelect = useCallback(() => {
    setSelectMode(false)
    setSelected(new Set())
  }, [])

  const toggle = useCallback((index) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const beginSelect = useCallback((index) => {
    setSelectMode(true)
    setSelected(new Set([index]))
  }, [])

  const selectAll = () => {
    setSelected((prev) =>
      prev.size === photos.length ? new Set() : new Set(photos.map((_, index) => index)),
    )
  }

  const runDownload = async (list) => {
    if (!list.length) return

    const controller = new AbortController()
    abortRef.current = controller
    setProgress({ done: 0, total: list.length })

    const finish = () => {
      setProgress(null)
      abortRef.current = null
    }

    // The photo host may not send CORS headers, in which case the bytes can
    // never be read here — checked once so the user is told plainly instead of
    // being handed a failed download per photo.
    const fetchable = await canFetchPhotos(list[0].url)

    if (!fetchable) {
      finish()
      if (list.length === 1) {
        window.open(list[0].url, '_blank', 'noopener')
        toast('Opened in a new tab — long press the photo to save it', { icon: '💾', duration: 6000 })
        return
      }

      /*
       * The photo host serves images without an Access-Control-Allow-Origin
       * header, so their bytes cannot be read here — which rules out zipping,
       * sharing and blob downloads alike. Opening tabs is the only thing left,
       * and a burst of them is blocked as a popup, so the set is handed over a
       * few at a time with the reason stated plainly.
       */
      setBlockedPhotos(list)
      return
    }

    const toastId = list.length > 1 ? toast.loading(`Saving ${list.length} photos…`) : null
    const onProgress = (next) => setProgress({ done: next.done, total: next.total })

    /*
     * Direct downloads are the default everywhere they work — Android Chrome
     * included. The share sheet is reserved for iOS, where Safari silently
     * drops every anchor click after the first and it is the only route that
     * can save a set at all. Offering the sheet elsewhere just interrupted a
     * download that would have worked, and cancelling it saved nothing.
     */
    if (isIOS() && list.length > 1 && canShareFiles()) {
      const batches = []
      for (let i = 0; i < list.length; i += SHARE_BATCH_LIMIT) {
        batches.push(list.slice(i, i + SHARE_BATCH_LIMIT))
      }

      let sharedCount = 0
      let sheetUnavailable = false

      for (const batch of batches) {
        if (controller.signal.aborted) break

        const outcome = await sharePhotos({
          photos: batch,
          fullName,
          signal: controller.signal,
          onProgress: (next) => setProgress({ done: sharedCount + next.done, total: list.length }),
        })

        // Dismissing the sheet cancels the rest — the user asked to stop.
        if (outcome === 'cancelled') break
        if (outcome === 'unavailable') {
          sheetUnavailable = true
          break
        }
        if (outcome === 'gesture-expired') {
          // Safari dropped the gesture while the photos downloaded. The bytes
          // are wasted, so fall through to the ZIP rather than re-fetching.
          sheetUnavailable = true
          break
        }
        sharedCount += batch.length
      }

      if (!sheetUnavailable) {
        finish()
        toast.dismiss(toastId ?? undefined)
        if (sharedCount === 0) {
          toast('Nothing saved', { icon: '✋' })
        } else {
          toast.success(
            sharedCount === list.length
              ? `${sharedCount} photos ready to save`
              : `Saved ${sharedCount} of ${list.length} — tap Save again for the rest`,
          )
        }
        return
      }

      // Sheet unusable: fall through to the ZIP, which Safari does allow.
    }

    /*
     * iOS fallback: one ZIP is one download, so Safari's "only the first anchor
     * click counts" rule cannot bite. The photos land in Files rather than the
     * camera roll, which is why this sits behind the share sheet rather than
     * replacing it.
     */
    if (isIOS() && list.length > 1) {
      const zipToastId = toastId ?? toast.loading(`Preparing ${list.length} photos…`)
      const { done, failed, cancelled } = await downloadPhotosAsZip({
        photos: list,
        fullName,
        signal: controller.signal,
        onProgress,
      })
      finish()

      if (cancelled) {
        toast.dismiss(zipToastId)
        toast(`Stopped after ${done} photo${done === 1 ? '' : 's'}`, { icon: '✋' })
        return
      }

      const saved = done - failed
      toast.success(`Saved ${saved} photo${saved === 1 ? '' : 's'} as a ZIP — open it in Files`, {
        id: zipToastId,
        duration: 6000,
      })
      return
    }

    const { done, failed, cancelled } = await downloadPhotos({
      photos: list,
      fullName,
      signal: controller.signal,
      onProgress,
    })

    finish()

    if (cancelled) {
      toast.dismiss(toastId ?? undefined)
      toast(`Stopped after ${done} photo${done === 1 ? '' : 's'}`, { icon: '✋' })
      return
    }

    const saved = done - failed
    const message = failed
      ? `Saved ${saved} of ${done}. ${failed} opened in new tabs — long press to save.`
      : `Saved ${saved} photo${saved === 1 ? '' : 's'}`

    if (toastId) toast[failed ? 'error' : 'success'](message, { id: toastId })
    else toast[failed ? 'error' : 'success'](message)
  }

  const downloadSelected = async () => {
    const list = photos.filter((_, index) => selected.has(index))
    exitSelect()
    await runDownload(list)
  }

  if (status !== SearchStatus.Success) return null

  const busy = progress !== null

  return (
    <div className="flex flex-1 animate-fade-up flex-col">
      <section className="flex items-center gap-4 pt-2">
        <div className="size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-soft">
          {previewUrl && <img src={previewUrl} alt="" className="size-full object-cover" />}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-ink-900 sm:text-2xl">
            {photos.length ? copy.results.title : copy.results.empty}
          </h1>
          <p className="mt-0.5 text-sm text-ink-400">
            {fullName}
            {photos.length > 0 &&
              ` · ${photos.length} photo${photos.length === 1 ? '' : 's'} matched`}
          </p>
        </div>
      </section>

      {photos.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="md" onClick={() => runDownload(photos)} loading={busy}>
            <DownloadIcon className="size-4" />
            Download all
          </Button>
          <p className="text-xs leading-relaxed text-ink-400">
            Long press a photo to select just the ones you want.
          </p>
        </div>
      )}

      <section className="mt-6 flex-1 pb-24">
        {photos.length ? (
          <PhotoGrid
            photos={photos}
            selectMode={selectMode}
            selected={selected}
            onOpen={setActiveIndex}
            onLongPress={beginSelect}
            onToggle={toggle}
          />
        ) : (
          <div className="surface flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-cream-200 text-ink-400">
              <GalleryIcon className="size-8" />
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-ink-500">
              {emptyMessage ? `${emptyMessage}. ${copy.results.emptyHint}` : copy.results.emptyHint}
            </p>
          </div>
        )}
      </section>

      {!selectMode && (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" size="md" onClick={() => navigate('/')}>
            Search again
          </Button>
        </div>
      )}

      {activeIndex !== null && (
        <Lightbox
          photos={photos}
          index={activeIndex}
          fullName={fullName}
          onIndexChange={setActiveIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}

      {selectMode && (
        <SelectionBar
          count={selected.size}
          total={photos.length}
          busy={busy}
          onSelectAll={selectAll}
          onClear={exitSelect}
          onDownload={downloadSelected}
        />
      )}

      {blockedPhotos && (
        <BlockedDownloadSheet photos={blockedPhotos} onClose={() => setBlockedPhotos(null)} />
      )}

      {busy && (
        <DownloadProgress
          done={progress.done}
          total={progress.total}
          onCancel={() => abortRef.current?.abort()}
        />
      )}
    </div>
  )
}
