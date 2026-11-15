import { isHttpError, request } from '../api/httpClient'
import { accessExpiringSoon, currentSession, endSession, renewTokens } from './authSession'
import { refreshTokens } from './refreshApi'

export class SessionExpiredError extends Error {
  constructor() {
    super('Сессия истекла. Войдите заново.')
    this.name = 'SessionExpiredError'
  }
}

export function isSessionExpired(error) {
  return error instanceof SessionExpiredError
}

let inFlight = null

/**
 * Cookie-only auth: credentials:include carries HttpOnly JWTs. No Bearer header from JS.
 */
export async function authorizedRequest(path, options = {}) {
  if (currentSession() && accessExpiringSoon() && !(await renewOnce())) {
    endSession()
    throw new SessionExpiredError()
  }
  try {
    return await request(path, options)
  } catch (error) {
    if (!isUnauthorized(error)) throw error
    if (!(await renewOnce())) {
      endSession()
      throw new SessionExpiredError()
    }
    return request(path, options)
  }
}

function isUnauthorized(error) {
  return isHttpError(error) && error.status === 401
}

async function renewOnce() {
  inFlight ??= performRenewal().finally(() => {
    inFlight = null
  })
  return inFlight
}

async function performRenewal() {
  try {
    const { expiresInSec } = await refreshTokens()
    renewTokens(undefined, undefined, expiresInSec)
    return Boolean(currentSession())
  } catch {
    return false
  }
}
