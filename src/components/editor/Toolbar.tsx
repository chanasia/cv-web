import { useState } from 'react'
import { Download, Moon, Printer, RotateCcw, Sun, Upload } from 'lucide-react'
import { exportCv, importCv } from '../../lib/io'
import { selectActiveCv, useCvStore } from '../../store/useCvStore'
import { Button, IconButton, IconLink } from '../ui/Button'
import { GithubMark } from '../ui/GithubMark'
import { VersionSwitcher } from './VersionSwitcher'

const REPO_URL = 'https://github.com/chanasia/cv-web'

export function Toolbar({ pageCount }: { pageCount: number }) {
  const cv = useCvStore(selectActiveCv)
  const versionName = useCvStore(
    (s) => s.versions.find((v) => v.id === s.activeId)?.name ?? 'CV',
  )
  const importVersion = useCvStore((s) => s.importVersion)
  const resetActiveVersion = useCvStore((s) => s.resetActiveVersion)
  const dark = useCvStore((s) => s.ui.dark)
  const toggleDark = useCvStore((s) => s.toggleDark)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setError(null)
    try {
      const file = await importCv()
      // Imports always land as a new version: opening a file should never be
      // able to overwrite work in progress.
      if (file) importVersion(file.name, file.data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read that file')
    }
  }

  const handleReset = () => {
    if (window.confirm(`Discard edits and restore the original "${versionName}" content?`)) {
      resetActiveVersion()
    }
  }

  return (
    <div className="shrink-0 border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <VersionSwitcher />

      <div className="flex items-center gap-2 px-3 py-2">
        <Button variant="primary" onClick={() => window.print()}>
          <Printer className="size-3.5" />
          Print
        </Button>

        <Button onClick={() => exportCv(versionName, cv)}>
          <Download className="size-3.5" />
          Export
        </Button>

        <Button onClick={handleImport}>
          <Upload className="size-3.5" />
          Import
        </Button>

        <span className="ml-auto flex items-center gap-1">
          <span className="mr-1 text-xs text-neutral-500 dark:text-neutral-400">
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </span>
          <IconLink label="View the source on GitHub" href={REPO_URL}>
            <GithubMark className="size-4" />
          </IconLink>
          <IconButton label="Restore this version's original content" onClick={handleReset}>
            <RotateCcw className="size-4" />
          </IconButton>
          <IconButton
            label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleDark}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </IconButton>
        </span>
      </div>

      {error ? (
        <p className="mx-3 mb-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  )
}
