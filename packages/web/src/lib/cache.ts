interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCache<T>(key: string, data: T, ttlMs: number = 60_000): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }
  cache.forEach((_, key) => {
    if (key.includes(pattern)) cache.delete(key)
  })
}

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 60_000
): Promise<T> {
  const cached = getCached<T>(key)
  if (cached !== null) return cached

  const data = await fn()
  setCache(key, data, ttlMs)
  return data
}
