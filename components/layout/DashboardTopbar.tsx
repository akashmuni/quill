'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'
import { AccountMenu } from './AccountMenu'
import { cn } from '@/lib/utils'

export function DashboardTopbar({ userEmail }: { userEmail: string | null }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between border-b border-(--border) bg-(--bg) px-5 pl-6',
      )}
    >
      <span className="text-sm font-semibold tracking-[-0.2px] text-(--text-primary)">
        Smart Content Assistant
      </span>
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
