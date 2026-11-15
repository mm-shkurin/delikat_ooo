/** Tunable client intervals — change policy here, not at call sites. */
export const CATALOG_LIVE_BACKOFF = {
  baseMs: 400,
  maxMs: 8_000,
}
