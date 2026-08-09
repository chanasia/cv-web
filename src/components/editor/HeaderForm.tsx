import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import type { Contact, CvHeader } from '../../types/cv'
import { Button, IconButton } from '../ui/Button'
import { Field, TextInput } from './fields/Fields'

export function HeaderForm({ header }: { header: CvHeader }) {
  const setName = useCvStore((s) => s.setName)
  const addContact = useCvStore((s) => s.addContact)

  return (
    <div className="space-y-3">
      <Field label="Full name">
        <TextInput
          value={header.name}
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
          className="text-base font-semibold"
        />
      </Field>

      <div>
        <span className="mb-1 block text-[11px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          Contacts
        </span>
        <div className="space-y-1.5">
          {header.contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} />
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <Button onClick={() => addContact('left')}>
            <Plus className="size-3.5" />
            Add left
          </Button>
          <Button onClick={() => addContact('right')}>
            <Plus className="size-3.5" />
            Add right
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Two rows rather than one: the pane narrows to 340px and a single row of
 * label + value + link + actions would clip the link field off the edge.
 */
function ContactRow({ contact }: { contact: Contact }) {
  const updateContact = useCvStore((s) => s.updateContact)
  const removeContact = useCvStore((s) => s.removeContact)

  return (
    <div className="rounded-md border border-neutral-200 p-1.5 dark:border-neutral-700">
      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Switch to the other column"
          onClick={() =>
            updateContact(contact.id, { column: contact.column === 'left' ? 'right' : 'left' })
          }
          className="flex w-8 shrink-0 items-center justify-center gap-0.5 rounded bg-neutral-100 py-1.5 text-[10px] font-semibold text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          {contact.column === 'left' ? 'L' : 'R'}
          <ArrowLeftRight className="size-2.5" />
        </button>
        <div className="w-24 shrink-0">
          <TextInput
            value={contact.label}
            placeholder="Label"
            onChange={(e) => updateContact(contact.id, { label: e.target.value })}
          />
        </div>
        <TextInput
          value={contact.value}
          placeholder="Value"
          onChange={(e) => updateContact(contact.id, { value: e.target.value })}
          className="min-w-0"
        />
        <IconButton
          label="Delete contact"
          variant="danger"
          onClick={() => removeContact(contact.id)}
        >
          <Trash2 className="size-4" />
        </IconButton>
      </div>
      <div className="mt-1 pl-9">
        <TextInput
          value={contact.href ?? ''}
          placeholder="Link (optional) — keeps the PDF clickable"
          onChange={(e) => updateContact(contact.id, { href: e.target.value || undefined })}
          className="text-xs"
        />
      </div>
    </div>
  )
}
