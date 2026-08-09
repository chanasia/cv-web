import { useLayoutEffect, useRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

/**
 * Controls are always full-width; to make one narrower, wrap it in a sized box
 * rather than passing a `w-*` class. A caller's `w-24` and this `w-full` set the
 * same property, so which one wins depends on Tailwind's stylesheet ordering,
 * not on the order they appear in the className -- a silent, confusing bug.
 */
const CONTROL =
  'w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500'

export function Field({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-[11px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          {label}
        </span>
      ) : null}
      {children}
    </label>
  )
}

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={`${CONTROL} ${className}`} {...props} />
}

/**
 * Textarea that grows to fit its content, so long bullets stay fully visible
 * while editing instead of scrolling inside a fixed box.
 */
export function AutoGrowTextArea({
  className = '',
  value,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      className={`${CONTROL} resize-none overflow-hidden ${className}`}
      {...props}
    />
  )
}
