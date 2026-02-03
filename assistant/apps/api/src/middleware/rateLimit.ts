import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { Redis } from '@upstash/redis'
import { RATE_LIMITS } from '@assistant/shared'

// Initialize Redis client (optional - graceful degradation if not configured)
let redis: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch {
  console.warn('Redis not configured, rate limiting disabled')
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

/**
 * Rate limiting middleware using sliding window
 */
export function rateLimitMiddleware(config?: Partial<RateLimitConfig>) {
  const { windowMs = 60_000, maxRequests = RATE_LIMITS.messagesPerMinute } = config ?? {}

  return async (c: Context, next: Next) => {
    // Skip rate limiting if Redis is not configured
    if (!redis) {
      return next()
    }

    const user = c.get('user')
    const identifier = user?.id ?? c.req.header('x-forwarded-for') ?? 'anonymous'

    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - windowMs

    try {
      // Use Redis sorted set for sliding window
      const multi = redis.pipeline()

      // Remove old entries
      multi.zremrangebyscore(key, 0, windowStart)

      // Add current request
      multi.zadd(key, { score: now, member: `${now}` })

      // Count requests in window
      multi.zcard(key)

      // Set expiry
      multi.expire(key, Math.ceil(windowMs / 1000))

      const results = await multi.exec()
      const requestCount = results[2] as number

      // Set rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount).toString())
      c.header('X-RateLimit-Reset', (now + windowMs).toString())

      if (requestCount > maxRequests) {
        throw new HTTPException(429, {
          message: "You're sending messages too quickly. Please wait a moment.",
        })
      }
    } catch (error) {
      // Log error but don't block request if rate limiting fails
      if (error instanceof HTTPException) throw error
      console.error('Rate limiting error:', error)
    }

    await next()
  }
}

/**
 * Check if user has exceeded their tier's message limit for the billing period
 */
export async function checkTierLimit(c: Context, next: Next) {
  const user = c.get('user')
  if (!user) {
    return next()
  }

  // TODO: Implement tier limit checking against usage table
  // For now, pass through
  await next()
}
