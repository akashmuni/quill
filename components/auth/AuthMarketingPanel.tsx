import { PenLine, Clock, List } from 'lucide-react'

export function AuthMarketingPanel() {
  return (
    <div className="relative hidden min-h-0 w-full min-w-0 flex-col overflow-hidden px-[52px] py-11 lg:flex lg:min-h-screen">
      <div className="auth-marketing-base" aria-hidden />
      <div className="auth-dot-grid-layer" aria-hidden />
      <div className="auth-scanline-layer" aria-hidden />
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />
      <div className="auth-orb auth-orb-3" aria-hidden />
      <div className="auth-marketing-edge" aria-hidden />

      <div className="relative z-2 flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-[11px]">
          <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-(image:--auth-logo-icon-gradient) text-white shadow-(--auth-logo-icon-shadow)">
            <PenLine className="size-[19px]" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-[17px] font-bold leading-none tracking-[-0.4px] text-(--auth-marketing-text)">
              Quill
            </span>
            <span className="text-[9.5px] font-semibold uppercase tracking-[1.2px] text-(--auth-electric-glow) opacity-70">
              Smart Content Assistant
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col pb-2">
          <div className="mb-7 inline-flex w-fit items-center gap-[7px] rounded-full border border-(--auth-badge-border) bg-(--auth-badge-bg) px-2 py-1.5 pr-3.5 text-[11.5px] font-medium tracking-[0.3px] text-(--auth-electric-glow)">
            <span className="size-[7px] shrink-0 animate-[auth-pulse-dot_2.5s_ease-in-out_infinite] rounded-full bg-(--auth-electric-glow) shadow-[0_0_8px_var(--auth-electric-glow)]" />
            AI-powered content transformation
          </div>

          <h1 className="font-[family-name:var(--font-instrument),ui-serif,serif] text-[clamp(38px,4.2vw,56px)] font-normal leading-[1.08] tracking-[-0.5px] text-(--auth-marketing-text)">
            Write less.
            <br />
            <span className="auth-hero-em">Say more.</span>
            <br />
            Every time.
          </h1>

          <p className="mb-11 mt-[22px] max-w-[420px] text-[15.5px] font-normal leading-[1.75] text-(--auth-marketing-text-secondary)">
            Quill transforms your raw text into polished summaries, professional rewrites, and key bullet
            points in seconds. No more staring at a blank page.
          </p>

          <div className="mb-11 flex flex-col gap-2.5">
            <div className="auth-feature-card flex items-center gap-3.5 rounded-(--auth-radius-panel) border border-(--auth-glass-border) bg-(--auth-glass) px-4 py-3.5 backdrop-blur-md transition-[border-color,background-color] duration-300 hover:border-(--auth-electric-border) hover:bg-(--auth-feature-hover-bg)">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-(--auth-feat-icon-border) bg-(--auth-feat-icon-bg)">
                <PenLine className="size-4 stroke-(--auth-electric-glow)" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-px text-[13.5px] font-semibold tracking-[-0.2px] text-(--auth-marketing-text)">
                  Professional rewrites
                </div>
                <div className="text-xs font-normal leading-snug text-(--auth-marketing-text-muted)">
                  Casual → business-ready in one click
                </div>
              </div>
            </div>
            <div className="auth-feature-card flex items-center gap-3.5 rounded-(--auth-radius-panel) border border-(--auth-glass-border) bg-(--auth-glass) px-4 py-3.5 backdrop-blur-md transition-[border-color,background-color] duration-300 hover:border-(--auth-electric-border) hover:bg-(--auth-feature-hover-bg)">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-(--auth-feat-icon-border) bg-(--auth-feat-icon-bg)">
                <Clock className="size-4 stroke-(--auth-electric-glow)" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-px text-[13.5px] font-semibold tracking-[-0.2px] text-(--auth-marketing-text)">
                  Instant summaries
                </div>
                <div className="text-xs font-normal leading-snug text-(--auth-marketing-text-muted)">
                  Get the gist of anything in 3–5 sentences
                </div>
              </div>
            </div>
            <div className="auth-feature-card flex items-center gap-3.5 rounded-(--auth-radius-panel) border border-(--auth-glass-border) bg-(--auth-glass) px-4 py-3.5 backdrop-blur-md transition-[border-color,background-color] duration-300 hover:border-(--auth-electric-border) hover:bg-(--auth-feature-hover-bg)">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-(--auth-feat-icon-border) bg-(--auth-feat-icon-bg)">
                <List className="size-4 stroke-(--auth-electric-glow)" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-px text-[13.5px] font-semibold tracking-[-0.2px] text-(--auth-marketing-text)">
                  Key bullet points
                </div>
                <div className="text-xs font-normal leading-snug text-(--auth-marketing-text-muted)">
                  Extract what matters, discard the noise
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
