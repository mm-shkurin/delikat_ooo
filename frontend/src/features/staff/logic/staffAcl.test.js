import { describe, expect, it } from 'vitest'
import {
  assignableRoles,
  canManageRoster,
  canMutateMember,
  isStaffRole,
  resolveAllowedTab,
  tabsForRole,
} from './staffAcl'

describe('staffAcl', () => {
  it('owner sees full tab set including employees', () => {
    expect(tabsForRole('owner')).toEqual([
      'catalog',
      'orders',
      'stats',
      'money',
      'employees',
    ])
  })

  it('cashier sees only orders', () => {
    expect(tabsForRole('cashier')).toEqual(['orders'])
  })

  it('manager sees catalog, orders, employees — not stats or money', () => {
    expect(tabsForRole('manager')).toEqual(['catalog', 'orders', 'employees'])
  })

  it('deep-link to forbidden tab resolves to first allowed', () => {
    expect(resolveAllowedTab('cashier', 'catalog')).toBe('orders')
    expect(resolveAllowedTab('cashier', 'employees')).toBe('orders')
    expect(resolveAllowedTab('manager', 'money')).toBe('catalog')
    expect(resolveAllowedTab('owner', 'stats')).toBe('stats')
  })

  it('manager assign offers only cashier', () => {
    expect(assignableRoles('manager')).toEqual(['cashier'])
    expect(assignableRoles('owner')).toEqual(['manager', 'cashier'])
    expect(assignableRoles('cashier')).toEqual([])
  })

  it('manager cannot mutate owner or manager rows; can mutate cashier', () => {
    expect(canMutateMember('manager', 'owner')).toBe(false)
    expect(canMutateMember('manager', 'manager')).toBe(false)
    expect(canMutateMember('manager', 'cashier')).toBe(true)
  })

  it('owner rows are immutable for everyone', () => {
    expect(canMutateMember('owner', 'owner')).toBe(false)
    expect(canMutateMember('manager', 'owner')).toBe(false)
  })

  it('roster management is owner/manager only', () => {
    expect(canManageRoster('owner')).toBe(true)
    expect(canManageRoster('manager')).toBe(true)
    expect(canManageRoster('cashier')).toBe(false)
    expect(isStaffRole('none')).toBe(false)
  })
})
