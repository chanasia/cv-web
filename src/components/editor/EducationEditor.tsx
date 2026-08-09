import { Plus, Trash2 } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import type { EducationSection } from '../../types/cv'
import { Button, IconButton } from '../ui/Button'
import { DragHandle, SortableItem, SortableList } from '../ui/Sortable'
import { AutoGrowTextArea, Field, TextInput } from './fields/Fields'

export function EducationEditor({ section }: { section: EducationSection }) {
  const addEducation = useCvStore((s) => s.addEducation)
  const updateEducation = useCvStore((s) => s.updateEducation)
  const removeEducation = useCvStore((s) => s.removeEducation)
  const reorderEducation = useCvStore((s) => s.reorderEducation)

  return (
    <div>
      <SortableList
        items={section.entries}
        onReorder={(from, to) => reorderEducation(section.id, from, to)}
      >
        {(entry) => (
          <SortableItem key={entry.id} id={entry.id}>
            {(handle) => (
              <div className="mb-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="flex items-start gap-1.5">
                  <div className="pt-5">
                    <DragHandle handle={handle} label="education entry" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Field label="Degree / institution">
                      <TextInput
                        value={entry.degree}
                        placeholder="Bachelor's Degree, University"
                        onChange={(e) =>
                          updateEducation(section.id, entry.id, { degree: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Dates">
                      <TextInput
                        value={entry.dateRange}
                        placeholder="2021 - 2025"
                        onChange={(e) =>
                          updateEducation(section.id, entry.id, { dateRange: e.target.value })
                        }
                        className="max-w-40"
                      />
                    </Field>
                  </div>
                  <div className="pt-5">
                    <IconButton
                      label="Delete entry"
                      variant="danger"
                      onClick={() => removeEducation(section.id, entry.id)}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </div>

                <div className="mt-2">
                  <Field label="Detail lines (one per line)">
                    <AutoGrowTextArea
                      value={entry.lines.join('\n')}
                      placeholder={'Bachelor of Science (…)\nGPAX: 3.75'}
                      onChange={(e) =>
                        updateEducation(section.id, entry.id, { lines: e.target.value.split('\n') })
                      }
                    />
                  </Field>
                </div>
              </div>
            )}
          </SortableItem>
        )}
      </SortableList>

      <Button onClick={() => addEducation(section.id)} className="mt-1">
        <Plus className="size-3.5" />
        Add education
      </Button>
    </div>
  )
}
