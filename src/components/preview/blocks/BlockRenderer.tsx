import type { Block } from '../../../lib/blocks'
import type { Contact, EducationEntry } from '../../../types/cv'

/**
 * Renders one Block. Used by both the visible pages and the hidden measuring
 * layer -- they must share this component, or measured heights would drift from
 * what is actually printed.
 *
 * No block sets its own vertical margin: spacing between blocks is applied by
 * the caller from `gapBefore`, so a measured height equals a consumed height.
 */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.kind) {
    case 'header':
      return <HeaderBlock name={block.name} contacts={block.contacts} />
    case 'sectionTitle':
      return <SectionTitleBlock text={block.text} />
    case 'company':
      return <CompanyBlock name={block.name} />
    case 'role':
      return <RoleBlock title={block.title} dateRange={block.dateRange} />
    case 'summary':
      return <SummaryBlock text={block.text} />
    case 'bullet':
      return <BulletBlock text={block.text} />
    case 'skillLine':
      return <SkillLineBlock label={block.label} value={block.value} />
    case 'education':
      return <EducationBlock entry={block.entry} />
  }
}

function ContactValue({ contact }: { contact: Contact }) {
  return (
    <span>
      <span className="font-semibold">{contact.label}: </span>
      {contact.href ? (
        <a href={contact.href} className="underline decoration-black/30 underline-offset-2">
          {contact.value}
        </a>
      ) : (
        contact.value
      )}
    </span>
  )
}

function HeaderBlock({ name, contacts }: { name: string; contacts: Contact[] }) {
  const left = contacts.filter((c) => c.column === 'left')
  const right = contacts.filter((c) => c.column === 'right')
  const rows = Math.max(left.length, right.length)

  return (
    <header>
      <h1 className="text-name">{name}</h1>
      <div className="mt-1 flex flex-col gap-px text-contact">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex justify-between gap-4">
            <span>{left[i] ? <ContactValue contact={left[i]} /> : null}</span>
            <span className="text-right">
              {right[i] ? <ContactValue contact={right[i]} /> : null}
            </span>
          </div>
        ))}
      </div>
    </header>
  )
}

function SectionTitleBlock({ text }: { text: string }) {
  return (
    <h2 className="border-b-2 border-black pb-0.5 text-section uppercase">{text}</h2>
  )
}

function CompanyBlock({ name }: { name: string }) {
  return <h3 className="text-company">{name}</h3>
}

function RoleBlock({ title, dateRange }: { title: string; dateRange: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-role">
      <span>{title}</span>
      <span className="shrink-0">{dateRange}</span>
    </div>
  )
}

function SummaryBlock({ text }: { text: string }) {
  return <p className="indent-[6mm] text-justify text-body">{text}</p>
}

/**
 * Marker is a drawn ring rather than a glyph: list-marker fonts and bullet
 * characters vary between the screen font and whatever the PDF falls back to.
 */
function BulletBlock({ text }: { text: string }) {
  return (
    <div className="flex gap-[2mm] pl-[5mm] text-body">
      <span
        aria-hidden
        className="mt-[0.45em] size-[1.1mm] shrink-0 rounded-full border-[0.35mm] border-black"
      />
      <p className="flex-1">{text}</p>
    </div>
  )
}

function SkillLineBlock({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-body">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  )
}

function EducationBlock({ entry }: { entry: EducationEntry }) {
  return (
    <div className="text-body">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-semibold">{entry.degree}</span>
        <span className="shrink-0">{entry.dateRange}</span>
      </div>
      {entry.lines.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  )
}
