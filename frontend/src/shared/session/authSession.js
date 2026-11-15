import { removeLocalStorage, removeSessionStorage } from '../browser/dom'

const LEGACY_KEY = 'delikat.auth'

/** @type {{ expiresAtMs: number } | null} */
let memory = null

function scrubLegacyStorage() {
  removeSessionStorage(LEGACY_KEY)
  removeLocalStorage(LEGACY_KEY)
}

/**
 * Signed-in hint for the tab. JWTs live only in HttpOnly cookies — never in JS memory
 * or web storage (XSS cannot read them from the page).
 */
export function currentSession() {
  return memory
}

/** @param {{ expires_in_sec?: number, access_token?: string, refresh_token?: string }} tokens */
export function beginSession(tokens) {
  scrubLegacyStorage()
  memory = {
    expiresAtMs: Date.now() + Number(tokens.expires_in_sec || 3600) * 1000,
  }
}

export function markCookieSession(expiresInSec) {
  beginSession({ expires_in_sec: expiresInSec })
}

/** @param {string} [_access] @param {string} [_refresh] @param {number} [expiresInSec] */
export function renewTokens(_access, _refresh, expiresInSec) {
  scrubLegacyStorage()
  memory = {
    expiresAtMs:
      expiresInSec == null ? memory?.expiresAtMs ?? Date.now() : Date.now() + Number(expiresInSec) * 1000,
  }
}

/** True when no session or access is within 60s of expiry. */
export function accessExpiringSoon(nowMs = Date.now()) {
  const session = currentSession()
  if (!session) return true
  if (typeof session.expiresAtMs !== 'number') return true
  return session.expiresAtMs - nowMs <= 60_000
}

export function endSession() {
  memory = null
  scrubLegacyStorage()
}
