import { describe, expect, it } from 'vitest'
import { orderCardModel, ordersChrome, statusOptions, visibleOrders } from './staffOrdersView'

const ID = 'b10e8400-e29b-41d4-a716-446655440000'

function order(patch = {}) {
  return {
    order_id: ID,
    status: 'accepted',
    allowed_next: ['packing', 'cancelled'],
    total_rub: 1450,
    created_at: '2026-11-14T12:00:00Z',
    buyer_name: 'Ада',
    buyer_email: 'Ada@Shop.test',
    customer_note: ' у двери ',
    fulfillment: { mode: 'delivery', address: { city: 'Омск', street_line: ' Ленина 10 ' } },
    lines: [
      {
        product_id: 'rib',
        product_name: 'Рибай',
        weight_label: '~350 г',
        quantity: 1,
        unit_price_rub: 1450,
        line_total_rub: 1450,
      },
    ],
    ...patch,
  }
}

describe('staffOrdersView', () => {
  it('offers the current status, then the next step, then cancelled', () => {
    expect(statusOptions(order()).map((item) => item.label)).toEqual([
      'Принят',
      'Собираем',
      'Отменён',
    ])
    const packing = order({ status: 'packing', allowed_next: ['ready', 'cancelled'] })
    expect(statusOptions(packing).map((item) => item.label)).toEqual([
      'Собираем',
      'Готов',
      'Отменён',
    ])
    expect(orderCardModel(order({ status: 'done', allowed_next: [] })).statusDisabled).toBe(true)
    expect(orderCardModel(order({ status: 'cancelled', allowed_next: [] })).statusDisabled).toBe(
      true,
    )
  })

  it('hides the counter until the list has loaded', () => {
    expect(ordersChrome('loading', 0, 0)).toEqual({ counter: null, empty: false })
    expect(ordersChrome('error', 0, 0)).toEqual({ counter: null, empty: false })
    expect(ordersChrome('ready', 0, 0)).toEqual({ counter: '0 из 0', empty: true })
    expect(ordersChrome('ready', 0, 3)).toEqual({ counter: '0 из 3', empty: true })
    expect(ordersChrome('ready', 2, 3).empty).toBe(false)
  })

  it('keeps cancelled orders when the filter is all', () => {
    const rows = [
      order({ status: 'cancelled', allowed_next: [], order_id: `${ID.slice(0, -1)}1` }),
      order({ status: 'done', allowed_next: [] }),
    ]
    expect(visibleOrders(rows, 'all', '').map((row) => row.status)).toEqual(['cancelled', 'done'])
    expect(visibleOrders(rows, 'done', '').map((row) => row.status)).toEqual(['done'])
  })

  it('searches number, name, email, note, and street, not the city', () => {
    const rows = [
      order(),
      order({
        buyer_name: 'Гость',
        buyer_email: null,
        customer_note: null,
        order_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        fulfillment: { mode: 'pickup', address: { city: 'Омск', street_line: '' } },
      }),
    ]
    expect(visibleOrders(rows, 'all', ' ада ').map((row) => row.buyer_name)).toEqual(['Ада'])
    expect(visibleOrders(rows, 'all', 'ADA@shop').length).toBe(1)
    expect(visibleOrders(rows, 'all', 'двери').length).toBe(1)
    expect(visibleOrders(rows, 'all', 'ленина').length).toBe(1)
    expect(visibleOrders(rows, 'all', ID.slice(0, 8)).length).toBe(1)
    expect(visibleOrders(rows, 'all', '   ').length).toBe(2)
    expect(visibleOrders(rows, 'all', 'Омск').length).toBe(0)
  })

  it('renders guest and signed-in cards without city, sku, or unit price', () => {
    const guest = orderCardModel(
      order({
        buyer_name: 'Гость',
        buyer_email: null,
        customer_note: '   ',
        fulfillment: { mode: 'pickup', address: { city: 'Омск', street_line: '  ' } },
      }),
    )
    expect(guest.title).toBe('Гость')
    expect(guest.contact).toBe(`№ ${ID.slice(0, 8)}`)
    expect(guest.note).toBeNull()
    expect(guest.meta.endsWith(' · Самовывоз')).toBe(true)
    expect(guest.meta).not.toContain('Омск')

    const named = orderCardModel(order())
    expect(named.contact).toBe(`Ada@Shop.test · № ${ID.slice(0, 8)}`)
    expect(named.meta.endsWith(' · Доставка · Ленина 10')).toBe(true)
    expect(named.note).toBe('у двери')
    expect(named.lines[0]).toContain(named.total)
    expect(named.lines[0]).not.toContain('rib')
    expect(named.meta).not.toContain('Омск')
    expect(named.total.endsWith('₽')).toBe(true)
  })
})
