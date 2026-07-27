import { Redis } from "@upstash/redis";

// Create Redis client instance if env vars are present
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Get cached data or execute fallback function and store result in Redis cache.
 * @param key Redis Cache Key
 * @param fetcher Async function to retrieve data if cache misses
 * @param ttlSeconds Time-to-live in seconds (default: 5 minutes / 300s)
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  if (!redis) {
    // If Redis is not configured yet, fallback directly to DB fetcher
    return await fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (error) {
    console.warn(`[Redis Cache Miss/Error] Key: ${key}`, error);
  }

  const data = await fetcher();

  try {
    if (data) {
      await redis.set(key, data, { ex: ttlSeconds });
    }
  } catch (error) {
    console.warn(`[Redis Cache Set Error] Key: ${key}`, error);
  }

  return data;
}

/**
 * Invalidate a specific Redis cache key or pattern
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`[Redis Cache Invalidate Error] Key: ${key}`, error);
  }
}
