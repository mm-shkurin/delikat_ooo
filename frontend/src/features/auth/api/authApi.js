import { beginSession, endSession } from '../../../shared/session/authSession'
import { send } from '../../../shared/api/send'
import { isTokenPairBody, isUserProfileBody } from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function startYandexLogin() {
  window.location.assign(BACKEND.auth.yandexStart)
}

export async function exchangeOAuthCode(code) {
  const tokens = await send(BACKEND.auth.oauthExchange, {
    method: 'POST',
    body: { code },
    guard: isTokenPairBody,
  })
  beginSession(tokens)
  return tokens
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

export async function logout(refreshToken) {
  try {
    await send(BACKEND.auth.logout, {
      method: 'POST',
      bearer: true,
      body: refreshToken ? { refresh_token: refreshToken } : undefined,
    })
  } finally {
    endSession()
  }
}
