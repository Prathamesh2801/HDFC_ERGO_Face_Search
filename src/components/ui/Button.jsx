import { cn } from '@/utils/cn'

const variants = {
  primary:
    'bg-brand-600 text-white shadow-cta hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 disabled:shadow-none',
  secondary:
    'bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50 active:bg-brand-100 disabled:text-brand-300',
  ghost: 'text-ink-500 hover:bg-cream-200/80 active:bg-cream-300/80',
}

const sizes = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-base',
}

export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <Tag
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide',
        'transition-all duration-200 ease-out select-none',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={Tag === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </Tag>
  )
}
