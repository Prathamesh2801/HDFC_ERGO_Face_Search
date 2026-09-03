import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { copy } from '@/config/brand'
import { SearchStatus, useSearch } from '@/store/searchContext'

export default function SearchingPage() {
  const navigate = useNavigate()
  const { status, fullName, previewUrl, error } = useSearch()

  useEffect(() => {
    if (status === SearchStatus.Idle) navigate('/', { replace: true })
    if (status === SearchStatus.Success) navigate('/results', { replace: true })
  }, [status, navigate])

  const failed = status === SearchStatus.Error

  return (
    <div className="flex flex-1 animate-fade-up flex-col items-center justify-center py-12 text-center">
      <div className="relative grid size-40 place-items-center">
        {!failed && (
          <>
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/30" />
            <span
              className="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/20"
              style={{ animationDelay: '0.6s' }}
            />
          </>
        )}
        <div className="relative size-32 overflow-hidden rounded-full ring-4 ring-white shadow-card">
          {previewUrl ? (
            <img src={previewUrl} alt="Your selfie" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-cream-300" />
          )}
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-ink-900 sm:text-3xl">
        {failed ? 'We hit a snag' : copy.searching.title}
      </h1>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-ink-500">
        {failed
          ? 'Your photos could not be fetched just now.'
          : `${fullName ? `${fullName}, ` : ''}${copy.searching.subtitle}`}
      </p>

      {failed && (
        <div className="mt-6 w-full max-w-sm space-y-4">
          <Alert>{error}</Alert>
          <Button fullWidth onClick={() => navigate('/', { replace: true })}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
