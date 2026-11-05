import { describe, expect, it } from 'vitest'
import { cartToView } from './cartView'

describe('cartToView', () => {
  it('maps snake_case cart payload to view model', () => {
    const view = cartToView({
      fulfillment: { mode: 'delivery', address: { city: 'Омск', street_line: 'Ленина 10' } },
      items: [
        {
          line_id: 'line-1',
          product_id: 'rib',
          product_name: 'Стейк Рибай',
          weight_label: '~350 г',
          quantity: 2,
          unit_price_rub: 1450,
          line_total_rub: 2900,
        },
      ],
      items_count: 2,
      total_rub: 2900,
      can_checkout: true,
    })

    expect(view).toEqual({
      mode: 'delivery',
      city: 'Омск',
      streetLine: 'Ленина 10',
      itemsCount: 2,
      total: 2900,
      canCheckout: true,
      items: [
        {
          lineId: 'line-1',
          productId: 'rib',
          name: 'Стейк Рибай',
          weightLabel: '~350 г',
          quantity: 2,
          unitPrice: 1450,
          lineTotal: 2900,
        },
      ],
    })
  })
})
