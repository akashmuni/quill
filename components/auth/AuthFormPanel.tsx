import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export function AuthFormPanel({
  active,
  children,
}: {
  active: 'signin' | 'signup'
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh w-full min-w-0 flex-col bg-[var(--auth-form-panel-bg)] lg:min-h-screen">
      <div className="auth-form-ambient" aria-hidden />

      {/* One hit target (full size-10) — matches primary tab / CTA accent; className merges into hydration placeholder too */}
      <ThemeToggle
        variant="ghost"
        iconSize={19}
        className={cn(
          'absolute right-4 top-5 z-[100] size-10 rounded-(--radius) lg:right-8 lg:top-8',
          'border-none bg-[color-mix(in_srgb,var(--accent)_85%,transparent)] text-(--accent-foreground)',
          'shadow-[var(--auth-tab-active-shadow)]',
          'hover:bg-(--accent-hover) hover:text-(--accent-foreground)',
          'touch-manipulation active:scale-[0.97]',
        )}
      />

      <header className="relative z-10 shrink-0 px-6 pt-5 pb-2 pr-[3.25rem] lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[image:var(--auth-logo-icon-gradient)] text-white shadow-[var(--auth-logo-icon-shadow)]">
            <PenLine className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <span className="block text-[16px] font-bold leading-tight tracking-[-0.35px] text-[var(--auth-marketing-text)]">
              Quill
            </span>
            <span className="block truncate text-[9px] font-semibold uppercase tracking-[1.1px] text-[var(--auth-electric-glow)] opacity-80">
              Smart Content Assistant
            </span>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col justify-center px-6 pb-10 pt-2 lg:overflow-y-auto lg:px-12 lg:py-11 lg:pt-[4.5rem]">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="mb-8 grid grid-cols-2 gap-0.5 rounded-[var(--auth-radius-panel)] border border-[var(--auth-glass-border)] bg-[var(--auth-tabs-track)] p-0.5">
          <Link
            href="/login"
            className={cn(
              'rounded-[9px] py-2.5 px-3 text-center text-[13.5px] font-medium transition-all duration-200',
              active === 'signin'
                ? 'bg-[color-mix(in_srgb,var(--accent)_85%,transparent)] font-semibold text-(--accent-foreground) shadow-[var(--auth-tab-active-shadow)]'
                : 'text-[var(--auth-marketing-text-muted)]',
            )}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(
              'rounded-[9px] py-2.5 px-3 text-center text-[13.5px] font-medium transition-all duration-200',
              active === 'signup'
                ? 'bg-[color-mix(in_srgb,var(--accent)_85%,transparent)] font-semibold text-(--accent-foreground) shadow-[var(--auth-tab-active-shadow)]'
                : 'text-[var(--auth-marketing-text-muted)]',
            )}
          >
            Create account
          </Link>
          </div>
          <div className="animate-[auth-fade-up_0.3s_ease_both]">{children}</div>
        </div>
      </div>
    </div>
  )
}
