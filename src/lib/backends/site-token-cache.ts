import { TtlCache } from "../ttl-cache";

/** oceano-core's `POST /admin/site-tokens` payload. */
export type SiteToken = { token: string; expiresAt: string };

/** Cached site tokens are dropped this long before they expire, so a site API never sees one expire mid-call. */
export const SITE_TOKEN_SKEW_MS = 60_000;

const key = (staffId: string, site: string) => `${staffId}\u0000${site}`;

/**
 * Site tokens in server memory per (staff id, site) until 60 s before `expiresAt`. In-flight requests are
 * shared, so a page with several loaders asks oceano-core once. Pure (clock injectable): unit-tested.
 */
export class SiteTokenCache {
  private readonly tokens: TtlCache<SiteToken>;
  private readonly inflight = new Map<string, Promise<unknown>>();

  constructor(now: () => number = Date.now, maxEntries = 1000) {
    this.tokens = new TtlCache<SiteToken>(maxEntries, now);
  }

  get(staffId: string, site: string): SiteToken | undefined {
    return this.tokens.get(key(staffId, site));
  }

  /** Stores the token unless it is already within the skew of its expiry (or `expiresAt` is not a date). */
  set(staffId: string, site: string, token: SiteToken): void {
    const expiresAt = Date.parse(token.expiresAt);
    if (Number.isNaN(expiresAt)) return;
    this.tokens.set(key(staffId, site), token, expiresAt - SITE_TOKEN_SKEW_MS);
  }

  delete(staffId: string, site?: string): void {
    if (site) this.tokens.delete(key(staffId, site));
    else this.tokens.deletePrefix(`${staffId}\u0000`);
  }

  /** Runs `fetch` once per (staff, site) at a time; concurrent callers share the same promise. */
  async shared<T>(
    staffId: string,
    site: string,
    fetch: () => Promise<T>,
  ): Promise<T> {
    const k = key(staffId, site);
    const running = this.inflight.get(k) as Promise<T> | undefined;
    if (running) return running;
    const p = fetch().finally(() => this.inflight.delete(k));
    this.inflight.set(k, p);
    return p;
  }
}
