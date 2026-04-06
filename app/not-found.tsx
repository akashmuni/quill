import type { Metadata } from 'next'
import { NotFoundView } from '@/components/not-found/NotFoundView'

export const metadata: Metadata = {
  title: 'Page not found · Quill',
  description: 'This page could not be found.',
}

export default function NotFound() {
  return <NotFoundView />
}
