import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Block } from '../lib/blocks'
import { paginate, type HeightMap, type Page } from '../lib/paginate'

interface Measurements {
  heights: HeightMap
  contentHeight: number
  pageWidth: number
  pageHeight: number
}

const EMPTY: Measurements = { heights: {}, contentHeight: 0, pageWidth: 0, pageHeight: 0 }

/** Sub-pixel differences are noise from text rendering, not real layout change. */
const EPSILON = 0.5

function read(root: HTMLElement): Measurements {
  const heights: HeightMap = {}
  for (const el of root.querySelectorAll<HTMLElement>('[data-block-id]')) {
    heights[el.dataset.blockId!] = el.getBoundingClientRect().height
  }

  const pageRuler = root.querySelector<HTMLElement>('[data-page-ruler]')
  const contentRuler = root.querySelector<HTMLElement>('[data-content-ruler]')
  const pageBox = pageRuler?.getBoundingClientRect()

  return {
    heights,
    contentHeight: contentRuler?.getBoundingClientRect().height ?? 0,
    pageWidth: pageBox?.width ?? 0,
    pageHeight: pageBox?.height ?? 0,
  }
}

function unchanged(a: Measurements, b: Measurements): boolean {
  if (
    Math.abs(a.contentHeight - b.contentHeight) > EPSILON ||
    Math.abs(a.pageWidth - b.pageWidth) > EPSILON ||
    Math.abs(a.pageHeight - b.pageHeight) > EPSILON
  ) {
    return false
  }

  const keys = Object.keys(b.heights)
  if (Object.keys(a.heights).length !== keys.length) return false
  return keys.every((k) => {
    const prev = a.heights[k]
    return prev !== undefined && Math.abs(prev - b.heights[k]!) <= EPSILON
  })
}

/**
 * Measures every block off-screen and packs them into pages.
 *
 * Measurement runs after each render and re-runs when fonts finish loading --
 * heights taken against a fallback font are wrong, and text is the only thing
 * on the page. The equality check is what stops measure-setState-render from
 * looping forever.
 */
export function usePagination(blocks: Block[]): {
  measureRef: React.RefObject<HTMLDivElement | null>
  pages: Page[]
  pageWidth: number
  pageHeight: number
} {
  const measureRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState<Measurements>(EMPTY)

  const sync = useCallback(() => {
    const root = measureRef.current
    if (!root) return
    const next = read(root)
    setMeasured((prev) => (unchanged(prev, next) ? prev : next))
  }, [])

  useLayoutEffect(sync)

  useEffect(() => {
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    }

    let live = true
    document.fonts.ready.then(() => {
      if (live) schedule()
    })

    const observer = new ResizeObserver(schedule)
    if (measureRef.current) observer.observe(measureRef.current)

    return () => {
      live = false
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [sync])

  const pages = useMemo(
    () => paginate(blocks, measured.heights, measured.contentHeight),
    [blocks, measured],
  )

  return { measureRef, pages, pageWidth: measured.pageWidth, pageHeight: measured.pageHeight }
}
