import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { GenerationType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  return `${datePart} · ${timePart}`
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

/** Sidebar history: time if today, else short date (matches dashboard reference). */
export function formatHistorySidebarTime(dateString: string): string {
  const d = new Date(dateString)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (d >= startToday) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d)
  }
  return formatDateShort(dateString)
}

export function getGenerationLabel(type: GenerationType): string {
  const labels: Record<GenerationType, string> = {
    summary: 'Summary',
    rewrite_professional: 'Professional Rewrite',
    rewrite_casual: 'Casual Rewrite',
    bullets: 'Key Points',
  }
  return labels[type]
}

export function getShareUrl(shareId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return base + '/share/' + shareId
}

export function calculateExpiry(expiresIn: '1h' | '24h' | '7d' | null): Date | null {
  if (expiresIn === null) return null
  const now = new Date()
  const ms: Record<'1h' | '24h' | '7d', number> = {
    '1h':  1 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d':  7 * 24 * 60 * 60 * 1000,
  }
  return new Date(now.getTime() + ms[expiresIn])
}
