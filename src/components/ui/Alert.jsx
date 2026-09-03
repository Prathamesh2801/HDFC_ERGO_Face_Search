import { AlertIcon } from '@/components/ui/Icons'
import { cn } from '@/utils/cn'

export function Alert({ children, className, tone = 'error' }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium',
        tone === 'error' && 'bg-brand-50 text-brand-800 ring-1 ring-brand-200',
        tone === 'info' && 'bg-cream-200 text-ink-600 ring-1 ring-cream-300',
        className,
      )}
    >
      <AlertIcon className="mt-0.5 size-4.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
