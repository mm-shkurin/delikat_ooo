import { send } from '../../../shared/api/send'
import { isSessionCreatedBody } from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function createSession(signal) {
  return send(BACKEND.sessions.create, { method: 'POST', signal, guard: isSessionCreatedBody })
}

export function resetGuestSession(signal) {
  return send(BACKEND.sessions.reset, { method: 'POST', signal })
}
