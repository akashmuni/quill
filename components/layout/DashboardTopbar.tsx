'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Menu, X } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'
import { AccountMenu } from './AccountMenu'
import { cn } from '@/lib/utils'

export function DashboardTopbar({
  userEmail,
  mobileNavOpen,
  onToggleMobileNav,
}: {
  userEmail: string | null
  mobileNavOpen: boolean
  onToggleMobileNav: () => void
}) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className={cn(
        'relative z-[45] flex h-14 shrink-0 items-center justify-between gap-2 border-b border-(--border) bg-(--bg) px-3 pl-3 sm:px-5 sm:pl-6',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onToggleMobileNav}
          aria-expanded={mobileNavOpen}
          aria-controls="dashboard-sidebar"
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-(--radius) border border-(--border) bg-(--bg) text-(--text-secondary) transition-all duration-200 ease-in-out hover:border-(--text-muted) hover:bg-(--surface) hover:text-(--text-primary) lg:hidden"
        >
          {mobileNavOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
        </button>
        <span className="min-w-0 truncate text-sm font-semibold tracking-[-0.2px] text-(--text-primary)">
          Smart Content Assistant
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <AccountMenu userEmail={userEmail} />
        <div className="mx-0.5 h-5 w-px shrink-0 bg-(--border)" aria-hidden />
        <ThemeToggle variant="bordered" />
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out"
          className="flex size-8 cursor-pointer items-center justify-center rounded-(--radius) border border-(--border) bg-(--bg) text-(--text-muted) transition-all duration-200 ease-in-out hover:border-(--text-muted) hover:bg-(--surface) hover:text-(--text-secondary)"
        >
          <LogOut size={15} strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
