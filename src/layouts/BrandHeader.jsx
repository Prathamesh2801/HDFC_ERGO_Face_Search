import { brand } from '@/config/brand'

export function BrandHeader() {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-2 sm:px-8">
      <img
        src={brand.logos.event.src}
        alt={brand.logos.event.alt}
        className="h-16 w-auto object-contain sm:h-20"
      />
      <img
        src={brand.logos.company.src}
        alt={brand.logos.company.alt}
        className="h-10 w-auto shrink-0 object-contain sm:h-12"
      />
    </header>
  )
}
