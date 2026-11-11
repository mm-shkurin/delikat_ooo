import { send } from '../../../shared/api/send'
import {
  isStaffProductBody,
  isStaffProductListBody,
} from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

/**
 * @param {{ q?: string, visibility?: 'live' | 'hidden' | 'all' }} [query]
 */
export function listStaffCatalogProducts(query = {}, signal) {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.visibility) params.set('visibility', query.visibility)
  const qs = params.toString()
  const path = qs ? `${BACKEND.staff.catalogProducts}?${qs}` : BACKEND.staff.catalogProducts
  return send(path, { signal, bearer: true, guard: isStaffProductListBody })
}

/** @param {FormData} form */
export function createStaffCatalogProduct(form, signal) {
  return send(BACKEND.staff.catalogProducts, {
    method: 'POST',
    bearer: true,
    signal,
    body: form,
    guard: isStaffProductBody,
  })
}

/** @param {string} productId @param {Record<string, unknown>} body */
export function patchStaffCatalogProduct(productId, body, signal) {
  return send(BACKEND.staff.catalogProduct(productId), {
    method: 'PATCH',
    bearer: true,
    signal,
    body,
    guard: isStaffProductBody,
  })
}

/** @param {string} productId @param {File} file */
export function putStaffCatalogProductImage(productId, file, signal) {
  const form = new FormData()
  form.append('image', file)
  return send(BACKEND.staff.catalogProductImage(productId), {
    method: 'PUT',
    bearer: true,
    signal,
    body: form,
    guard: isStaffProductBody,
  })
}
