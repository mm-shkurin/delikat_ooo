import { httpErrorIn } from '../../../shared/api/httpResponse'

/** Exact panel copy for 404 / product_not_found. Cart keeps failureText. */
export const PRODUCT_NOT_FOUND_COPY = 'товар не найден'

export const PRODUCT_OPEN_FAILED_COPY = 'Не удалось открыть карточку.'

export const CATALOG_EMPTY_COPY = 'Ничего не нашлось. Снимите часть фильтров.'

const CATALOG_FAILED_COPY = 'Каталог недоступен. Нажмите «Повторить» выше.'

/**
 * @param {{ loading: boolean, notFound: boolean }} state
 */
export function productPanelCopy({ loading, notFound }) {
  if (notFound) return PRODUCT_NOT_FOUND_COPY
  if (loading) return 'Загрузка карточки…'
  return PRODUCT_OPEN_FAILED_COPY
}

/** @param {boolean} failed */
export function catalogEmptyCopy(failed) {
  return failed ? CATALOG_FAILED_COPY : CATALOG_EMPTY_COPY
}

/** Hidden and unknown ids share this failure. Other HTTP errors do not. */
export function isProductNotFoundError(error) {
  const failure = httpErrorIn(error)
  if (!failure) return false
  return failure.status === 404 || failure.errorCode === 'product_not_found'
}

/** @param {string} search */
export function productIdFromSearch(search) {
  const params = new URLSearchParams(search)
  const id = params.get('product')?.trim() ?? ''
  return id || null
}

/** @param {string} search @param {string | null} productId */
export function searchWithProduct(search, productId) {
  const params = new URLSearchParams(search)
  if (productId) params.set('product', productId)
  else params.delete('product')
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}
