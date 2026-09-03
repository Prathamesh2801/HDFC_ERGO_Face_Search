import { useNavigate, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { brand } from '@/config/brand'

/** Serves both the 404 route and the router-level error boundary. */
export default function NotFoundPage() {
  const navigate = useNavigate()
  const error = useRouteError()

  return (
    <div className="grid min-h-dvh place-items-center bg-cream-100 px-6 text-center">
      <div className="max-w-sm space-y-5">
        <img
          src={brand.logos.event.src}
          alt={brand.logos.event.alt}
          className="mx-auto h-20 w-auto object-contain"
        />
        <h1 className="text-2xl font-bold text-ink-900">
          {error ? 'Something went wrong' : 'Page not found'}
        </h1>
        <p className="text-sm leading-relaxed text-ink-500">
          {error?.message ?? 'The link you followed does not exist. Head back to registration.'}
        </p>
        <Button size="md" onClick={() => navigate('/')}>
          Back to registration
        </Button>
      </div>
    </div>
  )
}
