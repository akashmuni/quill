'use client'

import { useState, useCallback } from 'react'
import type { Generation, GenerationType, RateLimitInfo } from '@/types'

export function useGenerate() {
  const [output, setOutput] = useState<Generation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null)

  async function generate(input: string, type: GenerationType): Promise<void> {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, type }),
      })

      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') ?? '0', 10)
      const reset = parseInt(response.headers.get('X-RateLimit-Reset') ?? '0', 10)
      setRateLimitInfo({ remaining, reset })

      if (response.status === 429) {
        setError('Rate limit reached. Please wait a moment before trying again.')
        return
      }

      const json = await response.json()

      if (response.ok) {
        setOutput(json.data)
      } else {
        setError(json.error || 'Generation failed')
      }
    } catch {
      setError('Network error. Check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  function clearOutput() {
    setOutput(null)
    setError(null)
  }

  const patchOutput = useCallback((id: string, patch: Partial<Generation>) => {
    setOutput(o => (o?.id === id ? { ...o, ...patch } : o))
  }, [])

  return {
    output,
    isLoading,
    error,
    rateLimitInfo,
    generate,
    clearOutput,
    patchOutput,
  }
}
