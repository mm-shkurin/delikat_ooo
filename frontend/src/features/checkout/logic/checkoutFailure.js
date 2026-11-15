import { failureText } from '../../../shared/api/failureText'
import { httpErrorIn } from '../../../shared/api/httpResponse'
import { isSessionExpired } from '../../../shared/session/authorizedRequest'

export function checkoutFailureText(error) {
  if (isSessionExpired(error) || httpErrorIn(error)?.status === 401) {
    return 'Сессия истекла. Войдите заново.'
  }
  return failureText(error)
}
