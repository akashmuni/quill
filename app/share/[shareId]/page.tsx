import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { getGenerationLabel, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { GenerationType } from '@/types'
import { SharePublicHeader } from '@/components/share/SharePublicHeader'
import { ShareCopyOutputButton } from '@/components/share/ShareCopyOutputButton'
import { Link2, Lock } from 'lucide-react'

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params

  const supabase = createSupabaseServiceClient()
  const { data: generation, error } = await supabase
    .from('generations')
    .select('*')
    .eq('share_id', shareId)
    .eq('is_shared', true)
    .eq('is_public', true)
    .single()

  const isExpired = generation?.share_expires_at !== null &&
    generation?.share_expires_at !== undefined &&
    new Date(generation.share_expires_at) <= new Date()

  if (error || !generation || isExpired) {
    return (
      <div className="relative min-h-screen bg-(--bg-secondary)">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 45%),
              radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 40%)`,
          }}
        />
        <SharePublicHeader sticky={false} />
        <main className="relative z-10 mx-auto flex max-w-[440px] flex-col items-center px-6 py-20 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-(--border) bg-(--bg) text-(--text-muted) shadow-(--shadow-sm)">
            <Lock size={28} strokeWidth={1.5} aria-hidden />
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-(--text-primary)">
            This link isn’t available
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-(--text-secondary)">
            It may have expired, been turned off, or the address might be incorrect.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center rounded-xl border-none bg-(--accent) px-6 py-3 text-[13px] font-semibold text-(--accent-foreground) shadow-(--shadow-accent-sm) no-underline transition-all duration-200 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent-md) hover:-translate-y-px"
          >
            Create your own with Quill
          </Link>
        </main>
      </div>
    )
  }

  const genType = generation.generation_type as GenerationType
  const isBullets = genType === 'bullets'

  return (
    <div className="min-h-screen bg-(--bg-secondary)">
      <SharePublicHeader showTryQuill />

      <main className="mx-auto max-w-[680px] px-6 py-10 pb-24">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--accent-ring)_80%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-(--accent)">
            <Link2 size={11} strokeWidth={2.2} aria-hidden />
            Shared
          </span>
          <span className="inline-flex items-center rounded-full border border-(--border) bg-(--bg) px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-(--text-secondary)">
            {getGenerationLabel(genType)}
          </span>
          <span className="text-xs text-(--text-muted)">{formatDate(generation.created_at)}</span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-(--border) bg-(--bg) shadow-(--shadow-md)">
          <div className="flex items-center justify-between gap-3 border-b border-(--border) bg-(--bg-secondary) px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-muted)">Result</p>
            <ShareCopyOutputButton outputText={generation.output_text} />
          </div>
          <div className="px-5 py-6">
            <div className="font-(family-name:--font-geist-mono) text-[13.5px] leading-[1.9] text-(--text-primary)">
              {isBullets ? (
                <ul className="list-none space-y-2 p-0">
                  {generation.output_text
                    .split('\n')
                    .filter((line: string) => line.trim())
                    .map((line: string, i: number) => (
                      <li key={i} className="flex gap-2.5 leading-[1.75]">
                        <span className="shrink-0 text-base leading-[1.55] text-(--accent)">•</span>
                        <span className="min-w-0 flex-1">
                          {line.replace(/^[•\-\*]\s*/, '')}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="whitespace-pre-wrap">{generation.output_text}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-(--border) bg-(--bg) px-6 py-8 text-center shadow-(--shadow-sm)">
          <p className="text-[13px] text-(--text-secondary)">Like what you see?</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl border-none bg-(--accent) px-6 py-3 text-[13px] font-semibold text-(--accent-foreground) shadow-(--shadow-accent-sm) no-underline transition-all duration-200 hover:bg-(--accent-hover) hover:shadow-(--shadow-accent-md) hover:-translate-y-px"
          >
            Generate your own →
          </Link>
        </div>

        <p className="mt-8 text-center text-[11px] text-(--text-muted)">
          Shared with Quill · Read-only
        </p>
      </main>
    </div>
  )
}
