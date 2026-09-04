import { memo, useEffect, useRef, useState } from 'react'

import { CheckIcon, RetryIcon } from '@/components/ui/Icons'
import { cn } from '@/utils/cn'

const LONG_PRESS_MS = 450

/*
 * A 100–200 photo result is mounted in slices rather than all at once.
 *
 * Two competing costs: mounting too many <img> at once stalls the frame, while
 * mounting too late leaves the reader staring at placeholders. Small batches
 * keep each step cheap, and a generous lookahead starts them well before the
 * tiles are on screen, so the images are decoded by the time they arrive.
 */
const PAGE_SIZE = 8
/** Roughly two screens of runway, so a fast scroll still lands on real photos. */
const LOOKAHEAD = '1200px'

/**
 * Images already requested but not yet mounted.
 *
 * The browser starts fetching and decoding as soon as an Image() has a src, so
 * warming the next batches off-screen means a tile usually paints immediately
 * on mount instead of showing a placeholder first.
 */
const PREFETCH_AHEAD = 24

const MOVE_TOLERANCE = 10

function PhotoTile({ photo, index, selectMode, selected, onOpen, onLongPress, onToggle }) {
  const [status, setStatus] = useState('loading')
  const timerRef = useRef(null)
  const firedRef = useRef(false)
  const originRef = useRef(null)

  const cancelPress = () => {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }

  // A long press must not also open the lightbox on release.
  const startPress = (event) => {
    // Ignore secondary buttons and multi-touch (pinch-zoom on the grid).
    if (event.button != null && event.button !== 0) return
    firedRef.current = false
    originRef.current = { x: event.clientX, y: event.clientY }

    cancelPress()
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      timerRef.current = null
      onLongPress(index)
      // Confirms the switch into selection mode on devices without hover.
      navigator.vibrate?.(15)
    }, LONG_PRESS_MS)
  }

  // Scrolling the gallery must not be read as a long press.
  const handleMove = (event) => {
    if (!timerRef.current || !originRef.current) return
    const dx = Math.abs(event.clientX - originRef.current.x)
    const dy = Math.abs(event.clientY - originRef.current.y)
    if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) cancelPress()
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleClick = (event) => {
    // Safari still delivers a click after a long press; swallow it here rather
    // than relying on the flag surviving into the next tick.
    if (firedRef.current) {
      firedRef.current = false
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (selectMode) onToggle(index)
    else onOpen(index)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startPress}
      onPointerMove={handleMove}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      // Suppresses the iOS "save/copy image" callout during a long press.
      onContextMenu={(event) => event.preventDefault()}
      aria-pressed={selectMode ? selected : undefined}
      aria-label={selectMode ? `Select photo ${index + 1}` : `Open photo ${index + 1}`}
      className={cn(
        'group relative aspect-3/4 touch-manipulation overflow-hidden rounded-2xl bg-cream-200 select-none',
        '[-webkit-touch-callout:none]',
        'ring-1 ring-cream-300 transition duration-200 hover:ring-brand-300 focus-visible:ring-brand-600',
        selected && 'ring-2 ring-brand-600',
      )}
    >
      {status !== 'error' ? (
        <img
          src={photo.thumbnailUrl}
          alt={`Event photo ${index + 1}`}
          loading="lazy"
          decoding="async"
          /*
           * The API returns no separate thumbnail, so each tile decodes a
           * full-size JPEG. Low priority keeps those requests behind the first
           * screenful and off the critical path.
           */
          fetchPriority={index < PAGE_SIZE ? 'auto' : 'low'}
          draggable={false}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'size-full object-cover transition duration-500',
            !selectMode && 'group-hover:scale-[1.04]',
            selected && 'scale-95 rounded-xl',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
        />
      ) : (
        <span className="grid size-full place-items-center gap-1 p-2 text-center text-ink-400">
          <RetryIcon className="mx-auto size-5" />
          <span className="text-[11px] leading-tight">Preview unavailable</span>
        </span>
      )}

      {status === 'loading' && <div className="absolute inset-0 animate-pulse bg-cream-300/70" />}

      <span
        className={cn(
          'pointer-events-none absolute inset-0 bg-linear-to-t from-ink-900/35 to-transparent transition',
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      />

      {selectMode && (
        <span
          className={cn(
            'absolute top-2 right-2 grid size-6 place-items-center rounded-full ring-2 transition',
            selected
              ? 'bg-brand-600 text-white ring-white'
              : 'bg-ink-900/25 text-transparent ring-white/80 backdrop-blur-sm',
          )}
        >
          <CheckIcon className="size-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

const MemoTile = memo(PhotoTile)

/** Grey placeholder tiles occupying the space the next batch will fill. */
function SkeletonTiles({ count }) {
  return Array.from({ length: count }, (_, i) => (
    <div
      key={`skeleton-${i}`}
      aria-hidden
      className="aspect-3/4 animate-pulse rounded-2xl bg-cream-200 ring-1 ring-cream-300"
      style={{ animationDelay: `${(i % 4) * 90}ms` }}
    />
  ))
}

export function PhotoGrid({ photos, selectMode, selected, onOpen, onLongPress, onToggle }) {
  const [visible, setVisible] = useState(() => Math.min(PAGE_SIZE, photos.length))
  const [renderedFor, setRenderedFor] = useState(photos)
  const sentinelRef = useRef(null)

  // A new result set collapses back to the first slice, during render rather
  // than in an effect so the stale slice is never painted.
  if (renderedFor !== photos) {
    setRenderedFor(photos)
    setVisible(Math.min(PAGE_SIZE, photos.length))
  }

  const remaining = photos.length - visible

  // Reveal the next slice as the sentinel nears the viewport, so the first
  // paint stays fast no matter how many photos matched.
  useEffect(() => {
    const node = sentinelRef.current
    if (!node || remaining <= 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Mount immediately: the sentinel sits a screen or two below the fold,
        // so there is runway to decode before these tiles are actually seen.
        // Delaying here is what left fast scrolling on blank placeholders.
        if (entry.isIntersecting) {
          setVisible((current) => Math.min(current + PAGE_SIZE, photos.length))
        }
      },
      { rootMargin: LOOKAHEAD },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [remaining, photos.length])

  // Warm the images just beyond what is mounted so they are decoded on arrival.
  useEffect(() => {
    if (remaining <= 0) return
    const warm = photos.slice(visible, visible + PREFETCH_AHEAD).map((photo) => {
      const image = new Image()
      image.decoding = 'async'
      image.fetchPriority = 'low'
      image.src = photo.thumbnailUrl
      return image
    })
    // Dropping the src lets the browser abandon anything still in flight.
    return () => warm.forEach((image) => { image.src = '' })
  }, [visible, remaining, photos])

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {photos.slice(0, visible).map((photo, index) => (
          <MemoTile
            key={photo.id}
            photo={photo}
            index={index}
            selectMode={selectMode}
            selected={selected.has(index)}
            onOpen={onOpen}
            onLongPress={onLongPress}
            onToggle={onToggle}
          />
        ))}

        {/* Placeholders stand in for the next batch so the grid keeps its
            shape and the scrollbar does not jump as photos arrive. */}
        {remaining > 0 && <SkeletonTiles count={Math.min(PAGE_SIZE, remaining)} />}
      </div>

      {remaining > 0 && (
        <div
          ref={sentinelRef}
          role="status"
          aria-live="polite"
          className="grid place-items-center py-8 text-sm text-ink-400"
        >
          <span className="size-5 animate-spin rounded-full border-2 border-cream-400 border-t-brand-600" />
          <span className="mt-2">
            Loading {Math.min(PAGE_SIZE, remaining)} more · {visible} of {photos.length}
          </span>
        </div>
      )}
    </>
  )
}
