import type { ButtonHTMLAttributes, ReactNode } from 'react'

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
      className={`inline-flex items-center justify-center rounded p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-30 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
