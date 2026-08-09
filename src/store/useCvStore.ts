import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultCv } from '../data/defaultCv'
import {
  newId,
  type Bullet,
  type Company,
  type Contact,
  type CvData,
  type EducationEntry,
  type Role,
  type Section,
  type SectionKind,
  type SkillLine,
} from '../types/cv'

export type ZoomMode = 'fit' | number

interface UiState {
  dark: boolean
  editorWidth: number
  zoom: ZoomMode
}

interface CvStore {
  cv: CvData
  ui: UiState

  // whole-document
  setCv: (cv: CvData) => void
  resetCv: () => void

  // ui
  toggleDark: () => void
  setEditorWidth: (px: number) => void
  setZoom: (zoom: ZoomMode) => void

  // header
  setName: (name: string) => void
  updateContact: (id: string, patch: Partial<Contact>) => void
  addContact: (column: Contact['column']) => void
  removeContact: (id: string) => void
  moveContact: (id: string, dir: -1 | 1) => void

  // sections
  addSection: (kind: SectionKind) => void
  updateSection: (id: string, patch: Partial<Pick<Section, 'title' | 'visible'>>) => void
  removeSection: (id: string) => void
  reorderSections: (from: number, to: number) => void

  // experience: company
  addCompany: (sectionId: string) => void
  updateCompany: (sectionId: string, companyId: string, patch: Partial<Company>) => void
  removeCompany: (sectionId: string, companyId: string) => void
  reorderCompanies: (sectionId: string, from: number, to: number) => void

  // experience: role
  addRole: (sectionId: string, companyId: string) => void
  updateRole: (sectionId: string, companyId: string, roleId: string, patch: Partial<Role>) => void
  removeRole: (sectionId: string, companyId: string, roleId: string) => void
  reorderRoles: (sectionId: string, companyId: string, from: number, to: number) => void

  // experience: bullet
  addBullet: (sectionId: string, companyId: string, roleId: string) => void
  updateBullet: (
    sectionId: string,
    companyId: string,
    roleId: string,
    bulletId: string,
    text: string,
  ) => void
  removeBullet: (sectionId: string, companyId: string, roleId: string, bulletId: string) => void
  reorderBullets: (
    sectionId: string,
    companyId: string,
    roleId: string,
    from: number,
    to: number,
  ) => void

  // skills
  addSkillLine: (sectionId: string) => void
  updateSkillLine: (sectionId: string, lineId: string, patch: Partial<SkillLine>) => void
  removeSkillLine: (sectionId: string, lineId: string) => void
  reorderSkillLines: (sectionId: string, from: number, to: number) => void

  // education
  addEducation: (sectionId: string) => void
  updateEducation: (sectionId: string, entryId: string, patch: Partial<EducationEntry>) => void
  removeEducation: (sectionId: string, entryId: string) => void
  reorderEducation: (sectionId: string, from: number, to: number) => void

  // custom
  updateCustomBody: (sectionId: string, body: string) => void
  addCustomBullet: (sectionId: string) => void
  updateCustomBullet: (sectionId: string, bulletId: string, text: string) => void
  removeCustomBullet: (sectionId: string, bulletId: string) => void
}

/** Move an item between indices, returning a new array. Out-of-range is a no-op. */
export function arrayMove<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items
  const next = items.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved!)
  return next
}

const emptySection = (kind: SectionKind): Section => {
  const base = { id: newId(), visible: true }
  switch (kind) {
    case 'experience':
      return { ...base, kind, title: 'Experience', companies: [] }
    case 'skills':
      return { ...base, kind, title: 'Additional Skills', lines: [] }
    case 'education':
      return { ...base, kind, title: 'Education', entries: [] }
    case 'custom':
      return { ...base, kind, title: 'New Section', body: '', bullets: [] }
  }
}

/**
 * Rewrites one section in place. The `guard` narrows to the section variant the
 * caller expects, so a mismatched id or kind simply leaves the document alone
 * instead of corrupting it.
 */
function mapSection<K extends SectionKind>(
  cv: CvData,
  sectionId: string,
  kind: K,
  fn: (section: Extract<Section, { kind: K }>) => Extract<Section, { kind: K }>,
): CvData {
  return {
    ...cv,
    sections: cv.sections.map((s) =>
      s.id === sectionId && s.kind === kind ? fn(s as Extract<Section, { kind: K }>) : s,
    ),
  }
}

/** Rewrites one company inside an experience section. */
function mapCompany(
  cv: CvData,
  sectionId: string,
  companyId: string,
  fn: (company: Company) => Company,
): CvData {
  return mapSection(cv, sectionId, 'experience', (section) => ({
    ...section,
    companies: section.companies.map((c) => (c.id === companyId ? fn(c) : c)),
  }))
}

/** Rewrites one role inside a company. */
function mapRole(
  cv: CvData,
  sectionId: string,
  companyId: string,
  roleId: string,
  fn: (role: Role) => Role,
): CvData {
  return mapCompany(cv, sectionId, companyId, (company) => ({
    ...company,
    roles: company.roles.map((r) => (r.id === roleId ? fn(r) : r)),
  }))
}

const emptyBullet = (): Bullet => ({ id: newId(), text: '' })

const emptyRole = (): Role => ({ id: newId(), title: '', dateRange: '', bullets: [emptyBullet()] })

export const useCvStore = create<CvStore>()(
  persist(
    (set) => ({
      cv: defaultCv,
      ui: { dark: true, editorWidth: 460, zoom: 'fit' },

      setCv: (cv) => set({ cv }),
      resetCv: () => set({ cv: defaultCv }),

      toggleDark: () => set((s) => ({ ui: { ...s.ui, dark: !s.ui.dark } })),
      setEditorWidth: (px) => set((s) => ({ ui: { ...s.ui, editorWidth: px } })),
      setZoom: (zoom) => set((s) => ({ ui: { ...s.ui, zoom } })),

      setName: (name) => set((s) => ({ cv: { ...s.cv, header: { ...s.cv.header, name } } })),

      updateContact: (id, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            header: {
              ...s.cv.header,
              contacts: s.cv.header.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
            },
          },
        })),

      addContact: (column) =>
        set((s) => ({
          cv: {
            ...s.cv,
            header: {
              ...s.cv.header,
              contacts: [
                ...s.cv.header.contacts,
                { id: newId(), label: 'Label', value: '', column },
              ],
            },
          },
        })),

      removeContact: (id) =>
        set((s) => ({
          cv: {
            ...s.cv,
            header: {
              ...s.cv.header,
              contacts: s.cv.header.contacts.filter((c) => c.id !== id),
            },
          },
        })),

      moveContact: (id, dir) =>
        set((s) => {
          const contacts = s.cv.header.contacts
          const index = contacts.findIndex((c) => c.id === id)
          if (index === -1) return s
          return {
            cv: {
              ...s.cv,
              header: { ...s.cv.header, contacts: arrayMove(contacts, index, index + dir) },
            },
          }
        }),

      addSection: (kind) =>
        set((s) => ({ cv: { ...s.cv, sections: [...s.cv.sections, emptySection(kind)] } })),

      updateSection: (id, patch) =>
        set((s) => ({
          cv: {
            ...s.cv,
            sections: s.cv.sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
          },
        })),

      removeSection: (id) =>
        set((s) => ({ cv: { ...s.cv, sections: s.cv.sections.filter((sec) => sec.id !== id) } })),

      reorderSections: (from, to) =>
        set((s) => ({ cv: { ...s.cv, sections: arrayMove(s.cv.sections, from, to) } })),

      addCompany: (sectionId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'experience', (section) => ({
            ...section,
            companies: [...section.companies, { id: newId(), name: '', roles: [emptyRole()] }],
          })),
        })),

      updateCompany: (sectionId, companyId, patch) =>
        set((s) => ({ cv: mapCompany(s.cv, sectionId, companyId, (c) => ({ ...c, ...patch })) })),

      removeCompany: (sectionId, companyId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'experience', (section) => ({
            ...section,
            companies: section.companies.filter((c) => c.id !== companyId),
          })),
        })),

      reorderCompanies: (sectionId, from, to) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'experience', (section) => ({
            ...section,
            companies: arrayMove(section.companies, from, to),
          })),
        })),

      addRole: (sectionId, companyId) =>
        set((s) => ({
          cv: mapCompany(s.cv, sectionId, companyId, (c) => ({
            ...c,
            roles: [...c.roles, emptyRole()],
          })),
        })),

      updateRole: (sectionId, companyId, roleId, patch) =>
        set((s) => ({
          cv: mapRole(s.cv, sectionId, companyId, roleId, (r) => ({ ...r, ...patch })),
        })),

      removeRole: (sectionId, companyId, roleId) =>
        set((s) => ({
          cv: mapCompany(s.cv, sectionId, companyId, (c) => ({
            ...c,
            roles: c.roles.filter((r) => r.id !== roleId),
          })),
        })),

      reorderRoles: (sectionId, companyId, from, to) =>
        set((s) => ({
          cv: mapCompany(s.cv, sectionId, companyId, (c) => ({
            ...c,
            roles: arrayMove(c.roles, from, to),
          })),
        })),

      addBullet: (sectionId, companyId, roleId) =>
        set((s) => ({
          cv: mapRole(s.cv, sectionId, companyId, roleId, (r) => ({
            ...r,
            bullets: [...r.bullets, emptyBullet()],
          })),
        })),

      updateBullet: (sectionId, companyId, roleId, bulletId, text) =>
        set((s) => ({
          cv: mapRole(s.cv, sectionId, companyId, roleId, (r) => ({
            ...r,
            bullets: r.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
          })),
        })),

      removeBullet: (sectionId, companyId, roleId, bulletId) =>
        set((s) => ({
          cv: mapRole(s.cv, sectionId, companyId, roleId, (r) => ({
            ...r,
            bullets: r.bullets.filter((b) => b.id !== bulletId),
          })),
        })),

      reorderBullets: (sectionId, companyId, roleId, from, to) =>
        set((s) => ({
          cv: mapRole(s.cv, sectionId, companyId, roleId, (r) => ({
            ...r,
            bullets: arrayMove(r.bullets, from, to),
          })),
        })),

      addSkillLine: (sectionId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'skills', (section) => ({
            ...section,
            lines: [...section.lines, { id: newId(), label: '', value: '' }],
          })),
        })),

      updateSkillLine: (sectionId, lineId, patch) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'skills', (section) => ({
            ...section,
            lines: section.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
          })),
        })),

      removeSkillLine: (sectionId, lineId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'skills', (section) => ({
            ...section,
            lines: section.lines.filter((l) => l.id !== lineId),
          })),
        })),

      reorderSkillLines: (sectionId, from, to) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'skills', (section) => ({
            ...section,
            lines: arrayMove(section.lines, from, to),
          })),
        })),

      addEducation: (sectionId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'education', (section) => ({
            ...section,
            entries: [...section.entries, { id: newId(), degree: '', dateRange: '', lines: [''] }],
          })),
        })),

      updateEducation: (sectionId, entryId, patch) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'education', (section) => ({
            ...section,
            entries: section.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
          })),
        })),

      removeEducation: (sectionId, entryId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'education', (section) => ({
            ...section,
            entries: section.entries.filter((e) => e.id !== entryId),
          })),
        })),

      reorderEducation: (sectionId, from, to) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'education', (section) => ({
            ...section,
            entries: arrayMove(section.entries, from, to),
          })),
        })),

      updateCustomBody: (sectionId, body) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'custom', (section) => ({ ...section, body })),
        })),

      addCustomBullet: (sectionId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'custom', (section) => ({
            ...section,
            bullets: [...section.bullets, emptyBullet()],
          })),
        })),

      updateCustomBullet: (sectionId, bulletId, text) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'custom', (section) => ({
            ...section,
            bullets: section.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
          })),
        })),

      removeCustomBullet: (sectionId, bulletId) =>
        set((s) => ({
          cv: mapSection(s.cv, sectionId, 'custom', (section) => ({
            ...section,
            bullets: section.bullets.filter((b) => b.id !== bulletId),
          })),
        })),
    }),
    {
      name: 'cv-web',
      version: 2,
      migrate: (persisted, from) => {
        const state = persisted as { cv: CvData; ui: UiState }
        // v1 shipped with light as the default, so a stored `dark: false` was
        // never a deliberate choice -- carry those sessions over to the new
        // default. The CV itself is left alone; it may hold real edits.
        if (from < 2) state.ui = { ...state.ui, dark: true }
        return state
      },
    },
  ),
)
