'use client'

import Link from 'next/link'
import { Home, LogIn } from 'lucide-react'
import { QuillPenIcon } from '@/components/icons/QuillPenIcon'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'

const primaryBtnClass = cn(
  'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none px-5 py-3.5 text-[14px] font-semibold text-(--accent-foreground)',
  'bg-(--accent) shadow-(--shadow-accent-sm) transition-all duration-200 ease-in-out',
  'hover:bg-(--accent-hover) hover:shadow-(--shadow-accent-md) hover:-translate-y-px active:translate-y-0',
  'sm:w-auto sm:min-w-[200px]',
)

const secondaryBtnClass = cn(
  'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--bg) px-5 py-3.5 text-[14px] font-medium text-(--text-secondary)',
  'transition-all duration-200 ease-in-out',
  'hover:border-(--text-muted) hover:bg-(--surface) hover:text-(--text-primary)',
  'sm:w-auto sm:min-w-[160px]',
)

export function NotFoundView() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-(--bg-secondary) text-(--text-primary)">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[20%] -top-[10%] h-[min(55vh,480px)] w-[min(90vw,560px)] rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] blur-[100px]" />
        <div className="absolute -bottom-[25%] -right-[15%] h-[min(50vh,420px)] w-[min(85vw,480px)] rounded-full bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] blur-[90px]" />
        <div
          className={cn(
            'absolute inset-0 opacity-[0.35] dark:opacity-[0.2]',
            'bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--border)_52%,transparent)_1px,transparent_1px)] bg-size-[28px_28px]',
          )}
        />
      </div>

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle variant="bordered" />
      </div>

      <main className="relative z-1 flex min-h-dvh flex-col items-center justify-center px-5 py-16 sm:px-8 sm:py-20">
        <div className="dashboard-welcome-animate w-full max-w-[520px] rounded-3xl border border-(--border) bg-(--bg) p-8 shadow-(--shadow-md) sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                'dashboard-orb-bob dashboard-welcome-orb-bg mb-7 flex size-[56px] items-center justify-center rounded-[14px] text-(--accent-foreground) shadow-(--shadow-welcome-orb)',
                'sm:mb-8 sm:size-[64px] sm:rounded-[16px]',
              )}
            >
              <QuillPenIcon className="size-7 sm:size-8" />
            </div>

            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-(--text-muted) sm:text-[11px]">
              Error 404
            </p>

            <h1
              className={cn(
                'mb-3 max-w-[18ch] font-[family-name:var(--font-instrument),ui-serif,serif] text-[clamp(2rem,6.5vw,2.75rem)] font-normal leading-[1.08] tracking-[-0.03em] text-(--text-primary)',
                'sm:max-w-none sm:text-[clamp(2.25rem,5vw,3rem)]',
              )}
            >
              This page{' '}
              <span className="bg-[linear-gradient(135deg,var(--accent-lt)_0%,var(--accent)_55%,var(--accent-hover)_100%)] bg-clip-text text-transparent">
                drifted away
              </span>
            </h1>

            <p className="mb-9 max-w-[34ch] text-[14px] leading-relaxed text-(--text-secondary) sm:mb-10 sm:text-[15px]">
              The link may be broken or the page may have moved. Return to Quill and pick up where you left off.
            </p>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Link href="/" className={primaryBtnClass}>
                <Home className="size-[17px] shrink-0 opacity-95" strokeWidth={2} aria-hidden />
                Back to home
              </Link>
              <Link href="/login" className={secondaryBtnClass}>
                <LogIn className="size-[17px] shrink-0" strokeWidth={2} aria-hidden />
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <p className="dashboard-welcome-animate mt-8 text-center text-[12px] text-(--text-muted) sm:mt-10">
          <span className="font-semibold text-(--text-secondary)">Quill</span>
          <span className="mx-1.5 text-(--border)">·</span>
          Smart Content Assistant
        </p>
      </main>
    </div>
  )
}
