import { httpErrorIn } from './httpResponse'
import { isRequestTimeout } from './requestTimeout'

const BY_CODE = {
  cart_empty: 'Корзина пуста.',
  address_required: 'Укажите адрес доставки.',
  cannot_checkout: 'Нельзя оформить заказ — проверьте корзину и адрес.',
  rate_limited: 'Слишком много попыток. Подождите и попробуйте снова.',
  product_not_found: 'Товар не найден.',
  line_not_found: 'Строка корзины не найдена.',
  idempotency_conflict: 'Этот ключ заказа уже использован.',
  unauthorized: 'Войдите через Яндекс ID.',
  forbidden: 'Недостаточно прав для этого действия.',
  owner_immutable: 'Роль владельца нельзя менять из кабинета.',
  staff_not_found: 'Сотрудник не найден.',
  validation_error: 'Проверьте введённые данные.',
  product_id_taken: 'Такой код товара уже есть.',
  category_not_found: 'Категория не найдена.',
}

const GENERIC = 'Не получилось. Попробуйте ещё раз.'

export function failureText(error) {
  if (isRequestTimeout(error) || isRequestTimeout(error?.cause)) {
    return 'Сервер не ответил вовремя. Проверьте связь и попробуйте ещё раз.'
  }
  if (error?.name === 'UnexpectedBodyError' || error?.cause?.name === 'UnexpectedBodyError') {
    return 'Сервер вернул ответ, который экран не смог прочитать.'
  }
  const failure = httpErrorIn(error)
  if (!failure) return GENERIC
  if (failure.errorCode && BY_CODE[failure.errorCode]) return BY_CODE[failure.errorCode]
  if (failure.status >= 500) return 'Сервис временно недоступен. Попробуйте позже.'
  return GENERIC
}
