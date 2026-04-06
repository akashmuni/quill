'use client'

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DashboardProvider, useDashboard } from '@/lib/dashboard-context'
import { pathWithGenerationQuery } from '@/lib/dashboard-url'
import { useIsLg } from '@/hooks/use-is-lg'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { DashboardTopbar } from './DashboardTopbar'
import type { Generation } from '@/types'

function ShellInner({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail: string | null
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const gParam = searchParams.get('g')
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams
  const viewingIdRef = useRef<string | null>(null)
  const newSessionFiredRef = useRef(false)

  const isLg = useIsLg()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useLayoutEffect(() => {
    if (isLg) setMobileNavOpen(false)
  }, [isLg])

  useEffect(() => {
    if (!mobileNavOpen || isLg) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen, isLg])

  useEffect(() => {
    if (!mobileNavOpen || isLg) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen, isLg])

  const {
    items,
    isLoading,
    deleteItem,
    viewingGeneration,
    latestGeneratedId,
    setLatestGeneratedId,
    clearSelection,
    setViewingGeneration,
    prependItem,
    startNewSession,
    notifyHistoryItemDeleted,
  } = useDashboard()

  viewingIdRef.current = viewingGeneration?.id ?? null

  const replaceGenerationInUrl = useCallback(
    (id: string | null) => {
      const next = pathWithGenerationQuery(pathname, searchParamsRef.current, id)
      router.replace(next, { scroll: false })
    },
    [pathname, router],
  )

  const selectGeneration = useCallback(
    (gen: Generation) => {
      setViewingGeneration(gen)
      replaceGenerationInUrl(gen.id)
      setMobileNavOpen(false)
    },
    [setViewingGeneration, replaceGenerationInUrl],
  )

  const startNewSessionWithUrl = useCallback(() => {
    newSessionFiredRef.current = true
    startNewSession()
    replaceGenerationInUrl(null)
    setMobileNavOpen(false)
  }, [startNewSession, replaceGenerationInUrl])

  useEffect(() => {
    if (newSessionFiredRef.current) {
      if (!gParam) newSessionFiredRef.current = false
      return
    }
    if (!gParam || isLoading) return
    if (viewingGeneration?.id === gParam) return

    const hit = items.find(i => i.id === gParam)
    if (hit) {
      if (viewingIdRef.current !== hit.id) {
        setViewingGeneration(hit)
      }
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/history/${gParam}`)
        if (!res.ok) {
          if (res.status === 404) replaceGenerationInUrl(null)
          return
        }
        const json = await res.json()
        if (cancelled || !json?.data) return
        if (searchParamsRef.current.get('g') !== json.data.id) return
        prependItem(json.data)
        if (viewingIdRef.current === json.data.id) return
        setViewingGeneration(json.data)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    gParam,
    isLoading,
    items,
    viewingGeneration?.id,
    setViewingGeneration,
    prependItem,
    replaceGenerationInUrl,
  ])

  const handleDelete = useCallback(
    async (id: string) => {
      const ok = await deleteItem(id)
      if (!ok) return
      notifyHistoryItemDeleted(id)
      if (viewingGeneration?.id === id) {
        clearSelection()
      }
      if (latestGeneratedId === id) {
        setLatestGeneratedId(null)
      }
      if (searchParamsRef.current.get('g') === id) {
        replaceGenerationInUrl(null)
      }
    },
    [
      deleteItem,
      notifyHistoryItemDeleted,
      viewingGeneration?.id,
      latestGeneratedId,
      clearSelection,
      setLatestGeneratedId,
      replaceGenerationInUrl,
    ],
  )

  return (
    <div className="relative flex h-dvh min-h-0 overflow-hidden bg-(--bg-secondary) lg:h-screen">
      <button
        type="button"
        aria-label="Close navigation menu"
        className={cn(
          'fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileNavOpen(false)}
      />

      <Sidebar
        items={items}
        isLoading={isLoading}
        isLg={isLg}
        mobileNavOpen={mobileNavOpen}
        onMobileNavClose={() => setMobileNavOpen(false)}
        onSelect={selectGeneration}
        onDelete={handleDelete}
        onNew={startNewSessionWithUrl}
        selectedId={viewingGeneration?.id ?? latestGeneratedId}
      />
      <div className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar
          userEmail={userEmail}
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen(o => !o)}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

export function DashboardShell({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail: string | null
}) {
  return (
    <DashboardProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-(--bg-secondary) text-sm text-(--text-muted)">
            Loading…
          </div>
        }
      >
        <ShellInner userEmail={userEmail}>{children}</ShellInner>
      </Suspense>
    </DashboardProvider>
  )
}
