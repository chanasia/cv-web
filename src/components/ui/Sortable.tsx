import type { ReactNode } from 'react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

/** Props to spread onto whatever element should act as the drag handle. */
export type DragHandleProps = Record<string, unknown>

/**
 * Vertical sortable list.
 *
 * Dragging is bound to an explicit handle rather than the whole row, which is
 * what lets these lists nest (sections > companies > roles > bullets) without
 * an inner drag also grabbing its parent.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
}: {
  items: T[]
  onReorder: (from: number, to: number) => void
  children: (item: T, index: number) => ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const from = items.findIndex((item) => item.id === active.id)
    const to = items.findIndex((item) => item.id === over.id)
    if (from !== -1 && to !== -1) onReorder(from, to)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => children(item, index))}
      </SortableContext>
    </DndContext>
  )
}

export function SortableItem({
  id,
  children,
}: {
  id: string
  children: (handle: DragHandleProps) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'relative z-10 opacity-90' : undefined}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  )
}

export function DragHandle({ handle, label }: { handle: DragHandleProps; label: string }) {
  return (
    <button
      type="button"
      aria-label={`Reorder ${label}`}
      className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-black/5 hover:text-neutral-600 active:cursor-grabbing dark:hover:bg-white/10 dark:hover:text-neutral-200"
      {...handle}
    >
      <GripVertical className="size-4" />
    </button>
  )
}
