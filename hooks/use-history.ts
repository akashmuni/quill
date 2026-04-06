'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Generation } from '@/types'

export function useHistory() {
  const [items, setItems] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFirst() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/history?limit=20')
        if (!response.ok) {
          return
        }
        const json = await response.json()
        setItems(json.data)
        setNextCursor(json.nextCursor)
        setHasMore(json.nextCursor !== null)
      } catch {
        // silently fail — history will show empty
      } finally {
        setIsLoading(false)
      }
    }
    fetchFirst()
  }, [])

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const response = await fetch(`/api/history?limit=20&cursor=${encodeURIComponent(nextCursor)}`)
      if (response.ok) {
        const json = await response.json()
        setItems(prev => [...prev, ...json.data])
        setNextCursor(json.nextCursor)
        setHasMore(json.nextCursor !== null)
      }
    } finally {
      setIsLoadingMore(false)
    }
  }, [nextCursor, isLoadingMore])

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    const previousItems = items

    setItems(prev => prev.filter(item => item.id !== id))

    try {
      const response = await fetch(`/api/history/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        setItems(previousItems)
        return false
      }
      return true
    } catch {
      setItems(previousItems)
      return false
    }
  }, [items])

  const prependItem = useCallback((generation: Generation) => {
    setItems(prev => {
      if (prev.some(i => i.id === generation.id)) return prev
      return [generation, ...prev]
    })
  }, [])

  const patchItem = useCallback((id: string, patch: Partial<Generation>) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    deleteItem,
    prependItem,
    patchItem,
  }
}
