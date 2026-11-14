import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { catalogCardsFromList, productSummaryToView } from './productView'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../../../')
const sample = JSON.parse(
  readFileSync(
    join(repoRoot, 'ProductSpecification/api-specs/examples/catalog-products-page.json'),
    'utf-8',
  ),
).items[0]

describe('productSummaryToView', () => {
  it('maps wire fields for UI', () => {
    const view = productSummaryToView(sample)
    expect(view.id).toBe('rib')
    expect(view.price).toBe(1450)
    expect(view.was).toBeNull()
    expect(view.imageUrl).toBe('/assets/products/ribeye.jpg')
    expect(view.badge).toBe('NEW')
    expect(view).not.toHaveProperty('hidden')
  })

  it('shows staff name, price, SALE badge, and the previous price', () => {
    const view = productSummaryToView({
      ...sample,
      name: 'Рибай недели',
      price_rub: 990,
      compare_at_price_rub: 1450,
      badge: 'SALE',
      image_url: '/api/v1/media/products/rib',
      hidden: true,
    })
    expect(view.name).toBe('Рибай недели')
    expect(view.price).toBe(990)
    expect(view.was).toBe(1450)
    expect(view.badge).toBe('SALE')
    expect(view.imageUrl).toBe('/api/v1/media/products/rib')
    expect(view).not.toHaveProperty('hidden')
  })
})

describe('catalogCardsFromList', () => {
  it('replaces the grid with the fetched live ids only', () => {
    const cards = catalogCardsFromList([
      { ...sample, name: 'Новый рибай', price_rub: 1100 },
      { ...sample, id: 'strip', name: 'Нью-Йорк', price_rub: 1290 },
    ])
    expect(cards.map((card) => card.id)).toEqual(['rib', 'strip'])
    expect(cards[0].name).toBe('Новый рибай')
    expect(cards[0].price).toBe(1100)
    expect(cards.some((card) => card.id === 'hidden-sku')).toBe(false)
  })
})
