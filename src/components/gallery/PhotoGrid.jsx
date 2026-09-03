import { useState } from 'react'

import { cn } from '@/utils/cn'

function PhotoTile({ photo, index, onOpen }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative aspect-3/4 overflow-hidden rounded-2xl bg-cream-200 ring-1 ring-cream-300 transition duration-200 hover:ring-brand-300 focus-visible:ring-brand-600"
    >
      <img
        src={photo.thumbnailUrl}
        alt={`Event photo ${index + 1}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'size-full object-cover transition duration-500 group-hover:scale-[1.04]',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
      {!loaded && <div className="absolute inset-0 animate-pulse bg-cream-300/70" />}
      <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink-900/35 to-transparent opacity-0 transition group-hover:opacity-100" />
    </button>
  )
}

export function PhotoGrid({ photos, onOpen }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {photos.map((photo, index) => (
        <PhotoTile key={photo.id} photo={photo} index={index} onOpen={onOpen} />
      ))}
    </div>
  )
}
