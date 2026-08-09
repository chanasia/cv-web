export type Id = string

/** One "Label: value" entry in the contact grid under the name. */
export interface Contact {
  id: Id
  label: string
  value: string
  /** When set, the value renders as an anchor so the PDF keeps a live link. */
  href?: string
  column: 'left' | 'right'
}

export interface CvHeader {
  name: string
  contacts: Contact[]
}

export interface Bullet {
  id: Id
  text: string
}

export interface Role {
  id: Id
  title: string
  dateRange: string
  /** Optional indented paragraph shown above the bullets. */
  summary?: string
  bullets: Bullet[]
}

/** An employer, which may hold several roles held over time. */
export interface Company {
  id: Id
  name: string
  roles: Role[]
}

export interface SkillLine {
  id: Id
  label: string
  value: string
}

export interface EducationEntry {
  id: Id
  degree: string
  dateRange: string
  /** Free-form detail lines: programme, GPAX, honours... */
  lines: string[]
}

interface SectionBase {
  id: Id
  title: string
  visible: boolean
}

export interface ExperienceSection extends SectionBase {
  kind: 'experience'
  companies: Company[]
}

export interface SkillsSection extends SectionBase {
  kind: 'skills'
  lines: SkillLine[]
}

export interface EducationSection extends SectionBase {
  kind: 'education'
  entries: EducationEntry[]
}

/** Escape hatch for anything the three fixed kinds do not model. */
export interface CustomSection extends SectionBase {
  kind: 'custom'
  body?: string
  bullets: Bullet[]
}

export type Section = ExperienceSection | SkillsSection | EducationSection | CustomSection

export type SectionKind = Section['kind']

export interface CvData {
  header: CvHeader
  sections: Section[]
}

export const newId = (): Id => crypto.randomUUID()
