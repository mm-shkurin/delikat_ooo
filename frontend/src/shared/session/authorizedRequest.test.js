import { afterEach, describe, expect, it, vi } from 'vitest'
import { beginSession, endSession } from './authSession'

vi.mock('../api/httpClient', () => ({
  isHttpError: (error) => Boolean(error?.status),
  request: vi.fn(),
}))

vi.mock('./refreshApi', () => ({
  refreshTokens: vi.fn(),
}))

afterEach(() => {
  endSession()
  vi.clearAllMocks()
})

describe('authorizedRequest', () => {
  it('calls request without Authorization header (cookie auth)', async () => {
    const { request } = await import('../api/httpClient')
    const { authorizedRequest } = await import('./authorizedRequest')
    beginSession({ expires_in_sec: 600 })
    request.mockResolvedValueOnce({ ok: true })
    await authorizedRequest('/api/v1/me', { method: 'GET' })
    expect(request).toHaveBeenCalledWith(
      '/api/v1/me',
      expect.not.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.any(String) }),
      }),
    )
  })
})
