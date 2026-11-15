import { httpErrorIn } from '../../../shared/api/httpResponse'
import { isSessionExpired } from '../../../shared/session/authorizedRequest'

const GENERIC = 'Не получилось. Попробуйте ещё раз.'
const EXPIRED = 'Сессия истекла. Войдите заново.'
const ROLE = 'У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.'

export function analyticsFailureText(error) {
  if (isSessionExpired(error)) return EXPIRED
  const http = httpErrorIn(error)
  if (!http) return GENERIC
  if (http.status === 401) return EXPIRED
  if (http.status === 403) return ROLE
  return GENERIC
}
