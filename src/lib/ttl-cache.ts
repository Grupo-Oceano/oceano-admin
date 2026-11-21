/**
 * A small in-memory cache with per-entry expiry and a size cap (oldest entries go first). Server memory
 * only; a restart empties it. The clock is injectable so expiry is unit-tested.
 */
export class TtlCache<V> {
  private readonly entries = new Map<string, { value: V; expiresAt: number }>();

  constructor(
    private readonly maxEntries = 1000,
    private readonly now: () => number = Date.now,
  ) {}

  get(key: string): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /** Stores `value` until `expiresAt` (ms since epoch). An already-expired entry is not stored. */
  set(key: string, value: V, expiresAt: number): void {
    if (expiresAt <= this.now()) return;
    this.entries.delete(key);
    if (this.entries.size >= this.maxEntries) this.prune();
    this.entries.set(key, { value, expiresAt });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  /** Deletes every key that starts with `prefix`. */
  deletePrefix(prefix: string): void {
    for (const key of [...this.entries.keys()])
      if (key.startsWith(prefix)) this.entries.delete(key);
  }

  get size(): number {
    return this.entries.size;
  }

  private prune(): void {
    const t = this.now();
    for (const [key, entry] of this.entries)
      if (entry.expiresAt <= t) this.entries.delete(key);
    // Still full: drop the oldest insertions (Map keeps insertion order).
    for (const key of this.entries.keys()) {
      if (this.entries.size < this.maxEntries) break;
      this.entries.delete(key);
    }
  }
}
