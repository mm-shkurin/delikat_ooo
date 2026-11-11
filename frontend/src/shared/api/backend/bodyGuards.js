function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const PRODUCT_PROPERTIES = new Set(['chilled', 'frozen', 'fresh', 'premium'])
const PRODUCT_BADGES = new Set(['NEW', 'TOP', 'SALE'])
const FULFILLMENT_MODES = new Set(['delivery', 'pickup'])

function isOptionalInteger(value) {
  return value === null || value === undefined || (typeof value === 'number' && Number.isInteger(value))
}

export function isSessionCreatedBody(value) {
  return isRecord(value) && typeof value.session_id === 'string'
}

export function isCategoryBody(value) {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.sort_order === 'number'
  )
}

export function isCategoryListBody(value) {
  return isRecord(value) && Array.isArray(value.items) && value.items.every(isCategoryBody)
}

export function isProductSummaryBody(value) {
  if (!isRecord(value)) return false
  if (
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.category_id !== 'string' ||
    typeof value.default_weight_label !== 'string' ||
    typeof value.price_rub !== 'number' ||
    typeof value.popularity_score !== 'number' ||
    typeof value.image_url !== 'string'
  ) {
    return false
  }
  if (!Array.isArray(value.properties) || !value.properties.every((p) => PRODUCT_PROPERTIES.has(p))) {
    return false
  }
  if (!isOptionalInteger(value.compare_at_price_rub)) return false
  if (value.badge !== null && value.badge !== undefined && !PRODUCT_BADGES.has(value.badge)) return false
  if (value.marble_grade_label !== null && value.marble_grade_label !== undefined && typeof value.marble_grade_label !== 'string') {
    return false
  }
  return true
}

export function isProductDetailBody(value) {
  return (
    isProductSummaryBody(value) &&
    Array.isArray(value.weight_options) &&
    value.weight_options.every((w) => typeof w === 'string') &&
    (value.description === null || value.description === undefined || typeof value.description === 'string')
  )
}

export function isProductListBody(value) {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isProductSummaryBody) &&
    typeof value.total_count === 'number' &&
    (value.limit === undefined || typeof value.limit === 'number') &&
    (value.offset === undefined || typeof value.offset === 'number')
  )
}

function isDeliveryAddress(value) {
  return (
    isRecord(value) &&
    typeof value.city === 'string' &&
    (value.street_line === null ||
      value.street_line === undefined ||
      typeof value.street_line === 'string')
  )
}

export function isCartFulfillmentBody(value) {
  return (
    isRecord(value) &&
    FULFILLMENT_MODES.has(value.mode) &&
    isDeliveryAddress(value.address)
  )
}

export function isCartLineBody(value) {
  return (
    isRecord(value) &&
    typeof value.line_id === 'string' &&
    typeof value.product_id === 'string' &&
    typeof value.product_name === 'string' &&
    typeof value.weight_label === 'string' &&
    typeof value.quantity === 'number' &&
    typeof value.unit_price_rub === 'number' &&
    typeof value.line_total_rub === 'number'
  )
}

export function isCartBody(value) {
  return (
    isRecord(value) &&
    isCartFulfillmentBody(value.fulfillment) &&
    Array.isArray(value.items) &&
    value.items.every(isCartLineBody) &&
    typeof value.items_count === 'number' &&
    typeof value.total_rub === 'number' &&
    typeof value.can_checkout === 'boolean'
  )
}

export function isTokenPairBody(value) {
  return (
    isRecord(value) &&
    typeof value.access_token === 'string' &&
    typeof value.refresh_token === 'string' &&
    typeof value.token_type === 'string' &&
    typeof value.expires_in_sec === 'number'
  )
}

export function isUserProfileBody(value) {
  if (!isRecord(value)) return false
  if (
    typeof value.user_id !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.display_name !== 'string' ||
    typeof value.provider_display_name !== 'string'
  ) {
    return false
  }
  if (value.avatar_url !== null && value.avatar_url !== undefined && typeof value.avatar_url !== 'string') {
    return false
  }
  return true
}

export function isOrderLineBody(value) {
  return (
    isRecord(value) &&
    typeof value.product_id === 'string' &&
    typeof value.product_name === 'string' &&
    typeof value.weight_label === 'string' &&
    typeof value.quantity === 'number' &&
    typeof value.unit_price_rub === 'number' &&
    typeof value.line_total_rub === 'number'
  )
}

export function isOrderCreatedBody(value) {
  return (
    isRecord(value) &&
    typeof value.order_id === 'string' &&
    value.status === 'accepted' &&
    typeof value.total_rub === 'number' &&
    typeof value.message === 'string' &&
    isCartFulfillmentBody(value.fulfillment) &&
    Array.isArray(value.lines) &&
    value.lines.every(isOrderLineBody)
  )
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
