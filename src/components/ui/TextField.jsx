import { useId } from 'react'

import { cn } from '@/utils/cn'

export function TextField({ label, error, hint, className, id, ...props }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={fieldId} className="block text-base font-semibold text-ink-900">
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full rounded-field bg-white px-4 py-3.5 text-base text-ink-900 placeholder:text-ink-400/70',
          'ring-2 transition-shadow duration-200 outline-none',
          error
            ? 'ring-brand-700 focus:ring-brand-700'
            : 'ring-brand-500/80 focus:ring-brand-600 focus:shadow-soft',
        )}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm font-medium text-brand-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
