'use client'

import { useState, useEffect } from 'react'
import type { Generation } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Copy, Check, Link2, Clock, Share2, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn, getShareUrl } from '@/lib/utils'

type ExpiryOption = '1h' | '24h' | '7d' | null

function getExpiresInFromDate(expiresAt: string | null): ExpiryOption {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  const hours = diff / (1000 * 60 * 60)
  if (hours <= 1.5) return '1h'
  if (hours <= 25) return '24h'
  if (hours <= 170) return '7d'
  return null
}

const EXPIRY_CHIP_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: null, label: 'Never' },
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
]

function ExpiryChipGroup({
  value,
  onChange,
}: {
  value: ExpiryOption
  onChange: (v: ExpiryOption) => void
}) {
  const chipBase = cn(
    'cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-200 ease-in-out',
    'border-(--border) bg-(--bg) text-(--text-secondary)',
    'hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-(--accent)',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--accent-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-secondary)',
  )
  const chipSelected = cn(
    'border-(--accent) bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] font-semibold text-(--accent)',
    'shadow-(--shadow-accent-sm)',
  )

  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="When the share link expires"
    >
      {EXPIRY_CHIP_OPTIONS.map(opt => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value ?? 'never'}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(chipBase, selected && chipSelected)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function SettingRow({
  icon: Icon,
  title,
  description,
  descriptionClassName,
  control,
  layout = 'inline',
}: {
  icon: LucideIcon
  title: string
  description: string
  descriptionClassName?: string
  control: React.ReactNode
  /** `stacked`: label uses full width; control below (avoids squeezing copy next to a wide select). */
  layout?: 'inline' | 'stacked'
}) {
  if (layout === 'stacked') {
    return (
      <div className="border-b border-(--border) px-4 py-3.5 last:border-b-0">
        <div className="flex gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--bg-secondary) text-(--accent)">
            <Icon size={16} strokeWidth={1.85} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[13px] font-semibold leading-snug text-(--text-primary)">{title}</p>
            <p
              className={cn(
                'mt-0.5 text-[12px] leading-relaxed text-(--text-secondary)',
                descriptionClassName,
              )}
            >
              {description}
            </p>
          </div>
        </div>
        <div className="mt-3 min-w-0 pl-12 pr-1">{control}</div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b border-(--border) px-4 py-3.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--bg-secondary) text-(--accent)">
          <Icon size={16} strokeWidth={1.85} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[13px] font-semibold leading-snug text-(--text-primary)">{title}</p>
          <p
            className={cn(
              'mt-0.5 text-[12px] leading-relaxed text-(--text-secondary)',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0 pt-1">{control}</div>
    </div>
  )
}

export function ShareDialog({
  generation,
  open,
  onClose,
  onUpdate,
}: {
  generation: Generation | null
  open: boolean
  onClose: () => void
  onUpdate: (updated: Generation) => void
}) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [expiresIn, setExpiresIn] = useState<ExpiryOption>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (generation) {
      setIsEnabled(generation.is_shared ?? false)
      setExpiresIn(getExpiresInFromDate(generation.share_expires_at))
      setShareUrl(generation.share_id ? getShareUrl(generation.share_id) : null)
      setCopied(false)
    }
  }, [generation])

  function handleCopy() {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSave() {
    if (!generation) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/share/${generation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isShared: isEnabled,
          isPublic: isEnabled,
          expiresIn,
        }),
      })

      if (!response.ok) {
        toast.error('Could not save share settings')
        return
      }

      const json = await response.json()
      setShareUrl(json.shareUrl)
      toast.success('Share settings saved')
      onUpdate({
        ...generation,
        is_shared: isEnabled,
        is_public: isEnabled,
        share_id: json.shareId,
        share_expires_at: json.shareExpiresAt ?? null,
      })
    } catch {
      toast.error('Could not save share settings')
    } finally {
      setIsSaving(false)
    }
  }

  const copyBtnClass = cn(
    'flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--bg) px-3 py-2.5 text-[12.5px] font-semibold text-(--text-secondary) transition-all duration-200 ease-in-out',
    'hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-(--accent)',
    copied && 'border-[color-mix(in_srgb,var(--success)_35%,transparent)] text-(--success) hover:border-[color-mix(in_srgb,var(--success)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--success)_8%,transparent)] hover:text-(--success)',
  )

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent
        showCloseButton={!isSaving}
        className={cn(
          'gap-0 overflow-hidden border border-(--border) bg-(--bg) p-0 text-(--text-primary)',
          'sm:max-w-[440px] shadow-(--shadow-md)',
        )}
      >
        <div className="border-b border-(--border) bg-[color-mix(in_srgb,var(--surface)_35%,var(--bg))] px-5 pt-5 pb-4">
          <DialogHeader className="gap-0 text-left">
            <div className="flex items-start gap-3.5">
              <div
                className="flex size-[48px] shrink-0 items-center justify-center rounded-[14px] text-(--accent-foreground) shadow-(--shadow-welcome-orb)"
                style={{
                  background: 'var(--welcome-gradient)',
                }}
              >
                <Link2 size={22} strokeWidth={1.85} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <DialogTitle className="text-[18px] font-semibold leading-tight tracking-[-0.02em] text-(--text-primary)">
                  Share this result
                </DialogTitle>
                <DialogDescription className="text-[13px] leading-relaxed text-(--text-secondary)">
                  Create a read-only link others can open without signing in. You control visibility and
                  expiry.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-5 py-4">
          <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--bg-secondary) shadow-(--shadow-sm)">
            <SettingRow
              icon={Share2}
              title="Share with a link"
              description="Anyone with the link can view this result"
              descriptionClassName="text-[11.5px] text-(--text-muted)"
              control={<Switch checked={isEnabled} onCheckedChange={setIsEnabled} />}
            />
            {isEnabled && (
              <SettingRow
                layout="stacked"
                icon={Clock}
                title="Link expires"
                description="After this time, the link stops working until you save again."
                control={<ExpiryChipGroup value={expiresIn} onChange={setExpiresIn} />}
              />
            )}
          </div>

          {isEnabled && shareUrl && (
            <div className="mt-4 space-y-2">
              <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">
                Share URL
              </p>
              <div className="flex items-stretch gap-2">
                <div className="relative min-w-0 flex-1">
                  <input
                    readOnly
                    value={shareUrl}
                    aria-label="Share link"
                    className="h-11 w-full truncate rounded-2xl border border-(--border) bg-(--bg-secondary) px-3.5 pr-2 font-mono text-[11.5px] text-(--text-primary) outline-none ring-0 transition-[border-color,box-shadow] duration-200 focus-visible:border-[color-mix(in_srgb,var(--accent)_30%,transparent)] focus-visible:shadow-[0_0_0_3px_var(--accent-ring)]"
                  />
                </div>
                <button type="button" onClick={handleCopy} aria-label="Copy share link" className={copyBtnClass}>
                  {copied ? <Check size={15} strokeWidth={2.2} /> : <Copy size={15} strokeWidth={2.2} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {isEnabled && !shareUrl && (
            <p className="mt-4 rounded-xl border border-dashed border-(--border) bg-(--bg-secondary) px-3.5 py-3 text-center text-[12.5px] text-(--text-secondary)">
              Save once to create your link. You can copy it anytime after that.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-(--border) bg-[color-mix(in_srgb,var(--surface)_40%,var(--bg))] px-5 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none py-3 text-[13px] font-semibold text-(--accent-foreground) transition-all duration-200 ease-in-out',
              'bg-(--accent) shadow-(--shadow-accent-sm)',
              'hover:bg-(--accent-hover) hover:shadow-(--shadow-accent-md) hover:-translate-y-px active:translate-y-0',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0',
            )}
          >
            {isSaving ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-(--accent-foreground) border-t-transparent" />
                Saving…
              </>
            ) : (
              'Save settings'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer rounded-xl border border-(--border) bg-(--bg) py-2.5 text-[13px] font-medium text-(--text-secondary) transition-colors duration-200 hover:bg-(--surface) hover:text-(--text-primary) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
