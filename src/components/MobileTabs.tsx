import { Printer } from 'lucide-react'
import { IconButton } from './ui/Button'

export type Pane = 'preview' | 'edit'

/**
 * Narrow screens cannot show the sheet and the form at once, so they show one
 * at a time and switch here. Hidden from `lg` up, where the split is wide
 * enough to be readable, and hidden from print entirely.
 */
export function MobileTabs({
  pane,
  onChange,
  pageCount,
}: {
  pane: Pane
  onChange: (pane: Pane) => void
  pageCount: number
}) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-3 py-2 lg:hidden print:hidden dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex gap-1 rounded-md bg-neutral-100 p-0.5 dark:bg-neutral-800">
        {(['preview', 'edit'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition ${
              pane === value
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
        {pageCount} {pageCount === 1 ? 'page' : 'pages'}
      </span>

      {/* Printing is the point of the preview, so it stays reachable without
          switching to the form first. */}
      <IconButton label="Print" onClick={() => window.print()}>
        <Printer className="size-4" />
      </IconButton>
    </div>
  )
}
