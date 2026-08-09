import { useEffect, useRef, useState } from 'react'
import { Check, Copy, FilePlus2, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react'
import { useCvStore } from '../../store/useCvStore'
import { IconButton } from '../ui/Button'
import { TextInput } from './fields/Fields'

/**
 * Tabs across the top of the editor, one per tailored CV, plus a menu for
 * managing them. Only the active version is previewed and printed.
 */
export function VersionSwitcher() {
  const versions = useCvStore((s) => s.versions)
  const activeId = useCvStore((s) => s.activeId)
  const setActiveVersion = useCvStore((s) => s.setActiveVersion)
  const renameVersion = useCvStore((s) => s.renameVersion)
  const duplicateVersion = useCvStore((s) => s.duplicateVersion)
  const removeVersion = useCvStore((s) => s.removeVersion)
  const addVersion = useCvStore((s) => s.addVersion)

  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const active = versions.find((v) => v.id === activeId) ?? versions[0]

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const startRename = () => {
    setDraft(active?.name ?? '')
    setRenaming(true)
    setMenuOpen(false)
  }

  const commitRename = () => {
    if (active && draft.trim()) renameVersion(active.id, draft.trim())
    setRenaming(false)
  }

  const confirmRemove = () => {
    setMenuOpen(false)
    if (!active) return
    if (window.confirm(`Delete the "${active.name}" version? This cannot be undone.`)) {
      removeVersion(active.id)
    }
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
        <TextInput
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') setRenaming(false)
          }}
          className="text-sm font-medium"
        />
        <IconButton label="Save name" onClick={commitRename}>
          <Check className="size-4" />
        </IconButton>
        <IconButton label="Cancel" onClick={() => setRenaming(false)}>
          <X className="size-4" />
        </IconButton>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {versions.map((version) => (
          <button
            key={version.id}
            type="button"
            onClick={() => setActiveVersion(version.id)}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              version.id === activeId
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10'
            }`}
          >
            {version.name}
          </button>
        ))}
      </div>

      <div ref={menuRef} className="relative shrink-0">
        <IconButton label="Manage versions" onClick={() => setMenuOpen(!menuOpen)}>
          <MoreHorizontal className="size-4" />
        </IconButton>

        {menuOpen ? (
          <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <MenuItem icon={<Pencil className="size-3.5" />} onClick={startRename}>
              Rename this version
            </MenuItem>
            <MenuItem
              icon={<Copy className="size-3.5" />}
              onClick={() => {
                if (active) duplicateVersion(active.id)
                setMenuOpen(false)
              }}
            >
              Duplicate this version
            </MenuItem>
            <MenuItem
              icon={<FilePlus2 className="size-3.5" />}
              onClick={() => {
                addVersion()
                setMenuOpen(false)
              }}
            >
              New empty version
            </MenuItem>
            <MenuItem
              icon={<Trash2 className="size-3.5" />}
              onClick={confirmRemove}
              disabled={versions.length <= 1}
              danger
            >
              Delete this version
            </MenuItem>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition disabled:opacity-40 ${
        danger
          ? 'text-red-600 hover:bg-red-50 disabled:hover:bg-transparent dark:text-red-400 dark:hover:bg-red-950'
          : 'text-neutral-700 hover:bg-black/5 dark:text-neutral-200 dark:hover:bg-white/10'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
