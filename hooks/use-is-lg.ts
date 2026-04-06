'use client'

import { useLayoutEffect, useState } from 'react'

const QUERY = '(min-width: 1024px)'

/** True when viewport is Tailwind `lg` (1024px) or wider. */
export function useIsLg() {
  const [isLg, setIsLg] = useState(false)

  useLayoutEffect(() => {
    const m = window.matchMedia(QUERY)
    const update = () => setIsLg(m.matches)
    update()
    m.addEventListener('change', update)
    return () => m.removeEventListener('change', update)
  }, [])

  return isLg
}
