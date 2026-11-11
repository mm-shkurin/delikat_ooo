import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  formatRub,
  nextBadgeToggle,
  saleDiscountPercent,
  staffProductListToView,
  staffProductToView,
} from './staffCatalogView'

const example = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      '../../../../../ProductSpecification/api-specs/examples/staff-catalog-products.json',
    ),
    'utf-8',
  ),
)

describe('staffCatalogView', () => {
  it('computes SALE discount percent as round((was − price) / was × 100)', () => {
    expect(saleDiscountPercent(1290, 1490)).toBe(13)
    expect(saleDiscountPercent(990, 1190)).toBe(17)
    expect(saleDiscountPercent(100, 100)).toBeNull()
  })

  it('maps SALE row with struck was + percent', () => {
    const sale = example.items[0]
    const view = staffProductToView(sale, { beef: 'Говядина' })
    expect(view).toMatchObject({
      id: 'beef',
      categoryTitle: 'Говядина',
      price: 1290,
      was: 1490,
      badge: 'SALE',
      discountPercent: 13,
      hidden: false,
    })
    expect(formatRub(view.price)).toContain('₽')
  })

  it('maps list and toggles badge off when same pill pressed', () => {
    const views = staffProductListToView(example, { marble: 'Мраморное' })
    expect(views).toHaveLength(3)
    expect(views[1].categoryTitle).toBe('Мраморное')
    expect(views[2].hidden).toBe(true)
    expect(nextBadgeToggle('TOP', 'TOP')).toBeNull()
    expect(nextBadgeToggle(null, 'NEW')).toBe('NEW')
  })
})
