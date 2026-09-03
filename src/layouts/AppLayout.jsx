import { Outlet, useMatches } from 'react-router-dom'

import { BrandHeader } from '@/layouts/BrandHeader'
import { brand } from '@/config/brand'
import { cn } from '@/utils/cn'

/**
 * The event "stage": a phone-width parchment surface that grows into a
 * comfortable tablet/desktop panel. Routes opt into the wider variant with
 * `handle: { wide: true }`.
 */
export function AppLayout() {
  const matches = useMatches()
  const wide = matches.some((match) => match.handle?.wide)

  return (
    <div className="relative min-h-dvh bg-cream-200">
      {/* Ambient wash behind the stage on large screens */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-cream-100),var(--color-cream-300))]"
      />

      <div
        className={cn(
          'relative mx-auto flex min-h-dvh w-full flex-col bg-cream-100 transition-[max-width] duration-300',
          'lg:my-0 lg:shadow-[0_0_80px_-30px_rgb(20_18_15/0.35)]',
          wide ? 'max-w-6xl' : 'max-w-2xl',
        )}
      >
        {/*
          Event artwork sits in a bottom strip: the image is drawn at full stage
          width and anchored to the bottom, so the mosaic and flag are never
          cropped sideways — only the empty parchment above them is clipped.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[26vh] max-h-72 min-h-40 overflow-hidden"
        >
          <div
            className="absolute inset-x-0 bottom-0 h-full bg-[length:100%_auto] bg-bottom bg-no-repeat"
            style={{ backgroundImage: `url(${brand.backgroundUrl})` }}
          />
          <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-cream-100 to-transparent" />
        </div>

        <div className="relative flex min-h-dvh flex-col">
          <BrandHeader />
          <main className="flex flex-1 flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
