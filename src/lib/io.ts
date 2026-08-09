import type { CvData } from '../types/cv'

/** What an exported file contains: one named version of a CV. */
export interface CvFile {
  name: string
  data: CvData
}

/** Filename-safe version of a string, for the download. */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function exportCv(name: string, data: CvData): void {
  const file: CvFile = { name, data }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const parts = [slugify(data.header.name), slugify(name)].filter(Boolean)
  const link = document.createElement('a')
  link.href = url
  link.download = `${parts.join('-') || 'cv'}.json`
  link.click()

  URL.revokeObjectURL(url)
}

function isCvData(value: unknown): value is CvData {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<CvData>
  return (
    typeof candidate.header === 'object' &&
    candidate.header !== null &&
    typeof candidate.header.name === 'string' &&
    Array.isArray(candidate.header.contacts) &&
    Array.isArray(candidate.sections)
  )
}

/**
 * Structural check on imported JSON. Deliberately shallow: it confirms the file
 * is a CV document rather than validating every field, so a document saved by
 * an older build still loads instead of being rejected outright.
 *
 * Accepts both the current `{ name, data }` shape and the bare `CvData` that
 * earlier builds exported.
 */
export function parseCvFile(text: string): CvFile {
  const parsed: unknown = JSON.parse(text)

  if (typeof parsed !== 'object' || parsed === null) throw new Error('File is not a CV document')

  const wrapped = parsed as Partial<CvFile>
  if (typeof wrapped.name === 'string' && isCvData(wrapped.data)) {
    return { name: wrapped.name, data: wrapped.data }
  }

  if (isCvData(parsed)) return { name: 'Imported', data: parsed }

  throw new Error('File is missing a valid "header" and "sections"')
}

/** Opens a file picker and resolves the chosen CV, or null if cancelled. */
export function importCv(): Promise<CvFile | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      try {
        const parsed = parseCvFile(await file.text())
        // Fall back to the filename when the file carries no version name.
        resolve({ ...parsed, name: parsed.name || file.name.replace(/\.json$/i, '') })
      } catch (error) {
        reject(error)
      }
    }

    // Cancelling the dialog fires no event in every browser; the promise simply
    // never settles, which is harmless here since nothing awaits it forever.
    input.click()
  })
}
