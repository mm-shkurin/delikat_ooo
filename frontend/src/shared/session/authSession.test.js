import { afterEach, describe, expect, it } from 'vitest'
import {
  accessExpiringSoon,
  beginSession,
  currentSession,
  endSession,
  renewTokens,
} from './authSession'

afterEach(() => {
  endSession()
})

describe('authSession', () => {
  it('stores expiry and renews it from expires_in_sec', () => {
    beginSession({
      access_token: 'a1',
      refresh_token: 'r1',
      expires_in_sec: 120,
    })
    expect(currentSession()?.accessToken).toBe('a1')
    expect(sessionStorage.getItem('delikat.auth')).toContain('a1')
    expect(localStorage.getItem('delikat.auth')).toBeNull()
    expect(accessExpiringSoon()).toBe(false)
    renewTokens('a2', 'r2', 30)
    expect(currentSession()?.accessToken).toBe('a2')
    expect(accessExpiringSoon()).toBe(true)
  })

  it('migrates legacy localStorage into sessionStorage on read', () => {
    localStorage.setItem(
      'delikat.auth',
      JSON.stringify({ accessToken: 'legacy', refreshToken: 'r', expiresAtMs: Date.now() + 120_000 }),
    )
    expect(currentSession()?.accessToken).toBe('legacy')
    expect(sessionStorage.getItem('delikat.auth')).toContain('legacy')
    expect(localStorage.getItem('delikat.auth')).toBeNull()
  })
})
