import { request } from '../api/httpClient'
import { BACKEND } from '../api/backend/paths'
import { isTokenPairBody } from '../api/backend/bodyGuards'

/** Refresh via HttpOnly cookie only — body stays empty so JS never holds refresh JWT. */
export async function refreshTokens() {
  const wire = await request(BACKEND.auth.refresh, {
    method: 'POST',
    body: {},
    guard: isTokenPairBody,
  })
  return {
    accessToken: wire.access_token,
    refreshToken: wire.refresh_token,
    expiresInSec: wire.expires_in_sec,
  }
}
