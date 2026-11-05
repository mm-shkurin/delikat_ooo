import { describe, expect, it } from 'vitest'
import { orderCreatedToView } from './orderView'

describe('orderCreatedToView', () => {
  it('maps order created response', () => {
    const view = orderCreatedToView({
      order_id: 'ord-1',
      status: 'accepted',
      total_rub: 2900,
      message: 'OK',
      fulfillment: { mode: 'delivery', address: { city: 'Омск', street_line: 'Ленина 10' } },
      lines: [
        {
          product_id: 'rib',
          product_name: 'Стейк Рибай',
          weight_label: '~350 г',
          quantity: 2,
          unit_price_rub: 1450,
          line_total_rub: 2900,
        },
      ],
    })

    expect(view.orderId).toBe('ord-1')
    expect(view.streetLine).toBe('Ленина 10')
    expect(view.lines[0].name).toBe('Стейк Рибай')
  })
})
