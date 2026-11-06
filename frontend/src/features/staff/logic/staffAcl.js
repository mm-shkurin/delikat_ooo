/** @typedef {'owner' | 'manager' | 'cashier'} StaffRole */
/** @typedef {'catalog' | 'orders' | 'stats' | 'money' | 'employees'} StaffTab */

/** @type {Record<StaffRole, StaffTab[]>} */
export const ROLE_TABS = {
  owner: ['catalog', 'orders', 'stats', 'money', 'employees'],
  manager: ['catalog', 'orders', 'employees'],
  cashier: ['orders'],
}

/** @type {Record<StaffRole, string>} */
export const ROLE_LABELS = {
  owner: 'Владелец',
  manager: 'Менеджер',
  cashier: 'Кассир / мясник',
}

/** @type {Record<StaffTab, string>} */
export const TAB_LABELS = {
  catalog: 'Каталог',
  orders: 'Заказы',
  stats: 'Статистика',
  money: 'Деньги',
  employees: 'Сотрудники',
}

/** @param {string} role @returns {role is StaffRole} */
export function isStaffRole(role) {
  return role === 'owner' || role === 'manager' || role === 'cashier'
}

/** @param {StaffRole} role */
export function tabsForRole(role) {
  return ROLE_TABS[role] ?? []
}

/**
 * @param {StaffRole} role
 * @param {string | undefined} preferred
 * @returns {StaffTab | null}
 */
export function resolveAllowedTab(role, preferred) {
  const tabs = tabsForRole(role)
  if (preferred && tabs.includes(/** @type {StaffTab} */ (preferred))) {
    return /** @type {StaffTab} */ (preferred)
  }
  return tabs[0] ?? null
}

/** @param {StaffRole} actorRole */
export function assignableRoles(actorRole) {
  if (actorRole === 'owner') return /** @type {const} */ (['manager', 'cashier'])
  if (actorRole === 'manager') return /** @type {const} */ (['cashier'])
  return /** @type {const} */ ([])
}

/** @param {StaffRole} actorRole @param {StaffRole} targetRole */
export function canMutateMember(actorRole, targetRole) {
  if (targetRole === 'owner') return false
  if (actorRole === 'owner') return targetRole === 'manager' || targetRole === 'cashier'
  if (actorRole === 'manager') return targetRole === 'cashier'
  return false
}

/** @param {StaffRole} role */
export function canManageRoster(role) {
  return role === 'owner' || role === 'manager'
}
