import {
  readLocalStorage,
  readSessionStorage,
  removeLocalStorage,
  removeSessionStorage,
  writeSessionStorage,
} from '../browser/dom'

const STORAGE_KEY = 'delikat.auth'

let memory = null

function readPersisted() {
  try {
    const raw = readSessionStorage(STORAGE_KEY) || readLocalStorage(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.accessToken !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

function persist(session) {
  writeSessionStorage(STORAGE_KEY, JSON.stringify(session))
  removeLocalStorage(STORAGE_KEY)
}

export function currentSession() {
  if (memory) return memory
  memory = readPersisted()
  if (memory) persist(memory)
  return memory
}

export function beginSession(tokens) {
  memory = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAtMs: Date.now() + Number(tokens.expires_in_sec || 0) * 1000,
  }
  persist(memory)
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
  persist(memory)
}

/** True when access token is missing, has no expiry, or is within 60s of expiry. */
export function accessExpiringSoon(nowMs = Date.now()) {
  const session = currentSession()
  if (!session?.accessToken) return true
  if (typeof session.expiresAtMs !== 'number') return true
  return session.expiresAtMs - nowMs <= 60_000
}

export function endSession() {
  memory = null
  removeSessionStorage(STORAGE_KEY)
  removeLocalStorage(STORAGE_KEY)
}
