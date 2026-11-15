import { afterEach, describe, expect, it, vi } from 'vitest'

const request = vi.fn()
const refreshTokens = vi.fn()

vi.mock('../api/httpClient', () => ({
  isHttpError: (error) => Boolean(error?.status),
  request: (...args) => request(...args),
}))

vi.mock('./refreshApi', () => ({
  refreshTokens: (...args) => refreshTokens(...args),
}))

afterEach(async () => {
  const { endSession } = await import('./authSession')
  endSession()
  request.mockReset()
  refreshTokens.mockReset()
})

describe('authorizedRequest', () => {
  it('calls request without Authorization header (cookie auth)', async () => {
    const { beginSession } = await import('./authSession')
    const { authorizedRequest } = await import('./authorizedRequest')
    beginSession({ expires_in_sec: 600 })
    request.mockResolvedValueOnce({ ok: true })
    await authorizedRequest('/api/v1/me', { method: 'GET' })
    const options = request.mock.calls[0][1]
    expect(options?.headers?.Authorization).toBeUndefined()
  })

  it('renews once on 401 then retries', async () => {
    const { beginSession, currentSession } = await import('./authSession')
    const { authorizedRequest } = await import('./authorizedRequest')
    beginSession({ expires_in_sec: 600 })
    const unauthorized = Object.assign(new Error('nope'), { status: 401 })
    request.mockRejectedValueOnce(unauthorized).mockResolvedValueOnce({ ok: true })
    refreshTokens.mockResolvedValueOnce({ expiresInSec: 900 })
    await authorizedRequest('/api/v1/me')
    expect(refreshTokens).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledTimes(2)
    expect(currentSession()?.expiresAtMs).toBeTypeOf('number')
  })

  it('clears session when refresh fails after 401', async () => {
    const { beginSession, currentSession } = await import('./authSession')
    const { authorizedRequest, SessionExpiredError } = await import('./authorizedRequest')
    beginSession({ expires_in_sec: 600 })
    const unauthorized = Object.assign(new Error('nope'), { status: 401 })
    request.mockRejectedValueOnce(unauthorized)
    refreshTokens.mockRejectedValueOnce(new Error('refresh failed'))
    await expect(authorizedRequest('/api/v1/me')).rejects.toBeInstanceOf(SessionExpiredError)
    expect(currentSession()).toBeNull()
  })
})
