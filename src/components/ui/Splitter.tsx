import { useCallback, useEffect, useRef } from 'react'

const MIN_WIDTH = 340
const MAX_WIDTH = 900

/**
 * Drag handle between the preview and the editor.
 *
 * Width is reported as distance from the right edge of the window, so the
 * editor keeps its size when the window is resized.
 */
export function Splitter({ onResize }: { onResize: (width: number) => void }) {
  const dragging = useRef(false)

  const stop = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return
      const width = window.innerWidth - event.clientX
      onResize(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)))
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
    }
  }, [onResize, stop])

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize editor"
      onPointerDown={() => {
        dragging.current = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
      }}
      // Pointless on a touch screen, where only one pane is visible anyway.
      className="hidden w-1 shrink-0 cursor-col-resize bg-neutral-300 transition-colors lg:block hover:bg-blue-500 print:hidden dark:bg-neutral-700 dark:hover:bg-blue-500"
    />
  )
}
