import { gapBefore, type Block } from '../../lib/blocks'
import { BlockRenderer } from './blocks/BlockRenderer'

/**
 * One physical sheet. Exactly 210x297mm with `@page { margin: 0 }`, so the
 * printed result is the preview at scale 1 -- nothing is re-laid out for print.
 */
export function A4Page({ blocks }: { blocks: Block[] }) {
  return (
    <div
      data-a4-page
      className="box-border h-page-h w-page-w overflow-hidden bg-white px-page-x py-page-y font-cv text-black shadow-lg shadow-black/20 print:m-0 print:shadow-none print:break-after-page last:print:break-after-auto"
    >
      {blocks.map((block, i) => (
        <div
          key={block.id}
          style={{ marginTop: i === 0 ? undefined : gapBefore(blocks[i - 1]!.kind, block.kind) }}
        >
          <BlockRenderer block={block} />
        </div>
      ))}
    </div>
  )
}
