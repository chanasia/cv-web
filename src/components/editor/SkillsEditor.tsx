import { Plus, Trash2 } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import type { SkillsSection } from '../../types/cv'
import { Button, IconButton } from '../ui/Button'
import { DragHandle, SortableItem, SortableList } from '../ui/Sortable'
import { AutoGrowTextArea, TextInput } from './fields/Fields'

export function SkillsEditor({ section }: { section: SkillsSection }) {
  const addSkillLine = useCvStore((s) => s.addSkillLine)
  const updateSkillLine = useCvStore((s) => s.updateSkillLine)
  const removeSkillLine = useCvStore((s) => s.removeSkillLine)
  const reorderSkillLines = useCvStore((s) => s.reorderSkillLines)

  return (
    <div>
      <SortableList
        items={section.lines}
        onReorder={(from, to) => reorderSkillLines(section.id, from, to)}
      >
        {(line) => (
          <SortableItem key={line.id} id={line.id}>
            {(handle) => (
              <div className="mb-1.5 flex items-start gap-1">
                <div className="pt-1.5">
                  <DragHandle handle={handle} label="skill line" />
                </div>
                <div className="w-32 shrink-0">
                  <TextInput
                    value={line.label}
                    placeholder="Category"
                    onChange={(e) => updateSkillLine(section.id, line.id, { label: e.target.value })}
                    className="font-medium"
                  />
                </div>
                <AutoGrowTextArea
                  value={line.value}
                  placeholder="Comma-separated list"
                  onChange={(e) => updateSkillLine(section.id, line.id, { value: e.target.value })}
                />
                <div className="pt-1.5">
                  <IconButton
                    label="Delete skill line"
                    variant="danger"
                    onClick={() => removeSkillLine(section.id, line.id)}
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
            )}
          </SortableItem>
        )}
      </SortableList>

      <Button onClick={() => addSkillLine(section.id)} className="mt-1">
        <Plus className="size-3.5" />
        Add line
      </Button>
    </div>
  )
}
