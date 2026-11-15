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
  it('stores only expiry in memory and never writes tokens to web storage', () => {
    beginSession({
      access_token: 'a1',
      refresh_token: 'r1',
      expires_in_sec: 120,
    })
    expect(currentSession()?.expiresAtMs).toBeTypeOf('number')
    expect(currentSession()?.accessToken).toBeUndefined()
    expect(currentSession()?.refreshToken).toBeUndefined()
    expect(sessionStorage.getItem('delikat.auth')).toBeNull()
    expect(localStorage.getItem('delikat.auth')).toBeNull()
    expect(accessExpiringSoon()).toBe(false)
    renewTokens('ignored', 'ignored', 30)
    expect(currentSession()?.accessToken).toBeUndefined()
    expect(accessExpiringSoon()).toBe(true)
  })

  it('scrubs legacy web-storage auth blobs on beginSession', () => {
    localStorage.setItem(
      'delikat.auth',
      JSON.stringify({ accessToken: 'legacy', refreshToken: 'r', expiresAtMs: Date.now() + 120_000 }),
    )
    sessionStorage.setItem('delikat.auth', '{"accessToken":"old"}')
    beginSession({ expires_in_sec: 60 })
    expect(currentSession()).toBeTruthy()
    expect(localStorage.getItem('delikat.auth')).toBeNull()
    expect(sessionStorage.getItem('delikat.auth')).toBeNull()
  })
})
