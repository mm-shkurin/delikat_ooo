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
    expiresInSec: tokens.expires_in_sec,
  }
  writeLocalStorage(STORAGE_KEY, JSON.stringify(memory))
}

export function renewTokens(accessToken, refreshToken) {
  const session = currentSession()
  if (!session) return
  memory = { ...session, accessToken, refreshToken }
  writeLocalStorage(STORAGE_KEY, JSON.stringify(memory))
}

export function endSession() {
  memory = null
  removeLocalStorage(STORAGE_KEY)
}
