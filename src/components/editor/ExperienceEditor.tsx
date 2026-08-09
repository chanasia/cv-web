import { Plus, Trash2 } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import type { Company, ExperienceSection, Role } from '../../types/cv'
import { Button, IconButton } from '../ui/Button'
import { DragHandle, SortableItem, SortableList } from '../ui/Sortable'
import { AutoGrowTextArea, Field, TextInput } from './fields/Fields'

export function ExperienceEditor({ section }: { section: ExperienceSection }) {
  const addCompany = useCvStore((s) => s.addCompany)
  const reorderCompanies = useCvStore((s) => s.reorderCompanies)

  return (
    <div className="space-y-3">
      <SortableList
        items={section.companies}
        onReorder={(from, to) => reorderCompanies(section.id, from, to)}
      >
        {(company) => (
          <SortableItem key={company.id} id={company.id}>
            {(handle) => (
              <div className="mb-3">
                <CompanyCard sectionId={section.id} company={company} handle={handle} />
              </div>
            )}
          </SortableItem>
        )}
      </SortableList>

      <Button onClick={() => addCompany(section.id)}>
        <Plus className="size-3.5" />
        Add company
      </Button>
    </div>
  )
}

function CompanyCard({
  sectionId,
  company,
  handle,
}: {
  sectionId: string
  company: Company
  handle: Record<string, unknown>
}) {
  const updateCompany = useCvStore((s) => s.updateCompany)
  const removeCompany = useCvStore((s) => s.removeCompany)
  const addRole = useCvStore((s) => s.addRole)
  const reorderRoles = useCvStore((s) => s.reorderRoles)

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/40">
      <div className="mb-2 flex items-center gap-1.5">
        <DragHandle handle={handle} label="company" />
        <TextInput
          value={company.name}
          placeholder="Company name"
          onChange={(e) => updateCompany(sectionId, company.id, { name: e.target.value })}
          className="font-medium"
        />
        <IconButton
          label="Delete company"
          variant="danger"
          onClick={() => removeCompany(sectionId, company.id)}
        >
          <Trash2 className="size-4" />
        </IconButton>
      </div>

      <div className="space-y-2 pl-3">
        <SortableList
          items={company.roles}
          onReorder={(from, to) => reorderRoles(sectionId, company.id, from, to)}
        >
          {(role) => (
            <SortableItem key={role.id} id={role.id}>
              {(roleHandle) => (
                <div className="mb-2">
                  <RoleCard
                    sectionId={sectionId}
                    companyId={company.id}
                    role={role}
                    handle={roleHandle}
                  />
                </div>
              )}
            </SortableItem>
          )}
        </SortableList>

        <Button onClick={() => addRole(sectionId, company.id)}>
          <Plus className="size-3.5" />
          Add role
        </Button>
      </div>
    </div>
  )
}

function RoleCard({
  sectionId,
  companyId,
  role,
  handle,
}: {
  sectionId: string
  companyId: string
  role: Role
  handle: Record<string, unknown>
}) {
  const updateRole = useCvStore((s) => s.updateRole)
  const removeRole = useCvStore((s) => s.removeRole)
  const addBullet = useCvStore((s) => s.addBullet)
  const updateBullet = useCvStore((s) => s.updateBullet)
  const removeBullet = useCvStore((s) => s.removeBullet)
  const reorderBullets = useCvStore((s) => s.reorderBullets)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-2 flex items-start gap-1.5">
        <div className="pt-5">
          <DragHandle handle={handle} label="role" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Field label="Role">
            <TextInput
              value={role.title}
              placeholder="Job title"
              onChange={(e) => updateRole(sectionId, companyId, role.id, { title: e.target.value })}
            />
          </Field>
          <Field label="Dates">
            <TextInput
              value={role.dateRange}
              placeholder="Apr 2025 - Jul 2025"
              onChange={(e) =>
                updateRole(sectionId, companyId, role.id, { dateRange: e.target.value })
              }
              className="max-w-52"
            />
          </Field>
        </div>
        <div className="pt-5">
          <IconButton
            label="Delete role"
            variant="danger"
            onClick={() => removeRole(sectionId, companyId, role.id)}
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>

      <div className="mb-2">
        <Field label="Summary (optional)">
          <AutoGrowTextArea
            value={role.summary ?? ''}
            placeholder="Intro paragraph shown above the bullets"
            onChange={(e) => updateRole(sectionId, companyId, role.id, { summary: e.target.value })}
          />
        </Field>
      </div>

      <span className="mb-1 block text-[11px] font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        Bullets
      </span>

      <SortableList
        items={role.bullets}
        onReorder={(from, to) => reorderBullets(sectionId, companyId, role.id, from, to)}
      >
        {(bullet) => (
          <SortableItem key={bullet.id} id={bullet.id}>
            {(bulletHandle) => (
              <div className="mb-1.5 flex items-start gap-1">
                <div className="pt-1.5">
                  <DragHandle handle={bulletHandle} label="bullet" />
                </div>
                <AutoGrowTextArea
                  value={bullet.text}
                  placeholder="Achievement or responsibility"
                  onChange={(e) =>
                    updateBullet(sectionId, companyId, role.id, bullet.id, e.target.value)
                  }
                />
                <div className="pt-1.5">
                  <IconButton
                    label="Delete bullet"
                    variant="danger"
                    onClick={() => removeBullet(sectionId, companyId, role.id, bullet.id)}
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
            )}
          </SortableItem>
        )}
      </SortableList>

      <Button onClick={() => addBullet(sectionId, companyId, role.id)} className="mt-1">
        <Plus className="size-3.5" />
        Add bullet
      </Button>
    </div>
  )
}
