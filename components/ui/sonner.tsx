"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

/** CSS variables consumed by Sonner’s styled toasts (see node_modules/sonner/dist/styles.css). */
const quillToasterVars = {
  "--border-radius": "12px",
  "--width": "min(100vw - 2rem, 380px)",
  "--normal-bg": "var(--background)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--text-primary)",
  "--success-bg": "color-mix(in srgb, var(--success) 14%, var(--background))",
  "--success-border": "color-mix(in srgb, var(--success) 42%, var(--border))",
  "--success-text": "color-mix(in srgb, var(--success) 88%, var(--text-primary))",
  "--error-bg": "color-mix(in srgb, var(--destructive) 12%, var(--background))",
  "--error-border": "color-mix(in srgb, var(--destructive) 38%, var(--border))",
  "--error-text": "var(--destructive)",
  "--info-bg": "color-mix(in srgb, var(--accent) 10%, var(--background))",
  "--info-border": "color-mix(in srgb, var(--accent) 32%, var(--border))",
  "--info-text": "var(--accent)",
  "--warning-bg": "color-mix(in srgb, #f59e0b 14%, var(--background))",
  "--warning-border": "color-mix(in srgb, #f59e0b 36%, var(--border))",
  "--warning-text": "color-mix(in srgb, #d97706 70%, var(--text-primary))",
} as React.CSSProperties

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      style={quillToasterVars}
      className={cn(
        "toaster group z-200",
        "[font-family:var(--font-jakarta),system-ui,sans-serif]",
      )}
      toastOptions={{
        classNames: {
          toast: cn(
            "border shadow-(--shadow-md) !rounded-xl",
            "[font-family:var(--font-jakarta),system-ui,sans-serif]",
          ),
          title: "text-[13px] font-semibold leading-snug",
          description: "text-[12px] leading-relaxed opacity-90",
          closeButton:
            "border-(--border) !bg-(--background) !text-(--text-secondary) hover:!bg-(--surface) hover:!text-(--text-primary)",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 shrink-0" strokeWidth={2} aria-hidden />,
        info: <InfoIcon className="size-4 shrink-0" strokeWidth={2} aria-hidden />,
        warning: <TriangleAlertIcon className="size-4 shrink-0" strokeWidth={2} aria-hidden />,
        error: <OctagonXIcon className="size-4 shrink-0" strokeWidth={2} aria-hidden />,
        loading: <Loader2Icon className="size-4 shrink-0 animate-spin" strokeWidth={2} aria-hidden />,
      }}
      {...props}
    />
  )
}

export { Toaster }
