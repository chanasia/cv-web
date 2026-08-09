import { AlertTriangle } from 'lucide-react'
import { useFitScale } from '../../hooks/useFitScale'
import type { Page } from '../../lib/paginate'
import { useCvStore, type ZoomMode } from '../../store/useCvStore'
import { A4Page } from './A4Page'

const GAP_BETWEEN_PAGES = 24

const ZOOM_OPTIONS: { label: string; value: ZoomMode }[] = [
  { label: 'Fit', value: 'fit' },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
]

export function PreviewPane({
  pages,
  pageWidth,
  pageHeight,
  className = '',
}: {
  pages: Page[]
  pageWidth: number
  pageHeight: number
  className?: string
}) {
  const zoom = useCvStore((s) => s.ui.zoom)
  const setZoom = useCvStore((s) => s.setZoom)
  const { containerRef, scale } = useFitScale(pageWidth, zoom)

  return (
    <div
      className={`min-w-0 flex-1 flex-col bg-neutral-300 print:block print:overflow-visible print:bg-white dark:bg-neutral-900 ${className}`}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-black/10 bg-white/60 px-4 py-2 text-xs text-neutral-600 print:hidden dark:border-white/10 dark:bg-neutral-800/60 dark:text-neutral-300">
        {/* Below lg the tab bar already shows this. */}
        <span className="hidden font-medium lg:inline">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'}
        </span>
        <span className="ml-auto flex items-center gap-1">
          {ZOOM_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setZoom(option.value)}
              className={`rounded px-2 py-1 transition ${
                zoom === option.value
                  ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </span>
      </div>

      <div
        ref={containerRef}
        data-preview-scroll
        className="min-h-0 flex-1 overflow-auto p-6 print:overflow-visible print:p-0"
      >
        {pages.map((page, index) => (
          <div
            key={index}
            className="relative mx-auto print:m-0! print:h-auto! print:w-auto!"
            style={{
              width: pageWidth * scale || undefined,
              height: pageHeight * scale || undefined,
              marginBottom: index === pages.length - 1 ? 0 : GAP_BETWEEN_PAGES,
            }}
          >
            <div
              className="origin-top-left print:transform-none!"
              style={{ transform: `scale(${scale})` }}
            >
              <A4Page blocks={page.blocks} />
            </div>

            {page.overflowing ? (
              <div className="absolute -top-2 left-0 flex items-center gap-1 rounded bg-amber-500 px-2 py-0.5 text-[11px] font-medium text-white shadow print:hidden">
                <AlertTriangle className="size-3" />
                Content on this page is taller than one sheet
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
