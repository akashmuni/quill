'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const btnClass =
  'flex cursor-pointer items-center gap-1.5 rounded-(--radius) border border-(--border) bg-(--bg) px-3 py-1.5 text-xs font-medium text-(--text-secondary) transition-all duration-200 ease-in-out hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-(--accent)'

export function ShareCopyOutputButton({ outputText }: { outputText: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy result'}
      className={cn(btnClass, copied && 'border-[color-mix(in_srgb,var(--success)_35%,transparent)] text-(--success) hover:border-[color-mix(in_srgb,var(--success)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--success)_8%,transparent)] hover:text-(--success)')}
    >
      {copied ? <Check size={13} strokeWidth={1.8} aria-hidden /> : <Copy size={13} strokeWidth={1.8} aria-hidden />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
