import { beginSession, endSession } from '../../../shared/session/authSession'
import { send } from '../../../shared/api/send'
import { isTokenPairBody, isUserProfileBody } from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'
import { assignLocation } from '../../../shared/browser/dom'

export function startYandexLogin() {
  assignLocation(BACKEND.auth.yandexStart)
}

export async function exchangeOAuthCode(code) {
  const wire = await send(BACKEND.auth.oauthExchange, {
    method: 'POST',
    body: { code },
    guard: isTokenPairBody,
  })
  // Cookies carry JWTs; only keep expiry in memory — never retain token strings.
  beginSession({ expires_in_sec: wire.expires_in_sec })
  return { expires_in_sec: wire.expires_in_sec }
}

export function getMe(signal) {
  return send(BACKEND.me, { signal, bearer: true, guard: isUserProfileBody })
}

/** @param {string} displayName @param {AbortSignal} [signal] */
export function updateMe(displayName, signal) {
  return send(BACKEND.me, {
    method: 'PATCH',
    bearer: true,
    signal,
    body: { display_name: displayName },
    guard: isUserProfileBody,
  })
}

export async function logout() {
  try {
    await send(BACKEND.auth.logout, {
      method: 'POST',
      bearer: true,
      body: {},
    })
  } finally {
    endSession()
  }
}
