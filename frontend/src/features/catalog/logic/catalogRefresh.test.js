import { describe, expect, it } from 'vitest'
import { isCatalogChangedFrame, refreshProductLimit, selectedCategoryMissing } from './catalogRefresh'

describe('catalogRefresh', () => {
  it('refetches the cards already on screen, at least one page and at most 100', () => {
    expect(refreshProductLimit(0)).toBe(16)
    expect(refreshProductLimit(40)).toBe(40)
    expect(refreshProductLimit(140)).toBe(100)
  })

  it('drops a selected category that disappeared and keeps All', () => {
    expect(selectedCategoryMissing([{ id: 'beef' }], 'sauce')).toBe(true)
    expect(selectedCategoryMissing([{ id: 'beef' }], 'beef')).toBe(false)
    expect(selectedCategoryMissing([], 'all')).toBe(false)
  })

  it('accepts only the catalog change frame', () => {
    expect(isCatalogChangedFrame('{"type":"catalog_changed"}')).toBe(true)
    expect(isCatalogChangedFrame('{"type":"catalog_changed","hidden":true}')).toBe(true)
    expect(isCatalogChangedFrame('{"type":"other"}')).toBe(false)
  })
})
