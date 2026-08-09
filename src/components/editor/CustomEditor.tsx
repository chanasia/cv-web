import { Plus, Trash2 } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import type { CustomSection } from '../../types/cv'
import { Button, IconButton } from '../ui/Button'
import { AutoGrowTextArea, Field } from './fields/Fields'

export function CustomEditor({ section }: { section: CustomSection }) {
  const updateCustomBody = useCvStore((s) => s.updateCustomBody)
  const addCustomBullet = useCvStore((s) => s.addCustomBullet)
  const updateCustomBullet = useCvStore((s) => s.updateCustomBullet)
  const removeCustomBullet = useCvStore((s) => s.removeCustomBullet)

  return (
    <div className="space-y-2">
      <Field label="Paragraph (optional)">
        <AutoGrowTextArea
          value={section.body ?? ''}
          placeholder="Free text shown above the bullets"
          onChange={(e) => updateCustomBody(section.id, e.target.value)}
        />
      </Field>

      <div>
        <span className="mb-1 block text-[11px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Bullets
        </span>
        {section.bullets.map((bullet) => (
          <div key={bullet.id} className="mb-1.5 flex items-start gap-1">
            <AutoGrowTextArea
              value={bullet.text}
              onChange={(e) => updateCustomBullet(section.id, bullet.id, e.target.value)}
            />
            <div className="pt-1.5">
              <IconButton
                label="Delete bullet"
                variant="danger"
                onClick={() => removeCustomBullet(section.id, bullet.id)}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </div>
        ))}
        <Button onClick={() => addCustomBullet(section.id)} className="mt-1">
          <Plus className="size-3.5" />
          Add bullet
        </Button>
      </div>
    </div>
  )
}
