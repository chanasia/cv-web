import { gapBefore, keepsWithNext, type Block } from './blocks'

export interface Page {
  blocks: Block[]
  /** True when a single block is taller than the page and had to overflow. */
  overflowing: boolean
}

export type HeightMap = Record<string, number>

/**
 * Packs measured blocks into fixed-height pages.
 *
 * Two passes: a greedy fill, then a fixup that pulls orphaned headings onto the
 * page they introduce. Heights are in CSS pixels and come from measuring the
 * real DOM, so the result matches what the printer produces.
 *
 * A block with no recorded height is treated as zero rather than skipped, so a
 * first render before measurement completes still yields a sane single page.
 */
export function paginate(blocks: Block[], heights: HeightMap, contentHeight: number): Page[] {
  if (blocks.length === 0) return [{ blocks: [], overflowing: false }]
  // Before the first measurement pass lands there is nothing to divide by.
  if (contentHeight <= 0) return [{ blocks, overflowing: false }]

  const pages: Block[][] = [[]]
  let used = 0

  for (const block of blocks) {
    const current = pages[pages.length - 1]!
    const prev = current.length > 0 ? current[current.length - 1]!.kind : null
    const gap = prev === null ? 0 : gapBefore(prev, block.kind)
    const height = heights[block.id] ?? 0

    if (current.length > 0 && used + gap + height > contentHeight) {
      pages.push([block])
      used = height
    } else {
      current.push(block)
      used += gap + height
    }
  }

  return fixOrphanHeadings(pages, heights, contentHeight)
}

/**
 * Moves a trailing run of keep-with-next blocks to the following page, so a
 * section title or job title never sits alone at the foot of a page while the
 * content it introduces starts the next one.
 */
function fixOrphanHeadings(pages: Block[][], heights: HeightMap, contentHeight: number): Page[] {
  for (let i = 0; i < pages.length - 1; i++) {
    const page = pages[i]!

    // How many blocks at the end of this page are dangling headings?
    let runStart = page.length
    while (runStart > 0 && keepsWithNext(page[runStart - 1]!.kind)) runStart--

    if (runStart === page.length) continue
    // Never empty a page: that would loop forever and lose the content anyway.
    if (runStart === 0) continue

    const moved = page.splice(runStart)
    const next = pages[i + 1]!
    next.unshift(...moved)

    // The receiving page may now overflow; push its own tail forward.
    rebalanceForward(pages, i + 1, heights, contentHeight)
  }

  return pages.map((blocks) => ({
    blocks,
    overflowing: blocks.length === 1 && (heights[blocks[0]!.id] ?? 0) > contentHeight,
  }))
}

/** Spills whatever no longer fits on `index` onto the page after it. */
function rebalanceForward(
  pages: Block[][],
  index: number,
  heights: HeightMap,
  contentHeight: number,
): void {
  const page = pages[index]!
  let used = 0
  let cut = page.length

  for (let i = 0; i < page.length; i++) {
    const block = page[i]!
    const gap = i === 0 ? 0 : gapBefore(page[i - 1]!.kind, block.kind)
    const height = heights[block.id] ?? 0

    if (i > 0 && used + gap + height > contentHeight) {
      cut = i
      break
    }
    used += gap + height
  }

  if (cut >= page.length) return

  const spilled = page.splice(cut)
  if (index + 1 < pages.length) {
    pages[index + 1]!.unshift(...spilled)
    rebalanceForward(pages, index + 1, heights, contentHeight)
  } else {
    pages.push(spilled)
  }
}
