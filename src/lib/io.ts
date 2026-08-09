import type { CvData } from '../types/cv'

/** Filename-safe version of the CV owner's name, for the download. */
function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'cv'
}

export function exportCv(cv: CvData): void {
  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${slugify(cv.header.name)}.json`
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * Structural check on imported JSON. Deliberately shallow: it confirms the file
 * is a CV document rather than validating every field, so a document saved by
 * an older build still loads instead of being rejected outright.
 */
export function parseCv(text: string): CvData {
  const data: unknown = JSON.parse(text)

  if (typeof data !== 'object' || data === null) throw new Error('File is not a CV document')

  const candidate = data as Partial<CvData>
  if (typeof candidate.header !== 'object' || candidate.header === null) {
    throw new Error('File is missing a "header"')
  }
  if (typeof candidate.header.name !== 'string' || !Array.isArray(candidate.header.contacts)) {
    throw new Error('The "header" is malformed')
  }
  if (!Array.isArray(candidate.sections)) throw new Error('File is missing "sections"')

  return candidate as CvData
}

/** Opens a file picker and resolves the chosen CV, or null if cancelled. */
export function importCv(): Promise<CvData | null> {
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
        resolve(parseCv(await file.text()))
      } catch (error) {
        reject(error)
      }
    }

    // Cancelling the dialog fires no event in every browser; the promise simply
    // never settles, which is harmless here since nothing awaits it forever.
    input.click()
  })
}
