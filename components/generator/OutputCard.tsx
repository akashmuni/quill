'use client'

import { useState } from 'react'
import type { Generation } from '@/types'
import { cn, getGenerationLabel, formatDate } from '@/lib/utils'
import { Copy, Link2, Check } from 'lucide-react'

const headerBtnClass =
  'flex cursor-pointer items-center gap-1.5 rounded-(--radius) border border-(--border) bg-(--bg) px-3 py-1.5 text-xs font-medium text-(--text-secondary) transition-all duration-200 ease-in-out hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-(--accent)'

export function OutputCard({
  generation,
  onShare,
  className,
}: {
  generation: Generation
  onShare: (generation: Generation) => void
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(generation.output_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={cn(
        'dashboard-output-animate overflow-hidden rounded-3xl border border-(--border) bg-(--bg) shadow-(--shadow-md)',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-(--border) bg-(--bg-secondary) px-[18px] py-[13px]">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex shrink-0 items-center rounded-full border border-(--accent-ring) bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-(--accent)">
           {getGenerationLabel(generation.generation_type)}
          </span>
          <span className="truncate text-xs text-(--text-muted)">{formatDate(generation.created_at)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={handleCopy} aria-label="Copy output" className={headerBtnClass}>
            {copied ? <Check size={13} strokeWidth={1.8} /> : <Copy size={13} strokeWidth={1.8} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" onClick={() => onShare(generation)} className={headerBtnClass}>
            <Link2 size={13} strokeWidth={1.8} />
            {generation.is_shared && generation.is_public ? 'Sharing' : 'Share'}
          </button>
        </div>
      </div>

      <div className="px-5 py-6 font-(family-name:--font-geist-mono) text-[13.5px] leading-[1.9] text-(--text-primary)">
        {generation.generation_type === 'bullets' ? (
          <ul className="list-none space-y-2 p-0">
            {generation.output_text
              .split('\n')
              .filter(line => line.trim())
              .map((line, i) => (
                <li key={i} className="flex gap-2.5 leading-[1.75]">
                  <span className="shrink-0 text-base leading-[1.55] text-(--accent)">•</span>
                  <span className="min-w-0 flex-1">{line.replace(/^[•\-\*]\s*/, '')}</span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="whitespace-pre-wrap">{generation.output_text}</p>
        )}
      </div>
    </div>
  )
}
