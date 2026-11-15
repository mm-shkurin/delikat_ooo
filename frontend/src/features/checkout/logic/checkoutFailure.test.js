import { describe, expect, it } from 'vitest'
import { SessionExpiredError } from '../../../shared/session/authorizedRequest'
import { checkoutFailureText } from './checkoutFailure'

describe('checkoutFailureText', () => {
  it('tells a dead login to sign in again and does not open a receipt path', () => {
    expect(checkoutFailureText(new SessionExpiredError())).toBe('Сессия истекла. Войдите заново.')
    const cause = new Error('Credentials are not valid')
    cause.status = 401
    cause.errorCode = 'unauthorized'
    expect(checkoutFailureText(new Error('wrapped', { cause }))).toBe(
      'Сессия истекла. Войдите заново.',
    )
  })
})
