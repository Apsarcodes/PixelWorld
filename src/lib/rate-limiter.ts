/**
 * In-Memory Sliding Window Rate Limiter
 * Protects Authentication, Payment, and API routes against Brute Force & Denial of Service (DoS)
 */

interface RateLimitRecord {
  timestamps: number[]
}

const store = new Map<string, RateLimitRecord>()

// Periodically clean up stale entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000) // keep last 1 hr
      if (record.timestamps.length === 0) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitOptions {
  limit: number // Max requests allowed
  windowMs: number // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetMs: number
}

/**
 * Checks and updates rate limit for a specific identifier (e.g. IP address or user ID)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60000 },
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - options.windowMs

  let record = store.get(identifier)
  if (!record) {
    record = { timestamps: [] }
    store.set(identifier, record)
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

  if (record.timestamps.length >= options.limit) {
    const oldest = record.timestamps[0] || now
    const resetMs = Math.max(0, oldest + options.windowMs - now)
    return {
      success: false,
      remaining: 0,
      resetMs,
    }
  }

  record.timestamps.push(now)
  return {
    success: true,
    remaining: options.limit - record.timestamps.length,
    resetMs: options.windowMs,
  }
}

/**
 * Helper to extract client IP from incoming Next.js Request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]
    if (first) return first.trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp.trim()
  return '127.0.0.1'
}
