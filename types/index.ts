export type GenerationType =
  | 'summary'
  | 'rewrite_professional'
  | 'rewrite_casual'
  | 'bullets'

export type Generation = {
  id: string
  user_id: string
  input_text: string
  generation_type: GenerationType
  output_text: string
  share_id: string | null
  is_shared: boolean
  is_public: boolean
  share_expires_at: string | null
  created_at: string
}

// Only safe fields exposed on public share page — never expose user_id
export type GenerationPublic = Pick<
  Generation,
  'id' | 'input_text' | 'generation_type' | 'output_text' | 'created_at'
>

export type ShareSettings = {
  isShared: boolean
  isPublic: boolean
  expiresIn: '1h' | '24h' | '7d' | null
}

export type ApiError = {
  error: string
  code?: string
}

export type ApiSuccess<T> = {
  data: T
}

export type RateLimitInfo = {
  remaining: number
  reset: number
}

export type HistoryPage = {
  data: Generation[]
  nextCursor: string | null
}
