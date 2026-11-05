import { describe, expect, it } from 'vitest'
import { buildCatalogQuery, formatShownCount, sortUiToApi } from './catalogQuery'

describe('sortUiToApi', () => {
  it('maps toolbar values to API sort query', () => {
    expect(sortUiToApi('pop')).toBe('pop')
    expect(sortUiToApi('price')).toBe('price_asc')
    expect(sortUiToApi('sale')).toBe('sale_first')
  })
})

describe('buildCatalogQuery', () => {
  it('omits all-category and empty property filters', () => {
    expect(
      buildCatalogQuery({
        categoryId: 'all',
        maxPriceRub: 7000,
        properties: [],
        sort: 'price',
        offset: 16,
      }),
    ).toEqual({
      categoryId: undefined,
      maxPriceRub: 7000,
      properties: undefined,
      sort: 'price_asc',
      limit: 16,
      offset: 16,
    })
  })

  it('passes category and properties when set', () => {
    expect(
      buildCatalogQuery({
        categoryId: 'beef',
        properties: ['chilled', 'fresh'],
        sort: 'sale',
      }),
    ).toMatchObject({
      categoryId: 'beef',
      properties: ['chilled', 'fresh'],
      sort: 'sale_first',
    })
  })
})

describe('formatShownCount', () => {
  it('uses Russian plural forms', () => {
    expect(formatShownCount(1)).toBe('Показано 1 товар')
    expect(formatShownCount(3)).toBe('Показано 3 товара')
    expect(formatShownCount(10)).toBe('Показано 10 товаров')
    expect(formatShownCount(11)).toBe('Показано 11 товаров')
    expect(formatShownCount(21)).toBe('Показано 21 товар')
    expect(formatShownCount(22)).toBe('Показано 22 товара')
  })
})
