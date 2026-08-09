import { useEffect, useMemo, useRef, useState } from 'react'
import type { ZoomMode } from '../store/useCvStore'

/**
 * Scales the A4 sheet to fit the width of the preview column.
 *
 * Never scales above 1: a page blown up past its real size just looks blurry
 * and stops matching what comes out of the printer.
 */
export function useFitScale(pageWidth: number, zoom: ZoomMode) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // contentRect excludes padding, which is exactly the room a page may use.
    const observer = new ResizeObserver(([entry]) => setAvailable(entry!.contentRect.width))
    observer.observe(el)
    setAvailable(el.clientWidth)

    return () => observer.disconnect()
  }, [])

  const scale = useMemo(() => {
    if (typeof zoom === 'number') return zoom
    if (pageWidth <= 0 || available <= 0) return 1
    return Math.min(1, available / pageWidth)
  }, [zoom, pageWidth, available])

  return { containerRef, scale }
}
