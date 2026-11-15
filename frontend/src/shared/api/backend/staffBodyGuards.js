import { isCartFulfillmentBody, isCategoryBody, isOrderLineBody, isProductSummaryBody } from './bodyGuards'

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

const ORDER_STATUSES = new Set(['accepted', 'packing', 'ready', 'done', 'cancelled'])

export function isStaffOrderBody(value) {
  if (!isRecord(value)) return false
  if (typeof value.order_id !== 'string' || !ORDER_STATUSES.has(value.status)) return false
  if (!Array.isArray(value.allowed_next) || !value.allowed_next.every((item) => ORDER_STATUSES.has(item))) {
    return false
  }
  if (typeof value.total_rub !== 'number' || typeof value.created_at !== 'string') return false
  if (typeof value.buyer_name !== 'string') return false
  if (value.buyer_email !== null && typeof value.buyer_email !== 'string') return false
  if (value.customer_note !== null && typeof value.customer_note !== 'string') return false
  if ('phone' in value || 'buyer_phone' in value) return false
  if (!isCartFulfillmentBody(value.fulfillment)) return false
  return Array.isArray(value.lines) && value.lines.every(isOrderLineBody)
}

export function isStaffOrderListBody(value) {
  if (!isRecord(value) || !Array.isArray(value.items) || !value.items.every(isStaffOrderBody)) {
    return false
  }
  if ('truncated' in value && typeof value.truncated !== 'boolean') return false
  return true
}

function isMoneySlice(value) {
  return isRecord(value) && typeof value.label === 'string' && typeof value.value_rub === 'number'
}

export function isStaffStatsBody(value) {
  return (
    isRecord(value) &&
    typeof value.order_count === 'number' &&
    typeof value.buyer_count === 'number' &&
    Array.isArray(value.buyer_slices) &&
    value.buyer_slices.every(isMoneySlice) &&
    Array.isArray(value.product_slices) &&
    value.product_slices.every(isMoneySlice)
  )
}

function isDaySlice(value) {
  return (
    isRecord(value) &&
    typeof value.day === 'string' &&
    typeof value.label === 'string' &&
    typeof value.value_rub === 'number'
  )
}

function isQtySlice(value) {
  return isRecord(value) && typeof value.label === 'string' && typeof value.quantity === 'number'
}

function isInflow(value) {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.at === 'string' &&
    typeof value.title === 'string' &&
    typeof value.subtitle === 'string' &&
    typeof value.amount_rub === 'number' &&
    typeof value.channel === 'string'
  )
}

export function isStaffMoneyBody(value) {
  return (
    isRecord(value) &&
    typeof value.revenue_rub === 'number' &&
    typeof value.avg_check_rub === 'number' &&
    typeof value.inflow_rub === 'number' &&
    typeof value.operation_count === 'number' &&
    Array.isArray(value.revenue_by_day) &&
    value.revenue_by_day.every(isDaySlice) &&
    Array.isArray(value.top_by_qty) &&
    value.top_by_qty.every(isQtySlice) &&
    Array.isArray(value.inflows) &&
    value.inflows.every(isInflow)
  )
}
