import { request } from '../api/httpClient'
import { BACKEND } from '../api/backend/paths'
import { isTokenPairBody } from '../api/backend/bodyGuards'

/** Cookie refresh only — discard JWT fields so they never stay in JS locals beyond this frame. */
export async function refreshTokens() {
  const wire = await request(BACKEND.auth.refresh, {
    method: 'POST',
    body: {},
    guard: isTokenPairBody,
  })
  const expiresInSec = wire.expires_in_sec
  return { expiresInSec }
}
