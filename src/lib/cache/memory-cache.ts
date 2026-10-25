/**
 * Small in-memory cache with a time-to-live and a maximum number of entries.
 * Exports: MemoryCache.
 * Depends on: nothing.
 *
 * Uses Map insertion order to evict the least recently used entry first, so
 * memory stays bounded no matter how many different keys are requested.
 */
interface MemoryCacheOptions {
  ttlMs: number;
  maxEntries: number;
  now?: () => number;
}

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

export class MemoryCache<V> {
  private readonly entries = new Map<string, CacheEntry<V>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly now: () => number;

  constructor(options: MemoryCacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxEntries = Math.max(1, options.maxEntries);
    this.now = options.now ?? Date.now;
  }

  get(key: string): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }

    // Re-insert to mark as recently used.
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });

    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }

  get size(): number {
    return this.entries.size;
  }
}
