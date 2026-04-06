'use client'

import Link from 'next/link'
import { QuillPenIcon } from '@/components/icons/QuillPenIcon'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'

export function SharePublicHeader({
  showTryQuill,
  sticky = true,
}: {
  showTryQuill?: boolean
  sticky?: boolean
}) {
  return (
    <header
      className={cn(
        'z-20 flex items-center justify-between border-b border-(--border) bg-(--bg)/85 px-6 py-3.5 backdrop-blur-md',
        sticky ? 'sticky top-0' : 'relative',
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 text-[15px] font-bold tracking-[-0.35px] text-(--text-primary) no-underline"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-(--accent) text-(--accent-foreground) shadow-(--shadow-brand-mark)">
          <QuillPenIcon className="size-4" />
        </span>
        Quill
      </Link>
      <div className="flex items-center gap-2">
        {showTryQuill && (
          <Link
            href="/signup"
            className="rounded-xl border border-(--border) bg-(--bg) px-3.5 py-2 text-[12.5px] font-semibold text-(--text-secondary) no-underline transition-all duration-200 hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-(--accent)"
          >
            Try Quill →
          </Link>
        )}
        <ThemeToggle variant="bordered" />
      </div>
    </header>
  )
}
