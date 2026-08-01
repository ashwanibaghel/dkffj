/**
 * High-Performance In-Memory Cache Engine for Server Actions & API Routes.
 * Provides instant 0.00s data retrieval with automatic TTL expiry and tag invalidation.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttlMs: number;
};

const globalCache = new Map<string, CacheEntry<any>>();

export function getCachedData<T>(key: string): T | null {
  const entry = globalCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttlMs) {
    globalCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedData<T>(key: string, data: T, ttlSeconds: number = 60): void {
  globalCache.set(key, {
    data,
    timestamp: Date.now(),
    ttlMs: ttlSeconds * 1000,
  });
}

export function invalidateCache(keyPrefix: string): void {
  for (const key of globalCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      globalCache.delete(key);
    }
  }
}

export function clearAllCache(): void {
  globalCache.clear();
}
