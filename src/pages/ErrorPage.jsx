import { useNavigate, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { brand } from '@/config/brand'

/**
 * Router error boundary. Distinct from the 404 page: reaching here means
 * something threw, so it offers a real recovery instead of "page not found".
 */
export default function ErrorPage() {
  const navigate = useNavigate()
  const error = useRouteError()

  if (import.meta.env.DEV) console.error('Route error:', error)

  return (
    <div className="grid min-h-dvh place-items-center bg-cream-100 px-6 text-center">
      <div className="max-w-sm space-y-5">
        <img
          src={brand.logos.event.src}
          alt={brand.logos.event.alt}
          className="mx-auto h-20 w-auto object-contain"
        />
        <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
        <p className="text-sm leading-relaxed text-ink-500">
          We could not complete that step. Your event link is still valid — please try again.
        </p>

        {import.meta.env.DEV && error?.message && (
          <pre className="overflow-x-auto rounded-2xl bg-cream-200 p-3 text-left text-xs text-ink-600">
            {error.message}
          </pre>
        )}

        <Button
          size="md"
          onClick={() => {
            // Keep the ?event= query — losing it is what sends people to a dead end.
            navigate('/', { replace: true })
          }}
        >
          Back to registration
        </Button>
      </div>
    </div>
  )
}
