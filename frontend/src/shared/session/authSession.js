import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '../browser/dom'

const STORAGE_KEY = 'delikat.auth'

let memory = null

export function currentSession() {
  if (memory) return memory
  try {
    const raw = readLocalStorage(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.accessToken !== 'string') return null
    memory = parsed
    return memory
  } catch {
    return null
  }
}

export function beginSession(tokens) {
  memory = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAtMs: Date.now() + Number(tokens.expires_in_sec || 0) * 1000,
  }
  writeLocalStorage(STORAGE_KEY, JSON.stringify(memory))
}

export function renewTokens(accessToken, refreshToken, expiresInSec) {
  const session = currentSession()
  if (!session) return
  memory = {
    ...session,
    accessToken,
    refreshToken,
    expiresAtMs:
      expiresInSec == null ? session.expiresAtMs : Date.now() + Number(expiresInSec) * 1000,
  }
  writeLocalStorage(STORAGE_KEY, JSON.stringify(memory))
}

/** True when access token is missing or within 60s of expiry. */
export function accessExpiringSoon(nowMs = Date.now()) {
  const session = currentSession()
  if (!session?.accessToken) return true
  if (typeof session.expiresAtMs !== 'number') return false
  return session.expiresAtMs - nowMs <= 60_000
}

export function endSession() {
  memory = null
  removeLocalStorage(STORAGE_KEY)
}
