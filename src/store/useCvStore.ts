import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AI_VERSION_ID, defaultVersions } from '../data/defaultCv'
import {
  newId,
  type Bullet,
  type Company,
  type Contact,
  type CvData,
  type CvVersion,
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
  versions: CvVersion[]
  activeId: string
  ui: UiState

  // versions
  setActiveVersion: (id: string) => void
  addVersion: () => void
  duplicateVersion: (id: string) => void
  renameVersion: (id: string, name: string) => void
  removeVersion: (id: string) => void
  importVersion: (name: string, data: CvData) => void

  // whole-document
  setCv: (cv: CvData) => void
  resetActiveVersion: () => void

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

/**
 * Routes a document edit to the version currently open, leaving every other
 * version untouched. Each content action below is written against a plain
 * `CvData` and wrapped in this, so no action can reach across versions even by
 * mistake.
 */
const editCv =
  (fn: (cv: CvData) => CvData) =>
  (s: CvStore): Partial<CvStore> => ({
    versions: s.versions.map((v) => (v.id === s.activeId ? { ...v, data: fn(v.data) } : v)),
  })

export const selectActiveCv = (s: CvStore): CvData =>
  (s.versions.find((v) => v.id === s.activeId) ?? s.versions[0]!).data

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
 * Rewrites one section in place. The `kind` narrows to the section variant the
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
      versions: defaultVersions(),
      activeId: defaultVersions()[0]!.id,
      ui: { dark: true, editorWidth: 460, zoom: 'fit' },

      setActiveVersion: (id) => set({ activeId: id }),

      addVersion: () =>
        set((s) => {
          // Carries the name and contacts over: a blank CV that still makes you
          // retype your own email is a chore, not a fresh start.
          const active = selectActiveCv(s)
          const version: CvVersion = {
            id: newId(),
            name: 'New version',
            data: { header: structuredClone(active.header), sections: [] },
          }
          return { versions: [...s.versions, version], activeId: version.id }
        }),

      duplicateVersion: (id) =>
        set((s) => {
          const source = s.versions.find((v) => v.id === id)
          if (!source) return s
          const version: CvVersion = {
            id: newId(),
            name: `${source.name} (copy)`,
            data: structuredClone(source.data),
          }
          return { versions: [...s.versions, version], activeId: version.id }
        }),

      renameVersion: (id, name) =>
        set((s) => ({ versions: s.versions.map((v) => (v.id === id ? { ...v, name } : v)) })),

      removeVersion: (id) =>
        set((s) => {
          // Never leave the app with nothing to show.
          if (s.versions.length <= 1) return s
          const versions = s.versions.filter((v) => v.id !== id)
          return { versions, activeId: s.activeId === id ? versions[0]!.id : s.activeId }
        }),

      importVersion: (name, data) =>
        set((s) => {
          const version: CvVersion = { id: newId(), name, data }
          return { versions: [...s.versions, version], activeId: version.id }
        }),

      setCv: (cv) => set(editCv(() => cv)),

      resetActiveVersion: () =>
        set((s) => {
          // Only the seeded versions have an original to go back to.
          const seed = defaultVersions().find((v) => v.id === s.activeId)
          if (!seed) return s
          return {
            versions: s.versions.map((v) => (v.id === s.activeId ? { ...v, data: seed.data } : v)),
          }
        }),

      toggleDark: () => set((s) => ({ ui: { ...s.ui, dark: !s.ui.dark } })),
      setEditorWidth: (px) => set((s) => ({ ui: { ...s.ui, editorWidth: px } })),
      setZoom: (zoom) => set((s) => ({ ui: { ...s.ui, zoom } })),

      setName: (name) => set(editCv((cv) => ({ ...cv, header: { ...cv.header, name } }))),

      updateContact: (id, patch) =>
        set(
          editCv((cv) => ({
            ...cv,
            header: {
              ...cv.header,
              contacts: cv.header.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
            },
          })),
        ),

      addContact: (column) =>
        set(
          editCv((cv) => ({
            ...cv,
            header: {
              ...cv.header,
              contacts: [...cv.header.contacts, { id: newId(), label: 'Label', value: '', column }],
            },
          })),
        ),

      removeContact: (id) =>
        set(
          editCv((cv) => ({
            ...cv,
            header: { ...cv.header, contacts: cv.header.contacts.filter((c) => c.id !== id) },
          })),
        ),

      moveContact: (id, dir) =>
        set(
          editCv((cv) => {
            const index = cv.header.contacts.findIndex((c) => c.id === id)
            if (index === -1) return cv
            return {
              ...cv,
              header: {
                ...cv.header,
                contacts: arrayMove(cv.header.contacts, index, index + dir),
              },
            }
          }),
        ),

      addSection: (kind) =>
        set(editCv((cv) => ({ ...cv, sections: [...cv.sections, emptySection(kind)] }))),

      updateSection: (id, patch) =>
        set(
          editCv((cv) => ({
            ...cv,
            sections: cv.sections.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec)),
          })),
        ),

      removeSection: (id) =>
        set(editCv((cv) => ({ ...cv, sections: cv.sections.filter((sec) => sec.id !== id) }))),

      reorderSections: (from, to) =>
        set(editCv((cv) => ({ ...cv, sections: arrayMove(cv.sections, from, to) }))),

      addCompany: (sectionId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'experience', (section) => ({
              ...section,
              companies: [...section.companies, { id: newId(), name: '', roles: [emptyRole()] }],
            })),
          ),
        ),

      updateCompany: (sectionId, companyId, patch) =>
        set(editCv((cv) => mapCompany(cv, sectionId, companyId, (c) => ({ ...c, ...patch })))),

      removeCompany: (sectionId, companyId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'experience', (section) => ({
              ...section,
              companies: section.companies.filter((c) => c.id !== companyId),
            })),
          ),
        ),

      reorderCompanies: (sectionId, from, to) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'experience', (section) => ({
              ...section,
              companies: arrayMove(section.companies, from, to),
            })),
          ),
        ),

      addRole: (sectionId, companyId) =>
        set(
          editCv((cv) =>
            mapCompany(cv, sectionId, companyId, (c) => ({ ...c, roles: [...c.roles, emptyRole()] })),
          ),
        ),

      updateRole: (sectionId, companyId, roleId, patch) =>
        set(
          editCv((cv) => mapRole(cv, sectionId, companyId, roleId, (r) => ({ ...r, ...patch }))),
        ),

      removeRole: (sectionId, companyId, roleId) =>
        set(
          editCv((cv) =>
            mapCompany(cv, sectionId, companyId, (c) => ({
              ...c,
              roles: c.roles.filter((r) => r.id !== roleId),
            })),
          ),
        ),

      reorderRoles: (sectionId, companyId, from, to) =>
        set(
          editCv((cv) =>
            mapCompany(cv, sectionId, companyId, (c) => ({
              ...c,
              roles: arrayMove(c.roles, from, to),
            })),
          ),
        ),

      addBullet: (sectionId, companyId, roleId) =>
        set(
          editCv((cv) =>
            mapRole(cv, sectionId, companyId, roleId, (r) => ({
              ...r,
              bullets: [...r.bullets, emptyBullet()],
            })),
          ),
        ),

      updateBullet: (sectionId, companyId, roleId, bulletId, text) =>
        set(
          editCv((cv) =>
            mapRole(cv, sectionId, companyId, roleId, (r) => ({
              ...r,
              bullets: r.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
            })),
          ),
        ),

      removeBullet: (sectionId, companyId, roleId, bulletId) =>
        set(
          editCv((cv) =>
            mapRole(cv, sectionId, companyId, roleId, (r) => ({
              ...r,
              bullets: r.bullets.filter((b) => b.id !== bulletId),
            })),
          ),
        ),

      reorderBullets: (sectionId, companyId, roleId, from, to) =>
        set(
          editCv((cv) =>
            mapRole(cv, sectionId, companyId, roleId, (r) => ({
              ...r,
              bullets: arrayMove(r.bullets, from, to),
            })),
          ),
        ),

      addSkillLine: (sectionId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'skills', (section) => ({
              ...section,
              lines: [...section.lines, { id: newId(), label: '', value: '' }],
            })),
          ),
        ),

      updateSkillLine: (sectionId, lineId, patch) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'skills', (section) => ({
              ...section,
              lines: section.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
            })),
          ),
        ),

      removeSkillLine: (sectionId, lineId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'skills', (section) => ({
              ...section,
              lines: section.lines.filter((l) => l.id !== lineId),
            })),
          ),
        ),

      reorderSkillLines: (sectionId, from, to) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'skills', (section) => ({
              ...section,
              lines: arrayMove(section.lines, from, to),
            })),
          ),
        ),

      addEducation: (sectionId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'education', (section) => ({
              ...section,
              entries: [...section.entries, { id: newId(), degree: '', dateRange: '', lines: [''] }],
            })),
          ),
        ),

      updateEducation: (sectionId, entryId, patch) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'education', (section) => ({
              ...section,
              entries: section.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
            })),
          ),
        ),

      removeEducation: (sectionId, entryId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'education', (section) => ({
              ...section,
              entries: section.entries.filter((e) => e.id !== entryId),
            })),
          ),
        ),

      reorderEducation: (sectionId, from, to) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'education', (section) => ({
              ...section,
              entries: arrayMove(section.entries, from, to),
            })),
          ),
        ),

      updateCustomBody: (sectionId, body) =>
        set(
          editCv((cv) => mapSection(cv, sectionId, 'custom', (section) => ({ ...section, body }))),
        ),

      addCustomBullet: (sectionId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'custom', (section) => ({
              ...section,
              bullets: [...section.bullets, emptyBullet()],
            })),
          ),
        ),

      updateCustomBullet: (sectionId, bulletId, text) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'custom', (section) => ({
              ...section,
              bullets: section.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
            })),
          ),
        ),

      removeCustomBullet: (sectionId, bulletId) =>
        set(
          editCv((cv) =>
            mapSection(cv, sectionId, 'custom', (section) => ({
              ...section,
              bullets: section.bullets.filter((b) => b.id !== bulletId),
            })),
          ),
        ),
    }),
    {
      name: 'cv-web',
      version: 4,
      migrate: (persisted, from) => {
        const state = persisted as Record<string, unknown>

        // v1 shipped with light as the default, so a stored `dark: false` was
        // never a deliberate choice -- carry those sessions over.
        if (from < 2) {
          state.ui = { ...(state.ui as UiState), dark: true }
        }

        // v2 held a single `cv`. Wrap it as the Full Stack version rather than
        // dropping it -- it may hold real edits.
        if (from < 3) {
          const single = state.cv as CvData | undefined
          const seeded = defaultVersions()
          return {
            ui: state.ui,
            versions: single ? [{ ...seeded[0]!, data: single }] : seeded,
            activeId: seeded[0]!.id,
          }
        }

        // v4 drops the seeded AI Engineer version and ends the Yip In Tsoi role.
        // Only an untouched "Present" date is rewritten, so user edits survive.
        if (from < 4) {
          const versions = (state.versions as CvVersion[])
            .filter((v) => v.id !== AI_VERSION_ID)
            .map((v) => ({
              ...v,
              data: {
                ...v.data,
                sections: v.data.sections.map((s) =>
                  s.kind !== 'experience'
                    ? s
                    : {
                        ...s,
                        companies: s.companies.map((c) => ({
                          ...c,
                          roles: c.roles.map((r) =>
                            r.id === 'r-yit-java' && r.dateRange === 'Oct 2025 - Present'
                              ? { ...r, dateRange: 'Oct 2025 - Nov 2026' }
                              : r,
                          ),
                        })),
                      },
                ),
              },
            }))
          const safe = versions.length ? versions : defaultVersions()
          return {
            ...state,
            versions: safe,
            activeId: safe.some((v) => v.id === state.activeId) ? state.activeId : safe[0]!.id,
          }
        }

        return state
      },
    },
  ),
)

/** The document currently being edited and previewed. */
export const useActiveCv = () => useCvStore(selectActiveCv)
