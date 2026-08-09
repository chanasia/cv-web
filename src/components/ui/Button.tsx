import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'default' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
  default:
    'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
  ghost:
    'text-neutral-500 hover:bg-black/5 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-100',
  danger:
    'text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400',
}

export function Button({
  variant = 'default',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const ICON_BASE =
  'inline-flex items-center justify-center rounded p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-30'

export function IconButton({
  variant = 'ghost',
  label,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`${ICON_BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/** An icon that navigates rather than acts, styled to match IconButton. */
export function IconLink({
  variant = 'ghost',
  label,
  className = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant
  label: string
  children: ReactNode
}) {
  return (
    <a
      aria-label={label}
      title={label}
      target="_blank"
      // noopener also implies noreferrer in modern browsers, but both are named
      // so the intent survives a reader who does not know that.
      rel="noopener noreferrer"
      className={`${ICON_BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  )
}
