'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link2, Loader2, PanelLeftClose, PanelLeftOpen, Plus, Trash2 } from 'lucide-react'
import type { Generation, GenerationType } from '@/types'
import { cn, formatHistorySidebarTime, getGenerationLabel } from '@/lib/utils'
import { QuillPenIcon } from '@/components/icons/QuillPenIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { SharedSheet } from '@/components/share/SharedSheet'

const TYPE_BADGE_LABEL: Record<GenerationType, string> = {
  summary: 'Su',
  rewrite_professional: 'Pr',
  rewrite_casual: 'Ca',
  bullets: 'KP',
}

const TYPE_BADGE_CLASS: Record<GenerationType, string> = {
  summary: 'bg-[var(--type-sum-bg)] text-[var(--type-sum-text)]',
  rewrite_professional: 'bg-[var(--type-pro-bg)] text-[var(--type-pro-text)]',
  rewrite_casual: 'bg-[var(--type-cas-bg)] text-[var(--type-cas-text)]',
  bullets: 'bg-[var(--type-bul-bg)] text-[var(--type-bul-text)]',
}

function groupByDate(items: Generation[]) {
  const today: Generation[] = []
  const thisWeek: Generation[] = []
  const earlier: Generation[] = []

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000)

  for (const item of items) {
    const d = new Date(item.created_at)
    if (d >= startOfToday) today.push(item)
    else if (d >= sevenDaysAgo) thisWeek.push(item)
    else earlier.push(item)
  }

  return { today, thisWeek, earlier }
}

export function Sidebar({
  items,
  isLoading,
  onSelect,
  onDelete,
  onNew,
  selectedId,
}: {
  items: Generation[]
  isLoading: boolean
  onSelect: (generation: Generation) => void
  onDelete: (id: string) => Promise<void>
  onNew: () => void
  selectedId: string | null
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Generation | null>(null)
  const [deleteInProgress, setDeleteInProgress] = useState(false)

  async function handleConfirmDelete() {
    if (!pendingDelete || deleteInProgress) return
    setDeleteInProgress(true)
    try {
      await onDelete(pendingDelete.id)
      setPendingDelete(null)
    } finally {
      setDeleteInProgress(false)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('quill:sidebar:collapsed')
    if (stored === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage hydration
      setCollapsed(true)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('quill:sidebar:collapsed', String(collapsed))
  }, [collapsed])

  const groups = useMemo(() => groupByDate(items), [items])

  function renderSection(label: string, sectionItems: Generation[]) {
    if (sectionItems.length === 0) return null
    return (
      <div key={label}>
        <div
          className={cn(
            'px-3.5 pb-1 pt-2.5 text-[9.5px] font-bold uppercase tracking-[1.6px] text-(--text-muted) transition-opacity duration-200 ease-in-out',
            collapsed ? 'pointer-events-none opacity-0' : '',
          )}
        >
          {label}
        </div>
        {sectionItems.map(item => {
          const isSelected = selectedId === item.id
          const preview =
            item.input_text.length > 28 ? item.input_text.slice(0, 28) + '...' : item.input_text

          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              title={collapsed ? preview : undefined}
              className={cn(
                'group relative mx-1.5 my-px flex cursor-pointer items-center gap-2.5 rounded-(--radius) py-[7px] pl-2.5 pr-2.5 transition-colors duration-200 ease-in-out',
                collapsed ? 'justify-center px-2' : '',
                isSelected
                  ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
                  : 'bg-transparent hover:bg-(--surface)',
              )}
            >
              <div
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-[5px] font-mono text-[10px] font-bold uppercase tracking-[0.2px]',
                  TYPE_BADGE_CLASS[item.generation_type],
                  collapsed ? 'mx-auto' : '',
                )}
              >
                {TYPE_BADGE_LABEL[item.generation_type]}
              </div>

              {!collapsed && (
                <>
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-[12.5px] transition-all duration-200 ease-in-out',
                      isSelected
                        ? 'font-semibold text-(--accent)'
                        : 'font-normal text-(--text-secondary)',
                    )}
                  >
                    {preview}
                  </span>

                  <span className="shrink-0 text-[11px] text-(--text-muted) transition-opacity duration-200 ease-in-out">
                    {formatHistorySidebarTime(item.created_at)}
                  </span>

                  <span className="shrink-0 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        setPendingDelete(item)
                      }}
                      aria-label="Delete"
                      className="flex cursor-pointer border-none bg-transparent p-0.5 text-(--text-secondary) transition-colors duration-200 ease-in-out hover:text-(--destructive)"
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                </>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'relative z-20 flex h-screen shrink-0 flex-col overflow-hidden border-r border-(--border) bg-(--bg) transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-14' : 'w-[260px]',
      )}
    >
      <div
        className={cn(
          'flex shrink-0 border-b border-(--border)',
          collapsed
            ? 'flex-col items-center gap-2 py-2.5'
            : 'h-14 flex-row items-center justify-between pl-3.5 pr-3',
        )}
      >
        <div
          className={cn(
            'flex min-w-0 items-center gap-2.5 overflow-hidden',
            collapsed ? 'flex-col gap-2' : '',
          )}
        >
          <div
            className={cn(
              'flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-(--accent) text-(--accent-foreground) shadow-[var(--shadow-brand-mark)]',
            )}
          >
            <QuillPenIcon className="size-[15px]" />
          </div>
          {!collapsed && (
            <span className="truncate text-[15px] font-bold tracking-[-0.4px] text-(--text-primary)">
              Quill
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-(--radius) border-none bg-transparent text-(--text-muted) transition-all duration-200 ease-in-out hover:bg-(--surface) hover:text-(--text-secondary)',
            collapsed ? 'mx-auto' : '',
          )}
        >
          {collapsed ? <PanelLeftOpen size={15} strokeWidth={2} /> : <PanelLeftClose size={15} strokeWidth={2} />}
        </button>
      </div>

      <div className={cn('pt-2.5', collapsed ? 'px-0' : 'px-2.5')}>
        <button
          type="button"
          onClick={onNew}
          aria-label="New generation"
          className={cn(
            'flex cursor-pointer items-center gap-2 rounded-(--radius) border-none bg-(--accent) text-[13px] font-semibold text-(--accent-foreground) shadow-[var(--shadow-accent-sm)] transition-all duration-200 ease-in-out hover:bg-(--accent-hover) hover:shadow-[var(--shadow-accent-md)] enabled:hover:-translate-y-px enabled:active:translate-y-0',
            collapsed ? 'mx-auto size-9 justify-center p-0' : 'w-full justify-start px-3.5 py-2',
          )}
        >
          <Plus size={15} strokeWidth={2.5} className="shrink-0" />
          {!collapsed && <span className="truncate transition-opacity duration-200 ease-in-out">New generation</span>}
        </button>
      </div>

      <div className={cn(collapsed ? 'px-0' : 'px-2.5', 'pb-1')}>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label={collapsed ? 'Shared links' : undefined}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-(--radius) border-none bg-transparent text-[13px] font-medium text-(--text-secondary) transition-all duration-200 ease-in-out hover:bg-(--surface)',
            collapsed ? 'mx-auto size-9 justify-center p-0' : 'justify-start px-3 py-2',
          )}
        >
          <Link2 size={15} strokeWidth={2} className="shrink-0" aria-hidden />
          {!collapsed && <span className="truncate transition-opacity duration-200 ease-in-out">Shared</span>}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <div className="px-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse my-0.5 mx-1.5 h-7 rounded-(--radius) bg-[color-mix(in_srgb,var(--border)_60%,transparent)]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          !collapsed && (
            <div className="px-4 py-6 text-center text-xs text-(--text-secondary)">No generations yet</div>
          )
        ) : (
          <>
            {renderSection('Today', groups.today)}
            {renderSection('This week', groups.thisWeek)}
            {renderSection('Earlier', groups.earlier)}
          </>
        )}
      </div>

      <div
        className={cn(
          'shrink-0 border-t border-(--border) transition-opacity duration-200 ease-in-out',
          collapsed ? 'flex justify-center px-0 py-2.5' : 'flex flex-col items-center px-3.5 py-3',
        )}
      >
        <div
          className={cn(
            'hidden size-5 items-center justify-center rounded-[5px] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-(--accent)',
            collapsed ? 'flex' : '',
          )}
        >
          <QuillPenIcon className="size-2.5" />
        </div>
        <div
          className={cn(
            'text-center text-[11px] leading-normal text-(--text-muted) transition-opacity duration-200 ease-in-out',
            collapsed ? 'hidden' : 'w-full',
          )}
        >
          <span className="font-semibold text-(--text-secondary)">Quill</span>
          <span> · Smart Content Assistant</span>
          <br />
          © 2026 Quill. All rights reserved.
        </div>
      </div>

      <Dialog
        open={!!pendingDelete}
        onOpenChange={open => {
          if (!open && !deleteInProgress) {
            setPendingDelete(null)
          }
        }}
      >
        <DialogContent
          showCloseButton={!deleteInProgress}
          className="gap-0 overflow-hidden border border-(--border) bg-(--bg) p-0 text-(--text-primary) shadow-[var(--shadow-md)] sm:max-w-[420px]"
        >
          <div className="px-5 pt-5 pb-4">
            <DialogTitle className="text-[17px] font-semibold leading-snug tracking-[-0.02em] text-(--text-primary)">
              Delete this generation?
            </DialogTitle>
            <DialogDescription className="mt-2 text-[13px] leading-relaxed text-(--text-secondary)">
              It will be removed from your history. You can’t undo this action.
            </DialogDescription>
            {pendingDelete && (
              <div className="mt-4 space-y-2">
                <span className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--accent)">
                  {getGenerationLabel(pendingDelete.generation_type)}
                </span>
                <p className="line-clamp-4 rounded-lg border border-(--border) bg-(--surface) p-3 text-[12.5px] leading-relaxed text-(--text-secondary)">
                  {pendingDelete.input_text}
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-(--border) bg-[color-mix(in_srgb,var(--surface)_40%,var(--bg))] px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={deleteInProgress}
              onClick={() => setPendingDelete(null)}
              className="cursor-pointer rounded-lg border border-(--border) bg-(--bg) px-4 py-2.5 text-[13px] font-medium text-(--text-secondary) transition-all duration-200 ease-in-out hover:bg-(--surface) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteInProgress}
              onClick={() => void handleConfirmDelete()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[color-mix(in_srgb,var(--destructive)_14%,transparent)] px-4 py-2.5 text-[13px] font-semibold text-(--destructive) transition-all duration-200 ease-in-out hover:bg-[color-mix(in_srgb,var(--destructive)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.2} aria-hidden />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <SharedSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </aside>
  )
}
