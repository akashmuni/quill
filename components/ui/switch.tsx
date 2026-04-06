"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

/**
 * High-contrast pill switch (accent when on, muted track + border when off).
 * Avoids shadcn `primary` / `input` tokens that read as white-on-white in this app.
 */
function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-[background-color,border-color] duration-200 outline-none",
        "border-(--border) bg-(--bg-secondary) data-checked:border-(--accent) data-checked:bg-(--accent)",
        "focus-visible:ring-[3px] focus-visible:ring-(--accent-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)",
        "data-disabled:cursor-not-allowed data-disabled:opacity-45",
        "aria-invalid:border-(--destructive) aria-invalid:data-checked:border-(--destructive) aria-invalid:data-checked:bg-(--destructive)",
        "data-[size=default]:h-[22px] data-[size=default]:w-[40px] data-[size=default]:px-[2px]",
        "data-[size=sm]:h-[18px] data-[size=sm]:w-[34px] data-[size=sm]:px-[2px]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.22)] ring-1 ring-black/10 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "dark:bg-zinc-100 dark:shadow-[0_1px_4px_rgba(0,0,0,0.55)] dark:ring-white/15",
          "group-data-[size=default]/switch:size-[14px] group-data-[size=default]/switch:data-unchecked:translate-x-0",
          "group-data-[size=default]/switch:data-checked:translate-x-[18px]",
          "group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:data-unchecked:translate-x-0",
          "group-data-[size=sm]/switch:data-checked:translate-x-[14px]",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
