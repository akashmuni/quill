'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function AccountMenu({ userEmail }: { userEmail: string | null }) {
  const router = useRouter()
  const initial = userEmail?.trim().charAt(0).toUpperCase() ?? '?'
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function openDeleteDialog() {
    setPopoverOpen(false)
    setAlertOpen(true)
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Could not delete your account. Try again.')
        return
      }
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      toast.error('Could not delete your account. Try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          type="button"
          className={cn(
            'flex max-w-[220px] cursor-pointer items-center gap-1.5 rounded-full border border-(--border) bg-(--bg) py-1.5 pl-2 pr-2.5 text-left text-xs font-medium text-(--text-secondary)',
            'transition-all duration-200 ease-in-out hover:border-(--text-muted) hover:bg-(--surface)',
            'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--accent-ring)',
          )}
          title={userEmail ?? undefined}
        >
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[9px] font-bold text-(--accent)"
            aria-hidden
          >
            {initial}
          </span>
          {userEmail ? (
            <span className="min-w-0 truncate">{userEmail}</span>
          ) : (
            <span className="text-(--text-muted)">Signed in</span>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          className={cn(
            'max-w-[240px] w-[min(calc(100vw-2rem),240px)] gap-0 overflow-hidden rounded-xl border border-(--border) bg-(--bg) p-0',
            'text-(--text-primary) shadow-(--shadow-md)',
          )}
        >
          <div className="p-3">
            <div className="flex items-center gap-2">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[10px] font-bold text-(--accent)"
                aria-hidden
              >
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-all text-[13px] font-medium leading-snug text-(--text-primary)">
                  {userEmail ?? 'Signed in'}
                </p>
                {userEmail ? (
                  <p className="text-[11px] leading-normal text-(--text-muted)">
                    You&apos;re signed in to Quill.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="my-1 h-px bg-(--border)" aria-hidden />
          <div className="px-1 pb-1.5">
            <button
              type="button"
              onClick={openDeleteDialog}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-(--radius) px-3 py-2 text-left text-[13px] font-medium text-(--destructive)',
                'transition-colors duration-200 ease-in-out hover:bg-[color-mix(in_srgb,var(--destructive)_8%,transparent)]',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--accent-ring) focus-visible:ring-inset',
              )}
            >
              <Trash2 size={13} strokeWidth={2} className="shrink-0" aria-hidden />
              Delete my account
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={alertOpen}
        onOpenChange={open => {
          if (!deleting) setAlertOpen(open)
        }}
      >
        <AlertDialogContent
          className={cn(
            'gap-0 overflow-hidden border border-(--border) bg-(--bg) p-0 text-(--text-primary)',
            'shadow-(--shadow-md) sm:max-w-[440px]',
          )}
        >
          <div className="border-b border-(--border) bg-[color-mix(in_srgb,var(--surface)_35%,var(--bg))] px-5 pt-5 pb-4">
            <AlertDialogHeader className="gap-0 text-left sm:place-items-start sm:text-left">
              <div className="flex items-start gap-3.5">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-[14px] text-(--accent-foreground) shadow-[0_6px_24px_color-mix(in_srgb,var(--destructive)_32%,transparent)]"
                  style={{
                    background:
                      'linear-gradient(135deg, color-mix(in srgb, var(--destructive) 72%, white) 0%, var(--destructive) 100%)',
                  }}
                  aria-hidden
                >
                  <Trash2 size={22} strokeWidth={1.85} />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                  <AlertDialogTitle className="text-[18px] font-semibold leading-tight tracking-[-0.02em] text-(--text-primary)">
                    Delete your account?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[13px] leading-relaxed text-(--text-secondary)">
                    This will permanently delete your account and all your generated content. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
          </div>

          <div className="px-5 py-4">
            <p className="rounded-2xl border border-dashed border-(--border) bg-(--bg-secondary) px-3.5 py-3 text-center text-[12.5px] leading-relaxed text-(--text-secondary)">
              If you continue, you will be signed out and your data will be removed from our servers.
            </p>
          </div>

          <AlertDialogFooter
            className={cn(
              'mx-0! mb-0! flex flex-col gap-2 rounded-none border-t border-(--border)',
              'bg-[color-mix(in_srgb,var(--surface)_40%,var(--bg))] px-5 py-4 sm:flex-col sm:justify-stretch',
            )}
          >
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleConfirmDelete()}
              className={cn(
                'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none py-3 text-[13px] font-semibold text-(--accent-foreground)',
                'transition-all duration-200 ease-in-out',
                'bg-(--destructive) shadow-[0_2px_10px_color-mix(in_srgb,var(--destructive)_38%,transparent)]',
                'hover:opacity-92 hover:shadow-[0_4px_14px_color-mix(in_srgb,var(--destructive)_42%,transparent)] hover:-translate-y-px active:translate-y-0',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0',
              )}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.2} aria-hidden />
                  Deleting…
                </>
              ) : (
                'Delete my account'
              )}
            </button>
            <AlertDialogCancel
              disabled={deleting}
              className={cn(
                'w-full cursor-pointer rounded-xl border border-(--border) bg-(--bg) py-2.5 text-[13px] font-medium',
                'text-(--text-secondary) transition-colors duration-200',
                'hover:bg-(--surface) hover:text-(--text-primary)',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
