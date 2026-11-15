import { describe, expect, it } from 'vitest'
import { SessionExpiredError } from '../../../shared/session/authorizedRequest'
import { ordersFailureText } from './ordersFailure'

function httpError(status, errorCode, message) {
  const cause = new Error(message)
  cause.status = status
  cause.errorCode = errorCode
  return new Error('wrapped', { cause })
}

describe('ordersFailureText', () => {
  it('keeps transition, missing order, and role copy distinct from the generic failure', () => {
    expect(ordersFailureText(httpError(409, 'invalid_status_transition', 'Этот статус отсюда не поставить.'))).toBe(
      'Этот статус отсюда не поставить.',
    )
    expect(ordersFailureText(httpError(404, 'order_not_found', 'Заказ не найден.'))).toBe('Заказ не найден.')
    expect(ordersFailureText(httpError(403, 'forbidden', 'Access is forbidden'))).toBe(
      'У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.',
    )
    expect(ordersFailureText(httpError(400, 'validation_error', 'Некорректный номер заказа.'))).toBe(
      'Некорректный номер заказа.',
    )
    expect(ordersFailureText(httpError(500, 'internal_error', 'boom'))).toBe(
      'Не получилось. Попробуйте ещё раз.',
    )
    expect(ordersFailureText(new Error('network'))).toBe('Не получилось. Попробуйте ещё раз.')
  })

  it('uses the session sentence when the open tab loses its login', () => {
    expect(ordersFailureText(new SessionExpiredError())).toBe('Сессия истекла. Войдите заново.')
    expect(ordersFailureText(httpError(401, 'unauthorized', 'Credentials are not valid'))).toBe(
      'Сессия истекла. Войдите заново.',
    )
  })
})
