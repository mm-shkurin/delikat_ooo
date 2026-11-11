import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  isCartBody,
  isCategoryListBody,
  isOrderCreatedBody,
  isProductListBody,
  isStaffMeBody,
  isStaffMemberListBody,
  isStaffProductListBody,
  isUserProfileBody,
} from './bodyGuards'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../../../')
const examples = join(repoRoot, 'ProductSpecification/api-specs/examples')

function load(name) {
  return JSON.parse(readFileSync(join(examples, name), 'utf-8'))
}

describe('bodyGuards vs api-spec examples', () => {
  it('catalog-categories.json', () => {
    expect(isCategoryListBody(load('catalog-categories.json'))).toBe(true)
  })

  it('catalog-products-page.json', () => {
    expect(isProductListBody(load('catalog-products-page.json'))).toBe(true)
  })

  it('cart-filled.json', () => {
    expect(isCartBody(load('cart-filled.json'))).toBe(true)
  })

  it('order-created.json', () => {
    expect(isOrderCreatedBody(load('order-created.json'))).toBe(true)
  })

  it('me-profile.json', () => {
    expect(isUserProfileBody(load('me-profile.json'))).toBe(true)
  })

  it('staff-me.json', () => {
    expect(isStaffMeBody(load('staff-me.json'))).toBe(true)
  })

  it('staff-members.json', () => {
    expect(isStaffMemberListBody(load('staff-members.json'))).toBe(true)
  })

  it('staff-catalog-products.json', () => {
    expect(isStaffProductListBody(load('staff-catalog-products.json'))).toBe(true)
  })
})
