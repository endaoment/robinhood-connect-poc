/**
 * Performance optimization utilities
 */

// Debounce function for API calls
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Simple cache for API responses
class SimpleCache {
  private cache = new Map<string, { data: unknown; expiry: number }>()

  set(key: string, data: unknown, ttlMs = 300000): void {
    // 5 minutes default
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    })
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key)

    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Remove expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export const apiCache = new SimpleCache()

// Set up periodic cache cleanup
export function setupCacheCleanup(intervalMs = 300000): NodeJS.Timeout {
  return setInterval(() => apiCache.cleanup(), intervalMs)
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void): void {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`[PERF] ${name}: ${(end - start).toFixed(2)}ms`)
}

// Async performance monitoring
export async function measurePerformanceAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const end = performance.now()
    console.log(`[PERF] ${name}: ${(end - start).toFixed(2)}ms`)
    return result
  } catch (error) {
    const end = performance.now()
    console.error(`[PERF] ${name} failed after ${(end - start).toFixed(2)}ms:`, error)
    throw error
  }
}

// Throttle function (different from debounce - runs at most once per interval)
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(fn: () => Promise<T>, maxAttempts = 3, initialDelay = 1000): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Memoization helper
export function memoize<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>()

  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}
