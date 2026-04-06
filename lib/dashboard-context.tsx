'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useHistory } from '@/hooks/use-history'
import type { Generation } from '@/types'

type DashboardContextType = {
  viewingGeneration: Generation | null
  setViewingGeneration: (g: Generation | null) => void
  clearSelection: () => void
  /** Id of the most recent API output; drives sidebar active state when not viewing history. */
  latestGeneratedId: string | null
  setLatestGeneratedId: (id: string | null) => void
  startNewSession: () => void
  registerNewSessionCleanup: (fn: () => void) => () => void
  /** Called after a history item is successfully deleted (sidebar). */
  registerAfterHistoryDelete: (fn: (id: string) => void) => () => void
  notifyHistoryItemDeleted: (id: string) => void
  /** Merge fields into a generation everywhere it appears (history, selection). Notifies listeners (e.g. live output). */
  patchGeneration: (id: string, patch: Partial<Generation>) => void
  registerAfterGenerationPatch: (fn: (id: string, patch: Partial<Generation>) => void) => () => void
  items: Generation[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  loadMore: () => void
  deleteItem: (id: string) => Promise<boolean>
  prependItem: (generation: Generation) => void
}

const DashboardContext = createContext<DashboardContextType>({
  viewingGeneration: null,
  setViewingGeneration: () => {},
  clearSelection: () => {},
  latestGeneratedId: null,
  setLatestGeneratedId: () => {},
  startNewSession: () => {},
  registerNewSessionCleanup: () => () => {},
  registerAfterHistoryDelete: () => () => {},
  notifyHistoryItemDeleted: () => {},
  patchGeneration: () => {},
  registerAfterGenerationPatch: () => () => {},
  items: [],
  isLoading: true,
  isLoadingMore: false,
  hasMore: false,
  loadMore: () => {},
  deleteItem: async () => false,
  prependItem: () => {},
})

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [viewingGeneration, setViewingGeneration] = useState<Generation | null>(null)
  const [latestGeneratedId, setLatestGeneratedId] = useState<string | null>(null)
  const history = useHistory()
  const newSessionCallbacksRef = useRef(new Set<() => void>())
  const afterHistoryDeleteRef = useRef(new Set<(id: string) => void>())
  const afterGenerationPatchRef = useRef(
    new Set<(id: string, patch: Partial<Generation>) => void>(),
  )

  function clearSelection() {
    setViewingGeneration(null)
  }

  const registerNewSessionCleanup = useCallback((fn: () => void) => {
    newSessionCallbacksRef.current.add(fn)
    return () => {
      newSessionCallbacksRef.current.delete(fn)
    }
  }, [])

  const registerAfterHistoryDelete = useCallback((fn: (id: string) => void) => {
    afterHistoryDeleteRef.current.add(fn)
    return () => {
      afterHistoryDeleteRef.current.delete(fn)
    }
  }, [])

  const notifyHistoryItemDeleted = useCallback((id: string) => {
    afterHistoryDeleteRef.current.forEach(f => {
      try {
        f(id)
      } catch {
        /* ignore */
      }
    })
  }, [])

  const registerAfterGenerationPatch = useCallback(
    (fn: (id: string, patch: Partial<Generation>) => void) => {
      afterGenerationPatchRef.current.add(fn)
      return () => {
        afterGenerationPatchRef.current.delete(fn)
      }
    },
    [],
  )

  const patchGeneration = useCallback(
    (id: string, patch: Partial<Generation>) => {
      history.patchItem(id, patch)
      setViewingGeneration(vg => (vg?.id === id ? { ...vg, ...patch } : vg))
      afterGenerationPatchRef.current.forEach(f => {
        try {
          f(id, patch)
        } catch {
          /* ignore */
        }
      })
    },
    [history.patchItem],
  )

  const startNewSession = useCallback(() => {
    setViewingGeneration(null)
    setLatestGeneratedId(null)
    newSessionCallbacksRef.current.forEach(f => {
      try {
        f()
      } catch {
        /* ignore subscriber errors */
      }
    })
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        viewingGeneration,
        setViewingGeneration,
        clearSelection,
        latestGeneratedId,
        setLatestGeneratedId,
        startNewSession,
        registerNewSessionCleanup,
        registerAfterHistoryDelete,
        notifyHistoryItemDeleted,
        patchGeneration,
        registerAfterGenerationPatch,
        items: history.items,
        isLoading: history.isLoading,
        isLoadingMore: history.isLoadingMore,
        hasMore: history.hasMore,
        loadMore: history.loadMore,
        deleteItem: history.deleteItem,
        prependItem: history.prependItem,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  return useContext(DashboardContext)
}
