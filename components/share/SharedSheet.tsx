'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Generation, GenerationType } from '@/types'
import { cn, formatDate, getShareUrl } from '@/lib/utils'
import { useDashboard } from '@/lib/dashboard-context'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'

const TYPE_BADGE_LABEL: Record<GenerationType, string> = {
  summary: 'Su',
  rewrite_professional: 'Pr',
  rewrite_casual: 'Ca',
  bullets: 'KP',
}

const TYPE_BADGE_CLASS: Record<GenerationType, string> = {
  summary: 'bg-(--type-sum-bg) text-(--type-sum-text)',
  rewrite_professional: 'bg-(--type-pro-bg) text-(--type-pro-text)',
  rewrite_casual: 'bg-(--type-cas-bg) text-(--type-cas-text)',
  bullets: 'bg-(--type-bul-bg) text-(--type-bul-text)',
}

function SharedRowSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-(--border) py-3 pl-1 pr-1 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-5 w-5 shrink-0 animate-pulse rounded-[5px] bg-[color-mix(in_srgb,var(--border)_60%,transparent)]" />
          <div className="h-4 flex-1 animate-pulse rounded-(--radius) bg-[color-mix(in_srgb,var(--border)_60%,transparent)]" />
        </div>
        <div className="h-3 w-[80%] animate-pulse rounded-(--radius) bg-[color-mix(in_srgb,var(--border)_50%,transparent)]" />
      </div>
      <div className="h-[22px] w-10 shrink-0 animate-pulse rounded-full bg-[color-mix(in_srgb,var(--border)_60%,transparent)]" />
    </div>
  )
}

const copyBtnClass = cn(
  'flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border border-(--border) bg-(--bg) px-2 py-1.5 text-[12px] font-semibold text-(--text-secondary) transition-all duration-200 ease-in-out',
  'hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-(--accent)',
)

const copyBtnCopiedClass =
  'border-[color-mix(in_srgb,var(--success)_35%,transparent)] text-(--success) hover:border-[color-mix(in_srgb,var(--success)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--success)_8%,transparent)] hover:text-(--success)'

export function SharedSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { patchGeneration } = useDashboard()
  const [shared, setShared] = useState<Generation[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setLoading(true)

    fetch('/api/history?limit=100')
      .then(res => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json() as Promise<{ data: Generation[] }>
      })
      .then(json => {
        if (cancelled) return
        setShared(json.data.filter(g => g.is_shared === true))
      })
      .catch(() => {
        if (cancelled) return
        toast.error('Could not load shared links')
        setShared([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) setCopiedId(null)
  }, [open])

  function handleCopyLink(url: string, id: string) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('Link copied to clipboard')
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleTurnOffShare(item: Generation) {
    const snapshot = shared
    const offPatch = {
      is_shared: false,
      is_public: false,
      share_expires_at: null,
    } as const
    const rollbackPatch = {
      is_shared: item.is_shared,
      is_public: item.is_public,
      share_expires_at: item.share_expires_at,
    }

    setShared(prev => prev.filter(g => g.id !== item.id))
    patchGeneration(item.id, offPatch)

    try {
      const res = await fetch(`/api/share/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isShared: false,
          isPublic: false,
          expiresIn: null,
        }),
      })
      if (!res.ok) throw new Error('patch failed')
    } catch {
      setShared(snapshot)
      patchGeneration(item.id, rollbackPatch)
      toast.error('Could not update share settings')
    }
  }

  return (
    <Sheet open={open} onOpenChange={next => !next && onClose()}>
      <SheetContent side="right" showCloseButton className="gap-0 p-0">
        <SheetHeader className="gap-0 border-b border-(--border) bg-[color-mix(in_srgb,var(--surface)_35%,var(--bg))] p-0 text-left">
          <div className="px-5 pt-5 pb-4">
            <SheetTitle className="text-[18px] font-semibold leading-tight tracking-[-0.02em] text-(--text-primary)">
              Shared links
            </SheetTitle>
            <SheetDescription className="mt-1.5 text-[13px] leading-relaxed text-(--text-secondary)">
              Manage your publicly shared results
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex flex-col">
              <SharedRowSkeleton />
              <SharedRowSkeleton />
              <SharedRowSkeleton />
            </div>
          ) : shared.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-4 text-(--text-muted)" aria-hidden>
                <Link2 size={32} strokeWidth={1.75} />
              </div>
              <p className="text-[15px] font-semibold text-(--text-primary)">No shared links</p>
              <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-(--text-secondary)">
                When you share a generation, it will appear here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {shared.map(item => {
                const preview =
                  item.input_text.length > 50 ? `${item.input_text.slice(0, 50)}…` : item.input_text
                const shareUrl = item.share_id ? getShareUrl(item.share_id) : ''

                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 border-b border-(--border) py-3 pl-1 pr-1 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[5px] font-mono text-[10px] font-bold uppercase tracking-[0.2px]',
                            TYPE_BADGE_CLASS[item.generation_type],
                          )}
                        >
                          {TYPE_BADGE_LABEL[item.generation_type]}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-[13px] font-medium leading-snug text-(--text-primary)">
                            {preview}
                          </p>
                          {shareUrl ? (
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="min-w-0 flex-1 truncate font-mono text-[11px] leading-snug text-(--text-muted)">
                                {shareUrl}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(shareUrl, item.id)}
                                aria-label="Copy share link"
                                className={cn(
                                  copyBtnClass,
                                  copiedId === item.id && copyBtnCopiedClass,
                                )}
                              >
                                {copiedId === item.id ? (
                                  <Check size={14} strokeWidth={2.2} aria-hidden />
                                ) : (
                                  <Copy size={14} strokeWidth={2.2} aria-hidden />
                                )}
                                <span className="hidden sm:inline">
                                  {copiedId === item.id ? 'Copied' : 'Copy'}
                                </span>
                              </button>
                            </div>
                          ) : null}
                          {item.share_expires_at ? (
                            <p className="text-[11px] text-(--text-muted)">
                              Expires {formatDate(item.share_expires_at)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      <Switch
                        checked={item.is_shared}
                        onCheckedChange={checked => {
                          if (!checked) void handleTurnOffShare(item)
                        }}
                        aria-label="Sharing enabled"
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
