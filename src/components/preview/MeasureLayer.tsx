import type { Ref } from 'react'
import type { Block } from '../../lib/blocks'
import { BlockRenderer } from './blocks/BlockRenderer'

/**
 * Off-screen twin of the page content, used to measure every block before
 * deciding where the page breaks fall.
 *
 * Three constraints keep the numbers honest:
 *  - it must live outside any `transform: scale()`, because getBoundingClientRect
 *    reports post-transform sizes;
 *  - it must carry the same width and typography utilities as a real page, or
 *    text would wrap differently here than it does on paper;
 *  - it must lay out identically in screen and print media. Hiding it for print
 *    is tempting and catastrophic: print styles apply to the live document, the
 *    ResizeObserver fires, every block measures 0, the paginator decides it all
 *    fits on one page, and `overflow-hidden` silently eats the rest of the CV.
 *
 * So the layer is never hidden, only made to occupy nothing: a 0x0 clipping box
 * contributes no height to the document (which would otherwise print as blank
 * pages) while its fixed-width child still lays out and measures normally --
 * clipping is a paint concern, not a layout one.
 */
export function MeasureLayer({ blocks, ref }: { blocks: Block[]; ref: Ref<HTMLDivElement> }) {
  return (
    <div className="pointer-events-none absolute top-0 left-0 size-0 overflow-hidden" aria-hidden>
      <div ref={ref} className="invisible box-border w-page-w px-page-x font-cv text-black">
        {blocks.map((block) => (
          <div key={block.id} data-block-id={block.id}>
            <BlockRenderer block={block} />
          </div>
        ))}

        {/* Rulers: page box and, nested inside its padding, the usable content
            height. Measured rather than computed so no mm-to-px constant is ever
            hardcoded. */}
        <div data-page-ruler className="box-border h-page-h w-page-w py-page-y">
          <div data-content-ruler className="h-full" />
        </div>
      </div>
    </div>
  )
}
