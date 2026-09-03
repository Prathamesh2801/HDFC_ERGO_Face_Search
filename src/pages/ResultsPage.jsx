import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Lightbox } from '@/components/gallery/Lightbox'
import { PhotoGrid } from '@/components/gallery/PhotoGrid'
import { Button } from '@/components/ui/Button'
import { GalleryIcon } from '@/components/ui/Icons'
import { copy } from '@/config/brand'
import { SearchStatus, useSearch } from '@/store/searchContext'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { status, fullName, previewUrl, photos } = useSearch()
  const [activeIndex, setActiveIndex] = useState(null)

  // Deep-linking straight to /results has nothing to show — send them to register.
  useEffect(() => {
    if (status !== SearchStatus.Success) navigate('/', { replace: true })
  }, [status, navigate])

  if (status !== SearchStatus.Success) return null

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
            {photos.length > 0 && ` · ${photos.length} photo${photos.length === 1 ? '' : 's'} matched`}
          </p>
        </div>
      </section>

      <section className="mt-6 flex-1">
        {photos.length ? (
          <PhotoGrid photos={photos} onOpen={setActiveIndex} />
        ) : (
          <div className="surface flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-cream-200 text-ink-400">
              <GalleryIcon className="size-8" />
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-ink-500">{copy.results.emptyHint}</p>
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button variant="secondary" size="md" onClick={() => navigate('/')}>
          Register another face
        </Button>
      </div>

      {activeIndex !== null && (
        <Lightbox
          photos={photos}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </div>
  )
}
