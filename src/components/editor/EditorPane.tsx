import type { CSSProperties } from 'react'
import { Plus } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import type { CvData, SectionKind } from '../../types/cv'
import { Button } from '../ui/Button'
import { SortableItem, SortableList } from '../ui/Sortable'
import { HeaderForm } from './HeaderForm'
import { SectionCard } from './SectionCard'
import { Toolbar } from './Toolbar'

const NEW_SECTION_KINDS: { label: string; kind: SectionKind }[] = [
  { label: 'Experience', kind: 'experience' },
  { label: 'Skills', kind: 'skills' },
  { label: 'Education', kind: 'education' },
  { label: 'Custom', kind: 'custom' },
]

export function EditorPane({
  cv,
  pageCount,
  className = '',
}: {
  cv: CvData
  pageCount: number
  className?: string
}) {
  const width = useCvStore((s) => s.ui.editorWidth)
  const addSection = useCvStore((s) => s.addSection)
  const reorderSections = useCvStore((s) => s.reorderSections)

  return (
    <aside
      // The dragged width goes through a custom property rather than an inline
      // `width`, so it can be applied from `lg` up only. An inline width would
      // beat every responsive class and pin the pane to 460px on a phone.
      style={{ '--editor-w': `${width}px` } as CSSProperties}
      className={`w-full flex-col border-l border-neutral-200 bg-neutral-100 lg:w-(--editor-w) lg:shrink-0 print:hidden dark:border-neutral-700 dark:bg-neutral-950 ${className}`}
    >
      <Toolbar pageCount={pageCount} />

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <section className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Header
          </h2>
          <HeaderForm header={cv.header} />
        </section>

        <SortableList items={cv.sections} onReorder={reorderSections}>
          {(section) => (
            <SortableItem key={section.id} id={section.id}>
              {(handle) => (
                <div className="mb-3">
                  <SectionCard section={section} handle={handle} />
                </div>
              )}
            </SortableItem>
          )}
        </SortableList>

        <div className="flex flex-wrap items-center gap-2 pb-6">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Add section:</span>
          {NEW_SECTION_KINDS.map(({ label, kind }) => (
            <Button key={kind} onClick={() => addSection(kind)}>
              <Plus className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  )
}
