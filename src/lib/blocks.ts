import type { Contact, CvData, EducationEntry } from '../types/cv'

/**
 * A Block is the smallest unit that must never be split across a page break.
 * The document is flattened into an ordered list of these, each measured
 * individually, then greedily packed into pages.
 */
export type Block =
  | { id: string; kind: 'header'; name: string; contacts: Contact[] }
  | { id: string; kind: 'sectionTitle'; text: string }
  | { id: string; kind: 'company'; name: string }
  | { id: string; kind: 'role'; title: string; dateRange: string }
  | { id: string; kind: 'summary'; text: string }
  | { id: string; kind: 'bullet'; text: string }
  | { id: string; kind: 'skillLine'; label: string; value: string }
  | { id: string; kind: 'education'; entry: EducationEntry }

export type BlockKind = Block['kind']

/**
 * Blocks that introduce what follows and read as orphaned if they end a page.
 * Pagination pulls a trailing run of these onto the next page.
 */
const KEEP_WITH_NEXT: ReadonlySet<BlockKind> = new Set<BlockKind>([
  'sectionTitle',
  'company',
  'role',
])

export const keepsWithNext = (kind: BlockKind) => KEEP_WITH_NEXT.has(kind)

/**
 * Vertical space above a block, in CSS pixels, given what precedes it.
 *
 * Spacing lives here rather than in CSS margins for two reasons: collapsing
 * margins would make a measured block height differ from the height it really
 * consumes, and the paginator needs the same number the renderer applies. Both
 * read this function, so they can never disagree. Blocks are measured bare and
 * the gap is pure arithmetic, applied only when a block is not first on a page.
 */
export function gapBefore(prev: BlockKind | null, next: BlockKind): number {
  if (prev === null) return 0

  switch (next) {
    case 'sectionTitle':
      return 15
    case 'company':
      return prev === 'sectionTitle' ? 4 : 11
    case 'role':
      return prev === 'company' ? 3 : 8
    case 'summary':
      return 4
    case 'bullet':
      return prev === 'bullet' ? 3 : 4
    case 'skillLine':
      return prev === 'sectionTitle' ? 4 : 2
    case 'education':
      return prev === 'sectionTitle' ? 4 : 8
    case 'header':
      return 0
  }
}

/** Walks the document in render order and emits one Block per atomic unit. */
export function flattenToBlocks(cv: CvData): Block[] {
  const blocks: Block[] = [
    { id: 'header', kind: 'header', name: cv.header.name, contacts: cv.header.contacts },
  ]

  for (const section of cv.sections) {
    if (!section.visible) continue

    blocks.push({ id: `${section.id}:title`, kind: 'sectionTitle', text: section.title })

    switch (section.kind) {
      case 'experience':
        for (const company of section.companies) {
          blocks.push({ id: company.id, kind: 'company', name: company.name })
          for (const role of company.roles) {
            blocks.push({
              id: role.id,
              kind: 'role',
              title: role.title,
              dateRange: role.dateRange,
            })
            if (role.summary?.trim()) {
              blocks.push({ id: `${role.id}:summary`, kind: 'summary', text: role.summary })
            }
            for (const bullet of role.bullets) {
              blocks.push({ id: bullet.id, kind: 'bullet', text: bullet.text })
            }
          }
        }
        break

      case 'skills':
        for (const line of section.lines) {
          blocks.push({ id: line.id, kind: 'skillLine', label: line.label, value: line.value })
        }
        break

      case 'education':
        for (const entry of section.entries) {
          blocks.push({ id: entry.id, kind: 'education', entry })
        }
        break

      case 'custom':
        if (section.body?.trim()) {
          blocks.push({ id: `${section.id}:body`, kind: 'summary', text: section.body })
        }
        for (const bullet of section.bullets) {
          blocks.push({ id: bullet.id, kind: 'bullet', text: bullet.text })
        }
        break
    }
  }

  return blocks
}
