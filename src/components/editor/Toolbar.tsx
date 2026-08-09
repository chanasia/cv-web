import { useState } from 'react'
import { Download, Moon, Printer, RotateCcw, Sun, Upload } from 'lucide-react'
import { exportCv, importCv } from '../../lib/io'
import { useCvStore } from '../../store/useCvStore'
import { Button, IconButton } from '../ui/Button'

export function Toolbar({ pageCount }: { pageCount: number }) {
  const cv = useCvStore((s) => s.cv)
  const setCv = useCvStore((s) => s.setCv)
  const resetCv = useCvStore((s) => s.resetCv)
  const dark = useCvStore((s) => s.ui.dark)
  const toggleDark = useCvStore((s) => s.toggleDark)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    setError(null)
    try {
      const imported = await importCv()
      if (imported) setCv(imported)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read that file')
    }
  }

  const handleReset = () => {
    if (window.confirm('Discard all edits and restore the original CV?')) resetCv()
  }

  return (
    <div className="shrink-0 border-b border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        <Button variant="primary" onClick={() => window.print()}>
          <Printer className="size-3.5" />
          Print
        </Button>

        <Button onClick={() => exportCv(cv)}>
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
          <IconButton label="Restore original CV" onClick={handleReset}>
            <RotateCcw className="size-4" />
          </IconButton>
          <IconButton label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleDark}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </IconButton>
        </span>
      </div>

      {error ? (
        <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  )
}
