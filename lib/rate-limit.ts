import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'quill:ratelimit',
})

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  try {
    const { success, remaining, reset } = await ratelimit.limit(identifier)
    return { success, remaining, reset }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return { success: true, remaining: 10, reset: 0 }
  }
}
