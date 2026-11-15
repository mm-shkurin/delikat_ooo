import { isCategoryBody, isProductSummaryBody } from './bodyGuards'

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const STAFF_ROLES = new Set(['owner', 'manager', 'cashier'])
const STAFF_STATUSES = new Set(['active', 'pending'])

export function isStaffMeBody(value) {
  return (
    isRecord(value) &&
    typeof value.user_id === 'string' &&
    typeof value.email === 'string' &&
    typeof value.display_name === 'string' &&
    STAFF_ROLES.has(value.role)
  )
}

export function isStaffMemberBody(value) {
  if (!isRecord(value)) return false
  if (
    typeof value.member_id !== 'string' ||
    typeof value.email !== 'string' ||
    !STAFF_ROLES.has(value.role) ||
    !STAFF_STATUSES.has(value.status)
  ) {
    return false
  }
  if (value.user_id !== null && value.user_id !== undefined && typeof value.user_id !== 'string') {
    return false
  }
  if (
    value.display_name !== null &&
    value.display_name !== undefined &&
    typeof value.display_name !== 'string'
  ) {
    return false
  }
  return true
}

export function isStaffMemberListBody(value) {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isStaffMemberBody)
}

export function isStaffProductBody(value) {
  if (!isProductSummaryBody(value)) return false
  if (typeof value.hidden !== 'boolean' || typeof value.created_at !== 'string') return false
  if (
    value.description !== null &&
    value.description !== undefined &&
    typeof value.description !== 'string'
  ) {
    return false
  }
  return true
}

export function isStaffProductListBody(value) {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isStaffProductBody)
}

export function isStaffCategoryBody(value) {
  return isCategoryBody(value) && typeof value.product_count === 'number'
}

export function isStaffCategoryListBody(value) {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isStaffCategoryBody)
}
