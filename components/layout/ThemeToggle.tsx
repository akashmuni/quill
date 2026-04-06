'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({
  className,
  variant = 'ghost',
  iconSize,
}: {
  className?: string
  variant?: 'ghost' | 'bordered'
  /** Lucide icon pixel size (default: 20 ghost, 15 bordered). */
  iconSize?: number
}) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted gate for next-themes hydration
    setMounted(true)
  }, [])

  const defaultIcon = iconSize ?? (variant === 'bordered' ? 15 : 20)

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          'flex shrink-0 cursor-default items-center justify-center rounded-(--radius)',
          'h-8 w-8',
          variant === 'bordered'
            ? 'border border-(--border) bg-(--bg) text-(--text-secondary)'
            : 'border-none bg-transparent text-(--text-secondary)',
          className,
        )}
      >
        <Moon size={defaultIcon} strokeWidth={2} className="opacity-70" />
      </button>
    )
  }

  const isDark = (resolvedTheme ?? theme) === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={cn(
        'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-(--radius) transition-all duration-200 ease-in-out',
        '[&_svg]:shrink-0 [&_svg]:text-current',
        variant === 'bordered'
          ? 'border border-(--border) bg-(--bg) text-(--text-secondary) hover:border-(--text-muted) hover:bg-(--surface) hover:text-(--text-primary)'
          : 'border-none bg-transparent text-(--text-secondary) hover:bg-(--surface) hover:text-(--text-primary)',
        className,
      )}
    >
      {isDark ? (
        <Sun size={defaultIcon} strokeWidth={2} className="text-current" aria-hidden />
      ) : (
        <Moon size={defaultIcon} strokeWidth={2} className="text-current" aria-hidden />
      )}
    </button>
  )
}
