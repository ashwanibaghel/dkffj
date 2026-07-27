import { Redis } from "@upstash/redis";

const redisUrl =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL;

const redisToken =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN;

// Create Redis client instance if env vars are present
export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

/**
 * Get current version of a namespace (default: 1)
 */
export async function getNamespaceVersion(namespace: string): Promise<number> {
  if (!redis) return 1;
  try {
    const version = await redis.get<number>(`ver:${namespace}`);
    return version || 1;
  } catch {
    return 1;
  }
}

/**
 * Increment version for a namespace to invalidate all associated cached keys.
 * Calling this causes a guaranteed CACHE MISS on the next read request.
 */
export async function incrementNamespaceVersion(namespace: string): Promise<number> {
  if (!redis) return 1;
  try {
    const nextVer = await redis.incr(`ver:${namespace}`);
    console.log(`[Redis Version Bump] Namespace '${namespace}' updated to version ${nextVer}`);
    return nextVer;
  } catch (error) {
    console.warn(`[Redis Version Bump Error] Namespace '${namespace}'`, error);
    return 1;
  }
}

/**
 * Get cached data or execute fetcher and store in Redis using namespace version tag.
 */
export async function getVersionedCache<T>(
  namespace: string,
  keySuffix: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 600
): Promise<T> {
  if (!redis) {
    return await fetcher();
  }

  const ver = await getNamespaceVersion(namespace);
  const fullKey = `${namespace}:v${ver}:${keySuffix}`;

  try {
    const cached = await redis.get<T>(fullKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (error) {
    console.warn(`[Redis Cache Read Error] ${fullKey}`, error);
  }

  const data = await fetcher();

  try {
    if (data) {
      await redis.set(fullKey, data, { ex: ttlSeconds });
    }
  } catch (error) {
    console.warn(`[Redis Cache Set Error] ${fullKey}`, error);
  }

  return data;
}

/**
 * General single key cache helper
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  if (!redis) {
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

export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`[Redis Cache Invalidate Error] Key: ${key}`, error);
  }
}
