import { send } from '../../../shared/api/send'
import { isStaffCategoryBody, isStaffCategoryListBody } from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function listStaffCategories(signal) {
  return send(BACKEND.staff.catalogCategories, { signal, bearer: true, guard: isStaffCategoryListBody })
}

/** @param {{ id: string, title: string }} body */
export function createStaffCategory(body, signal) {
  return send(BACKEND.staff.catalogCategories, {
    method: 'POST',
    bearer: true,
    signal,
    body,
    guard: isStaffCategoryBody,
  })
}

/** @param {string} categoryId @param {{ title: string }} body */
export function patchStaffCategory(categoryId, body, signal) {
  return send(BACKEND.staff.catalogCategory(categoryId), {
    method: 'PATCH',
    bearer: true,
    signal,
    body,
    guard: isStaffCategoryBody,
  })
}

/** @param {string[]} ids */
export function reorderStaffCategories(ids, signal) {
  return send(BACKEND.staff.catalogCategoryOrder, {
    method: 'PUT',
    bearer: true,
    signal,
    body: { ids },
    guard: isStaffCategoryListBody,
  })
}

/** @param {string} categoryId */
export function deleteStaffCategory(categoryId, signal) {
  return send(BACKEND.staff.catalogCategory(categoryId), {
    method: 'DELETE',
    bearer: true,
    signal,
  })
}
