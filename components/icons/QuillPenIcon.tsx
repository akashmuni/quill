/** Pen mark for brand surfaces; color via `currentColor` / parent text token. */
export function QuillPenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M20.707 5.826l-3.535-3.533a1 1 0 00-1.414 0l-12 12a1 1 0 00-.263.464l-1 4.5a1 1 0 001.218 1.218l4.5-1a1 1 0 00.464-.263l12-12a1 1 0 000-1.386zM13 7l3 3L8.5 17.5l-3-3L13 7z"
      />
    </svg>
  )
}
