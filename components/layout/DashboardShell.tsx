'use client'

import { Suspense, useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DashboardProvider, useDashboard } from '@/lib/dashboard-context'
import { pathWithGenerationQuery } from '@/lib/dashboard-url'
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
    },
    [setViewingGeneration, replaceGenerationInUrl],
  )

  const startNewSessionWithUrl = useCallback(() => {
    startNewSession()
    replaceGenerationInUrl(null)
  }, [startNewSession, replaceGenerationInUrl])

  useEffect(() => {
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
    <div className="flex h-screen overflow-hidden bg-(--bg-secondary)">
      <Sidebar
        items={items}
        isLoading={isLoading}
        onSelect={selectGeneration}
        onDelete={handleDelete}
        onNew={startNewSessionWithUrl}
        selectedId={viewingGeneration?.id ?? latestGeneratedId}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar userEmail={userEmail} />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
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
