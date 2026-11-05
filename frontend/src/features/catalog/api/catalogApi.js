import { send } from '../../../shared/api/send'
import {
  isCategoryListBody,
  isProductDetailBody,
  isProductListBody,
} from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function listCategories(signal) {
  return send(BACKEND.catalog.categories, { signal, guard: isCategoryListBody })
}

/**
 * @param {{
 *   categoryId?: string
 *   maxPriceRub?: number
 *   properties?: string[]
 *   sort?: 'pop' | 'price_asc' | 'sale_first'
 *   limit?: number
 *   offset?: number
 * }} query
 */
export function listProducts(query = {}, signal) {
  const params = new URLSearchParams()
  if (query.categoryId) params.set('category_id', query.categoryId)
  if (query.maxPriceRub != null) params.set('max_price_rub', String(query.maxPriceRub))
  for (const property of query.properties ?? []) params.append('property', property)
  if (query.sort) params.set('sort', query.sort)
  if (query.limit != null) params.set('limit', String(query.limit))
  if (query.offset != null) params.set('offset', String(query.offset))
  const qs = params.toString()
  const path = qs ? `${BACKEND.catalog.products}?${qs}` : BACKEND.catalog.products
  return send(path, { signal, guard: isProductListBody })
}

export function getProduct(productId, signal) {
  return send(BACKEND.catalog.product(productId), { signal, guard: isProductDetailBody })
}
