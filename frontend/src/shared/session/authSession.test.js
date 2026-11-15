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
    expect(accessExpiringSoon()).toBe(false)
    renewTokens('a2', 'r2', 30)
    expect(currentSession()?.accessToken).toBe('a2')
    expect(accessExpiringSoon()).toBe(true)
  })
})
