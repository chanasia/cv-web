import { useState } from 'react'
import { ChevronDown, ChevronRight, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import type { Section } from '../../types/cv'
import { IconButton } from '../ui/Button'
import { DragHandle, type DragHandleProps } from '../ui/Sortable'
import { CustomEditor } from './CustomEditor'
import { EducationEditor } from './EducationEditor'
import { ExperienceEditor } from './ExperienceEditor'
import { SkillsEditor } from './SkillsEditor'
import { TextInput } from './fields/Fields'

function SectionBody({ section }: { section: Section }) {
  switch (section.kind) {
    case 'experience':
      return <ExperienceEditor section={section} />
    case 'skills':
      return <SkillsEditor section={section} />
    case 'education':
      return <EducationEditor section={section} />
    case 'custom':
      return <CustomEditor section={section} />
  }
}

export function SectionCard({
  section,
  handle,
}: {
  section: Section
  handle: DragHandleProps
}) {
  const [open, setOpen] = useState(true)
  const updateSection = useCvStore((s) => s.updateSection)
  const removeSection = useCvStore((s) => s.removeSection)

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-2 dark:border-neutral-700 dark:bg-neutral-800">
        <DragHandle handle={handle} label="section" />

        <IconButton label={open ? 'Collapse' : 'Expand'} onClick={() => setOpen(!open)}>
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </IconButton>

        <TextInput
          value={section.title}
          placeholder="Section title"
          onChange={(e) => updateSection(section.id, { title: e.target.value })}
          className="font-semibold"
        />

        <span className="shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-neutral-600 uppercase dark:bg-neutral-700 dark:text-neutral-300">
          {section.kind}
        </span>

        <IconButton
          label={section.visible ? 'Hide from CV' : 'Show in CV'}
          onClick={() => updateSection(section.id, { visible: !section.visible })}
        >
          {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </IconButton>

        <IconButton
          label="Delete section"
          variant="danger"
          onClick={() => removeSection(section.id)}
        >
          <Trash2 className="size-4" />
        </IconButton>
      </div>

      {open ? (
        <div className={`p-3 ${section.visible ? '' : 'opacity-50'}`}>
          <SectionBody section={section} />
        </div>
      ) : null}
    </div>
  )
}
