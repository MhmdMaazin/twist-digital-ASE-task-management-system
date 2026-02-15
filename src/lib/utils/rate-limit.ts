import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// In-memory rate limiting for development/fallback
class InMemoryRateLimit {
  private requests: Map<string, number[]> = new Map();

  async limit(identifier: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the window
    const validRequests = userRequests.filter((time) => time > windowStart);

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: new Date(validRequests[0]! + windowMs),
      };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - validRequests.length,
      reset: new Date(now + windowMs),
    };
  }
}

// Create Redis client if credentials are available
let redis: Redis | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Create rate limiters
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
      analytics: true,
    })
  : null;

export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
      analytics: true,
    })
  : null;

// Fallback in-memory rate limiter
const memoryRateLimit = new InMemoryRateLimit();

/**
 * Rate limit for auth endpoints
 */
export async function limitAuthRequest(identifier: string) {
  if (authRateLimit) {
    return await authRateLimit.limit(identifier);
  }

  // Fallback to in-memory
  return await memoryRateLimit.limit(identifier, 5, 60 * 1000); // 5 req/min
}

/**
 * Rate limit for API endpoints
 */
export async function limitApiRequest(identifier: string) {
  if (apiRateLimit) {
    return await apiRateLimit.limit(identifier);
  }

  // Fallback to in-memory
  return await memoryRateLimit.limit(identifier, 100, 60 * 1000); // 100 req/min
}
