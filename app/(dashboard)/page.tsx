'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  AlignLeft,
  PenLine,
  MessageCircle,
  List,
  Send,
  Loader2,
  Info,
} from 'lucide-react'
import { useGenerate } from '@/hooks/use-generate'
import { useDashboard } from '@/lib/dashboard-context'
import { OutputCard } from '@/components/generator/OutputCard'
import { ShareDialog } from '@/components/share/ShareDialog'
import { QuillPenIcon } from '@/components/icons/QuillPenIcon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Generation, GenerationType } from '@/types'
import { pathWithGenerationQuery } from '@/lib/dashboard-url'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS: {
  type: GenerationType
  label: string
  tooltip: string
  Icon: typeof AlignLeft
}[] = [
  {
    type: 'summary',
    label: 'Summary',
    tooltip: 'Condenses your text into 3–5 clear sentences',
    Icon: AlignLeft,
  },
  {
    type: 'rewrite_professional',
    label: 'Professional',
    tooltip: 'Rewrites in a polished, business-ready tone',
    Icon: PenLine,
  },
  {
    type: 'rewrite_casual',
    label: 'Casual',
    tooltip: 'Rewrites in a natural, conversational tone',
    Icon: MessageCircle,
  },
  {
    type: 'bullets',
    label: 'Key Points',
    tooltip: 'Extracts the most important points as bullet points',
    Icon: List,
  },
]

function DashboardPageInner() {
  const [inputText, setInputText] = useState('')
  const [selectedType, setSelectedType] = useState<GenerationType | null>(null)
  const [shareGeneration, setShareGeneration] = useState<Generation | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { output, isLoading, error, rateLimitInfo, generate, clearOutput, patchOutput } =
    useGenerate()
  const {
    viewingGeneration,
    clearSelection,
    prependItem,
    registerNewSessionCleanup,
    registerAfterHistoryDelete,
    registerAfterGenerationPatch,
    patchGeneration,
    setLatestGeneratedId,
  } = useDashboard()

  const lastPrependedId = useRef<string | null>(null)
  const outputIdRef = useRef<string | null>(null)
  const clearOutputRef = useRef(clearOutput)

  useEffect(() => {
    clearOutputRef.current = clearOutput
  }, [clearOutput])

  useEffect(() => {
    outputIdRef.current = output?.id ?? null
  }, [output?.id])

  useEffect(() => {
    return registerAfterHistoryDelete(deletedId => {
      if (outputIdRef.current === deletedId) {
        clearOutputRef.current()
      }
    })
  }, [registerAfterHistoryDelete])

  useEffect(() => {
    return registerAfterGenerationPatch((id, patch) => {
      patchOutput(id, patch)
    })
  }, [registerAfterGenerationPatch, patchOutput])

  const displayedOutput = viewingGeneration ?? output

  // Only align ?g= when **new** API output lands. Do not key off `displayedOutput` or `searchParams`
  // (that fought the shell’s URL restore and caused replace loops with stale `output` vs `?g=`).
  useEffect(() => {
    const oid = output?.id
    if (!oid) return
    if (searchParams.get('g') === oid) return
    router.replace(pathWithGenerationQuery(pathname, searchParams, oid), { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally when output.id changes only
  }, [output?.id, pathname, router])

  useEffect(() => {
    return registerNewSessionCleanup(() => {
      clearOutputRef.current()
      setLatestGeneratedId(null)
      setInputText('')
      setSelectedType(null)
    })
  }, [registerNewSessionCleanup, setLatestGeneratedId])

  useEffect(() => {
    setLatestGeneratedId(output?.id ?? null)
  }, [output, setLatestGeneratedId])

  /* eslint-disable react-hooks/set-state-in-effect -- sync form fields when user picks a history item */
  useEffect(() => {
    if (viewingGeneration) {
      setInputText(viewingGeneration.input_text)
      setSelectedType(viewingGeneration.generation_type)
    }
  }, [viewingGeneration])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (output && output.id !== lastPrependedId.current) {
      prependItem(output)
      lastPrependedId.current = output.id
    }
  }, [output, prependItem])

  const charCount = inputText.length

  const canGenerate =
    inputText.trim().length >= 10 && selectedType !== null && !isLoading

  function handleGenerate() {
    if (!selectedType || inputText.trim().length < 10 || isLoading) return
    clearSelection()
    if (searchParams.get('g')) {
      router.replace(pathWithGenerationQuery(pathname, searchParams, null), { scroll: false })
    }
    generate(inputText, selectedType)
  }

  const showWelcomeBlock = !displayedOutput

  const typeBtnBase =
    'flex items-center gap-1.5 rounded-full border border-(--border) bg-(--bg) px-3.5 py-1.5 text-[12.5px] font-medium text-(--text-secondary) transition-all duration-200 ease-in-out hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] hover:text-(--accent) disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-(--border) disabled:hover:bg-(--bg) disabled:hover:text-(--text-secondary)'

  const typeBtnSelected =
    'border-(--accent) bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] font-semibold text-(--accent)'

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden pt-6 pb-12 [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent] sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
      <div className="flex w-full max-w-[680px] flex-col gap-4 px-4 sm:gap-5 sm:px-6 lg:px-7">
        {showWelcomeBlock && (
          <div className="dashboard-welcome-animate px-1 pb-1 pt-3 text-center">
            <div className="dashboard-welcome-orb-bg dashboard-orb-bob mx-auto mb-[18px] flex size-[52px] items-center justify-center rounded-[15px] text-(--accent-foreground) shadow-[var(--shadow-welcome-orb)]">
              <QuillPenIcon className="size-6" />
            </div>
            <h1 className="mb-2 text-2xl font-bold leading-[1.15] tracking-[-0.6px] text-(--text-primary)">
              Transform any text,
              <br />
              <span className="text-(--accent)">instantly.</span>
            </h1>
            <p className="mx-auto max-w-[360px] text-sm leading-relaxed text-(--text-secondary)">
              Paste your content, choose a transformation type, then hit Generate.
            </p>
          </div>
        )}

        <div className="dashboard-input-card-animate group overflow-hidden rounded-3xl border border-(--border) bg-(--bg) shadow-[var(--shadow-md)] transition-all duration-200 ease-in-out focus-within:border-[color-mix(in_srgb,var(--accent)_30%,transparent)] focus-within:shadow-[var(--shadow-md),0_0_0_3px_var(--accent-ring)]">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste or type your content here..."
            disabled={isLoading}
            className="min-h-[140px] max-h-[320px] w-full resize-none border-none bg-transparent p-5 pb-3 text-[14.5px] leading-relaxed text-(--text-primary) outline-none placeholder:text-(--text-muted)"
          />
          <div className="flex flex-col gap-2.5 border-t border-(--border) px-3 pb-3 pt-2.5">
            <TooltipProvider>
              <div className="flex flex-wrap gap-2 px-0 pb-0 pt-1">
                {TYPE_OPTIONS.map(({ type, label, tooltip, Icon }) => {
                  const selected = selectedType === type
                  return (
                    <Tooltip key={type}>
                      <TooltipTrigger
                        type="button"
                        disabled={isLoading}
                        onClick={() => setSelectedType(type)}
                        className={cn(typeBtnBase, selected && typeBtnSelected)}
                      >
                        <Icon size={13} strokeWidth={1.8} className="shrink-0" />
                        {label}
                        <Info
                          size={12}
                          strokeWidth={2}
                          className="shrink-0 text-[var(--text-muted)] opacity-60"
                          aria-hidden
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        {tooltip}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
            <div className="flex items-center justify-between px-0 pb-0 pt-0.5">
              <span className="text-[11.5px] text-(--text-muted)">
                {charCount.toLocaleString()} / 5,000
              </span>
              <button
                type="button"
                disabled={!canGenerate}
                onClick={handleGenerate}
                className={cn(
                  'flex items-center gap-2 rounded-lg border-none bg-(--accent) px-4 py-2 text-[13px] font-semibold text-(--accent-foreground) shadow-[var(--shadow-accent-sm)] transition-all duration-200 ease-in-out',
                  'enabled:hover:bg-(--accent-hover) enabled:hover:shadow-[var(--shadow-accent-md)] enabled:hover:-translate-y-px enabled:active:translate-y-0',
                  'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0',
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" strokeWidth={2.2} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send size={14} strokeWidth={2.2} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-[color-mix(in_srgb,var(--destructive)_30%,transparent)] bg-[color-mix(in_srgb,var(--destructive)_6%,transparent)] px-4 py-3 text-[13px] text-(--destructive) transition-all duration-200 ease-in-out">
            {error}
          </div>
        )}

        {displayedOutput && (
          <>
            <OutputCard generation={displayedOutput} onShare={setShareGeneration} />
            {rateLimitInfo !== null && (
              <div className="flex items-center gap-1.5 px-0.5 text-xs text-(--text-muted)">
                <Info size={13} strokeWidth={2} className="shrink-0" aria-hidden />
                <span>{rateLimitInfo.remaining} generations remaining this minute</span>
              </div>
            )}
          </>
        )}
      </div>

      <ShareDialog
        generation={shareGeneration}
        open={!!shareGeneration}
        onClose={() => setShareGeneration(null)}
        onUpdate={updated => {
          setShareGeneration(updated)
          patchGeneration(updated.id, updated)
        }}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 items-center justify-center bg-(--bg-secondary)" aria-hidden>
          <span className="text-sm text-(--text-muted)">Loading…</span>
        </div>
      }
    >
      <DashboardPageInner />
    </Suspense>
  )
}
