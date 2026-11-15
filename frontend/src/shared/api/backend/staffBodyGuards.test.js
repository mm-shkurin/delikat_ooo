import { describe, expect, it } from 'vitest'
import {
  isStaffMoneyBody,
  isStaffOrderBody,
  isStaffOrderListBody,
  isStaffStatsBody,
} from './staffBodyGuards'

const line = {
  product_id: 'ribeye',
  product_name: 'Рибай',
  weight_label: '0.4 кг',
  unit_price_rub: 1200,
  quantity: 1,
  line_total_rub: 1200,
}

const order = {
  order_id: '11111111-1111-1111-1111-111111111111',
  status: 'accepted',
  total_rub: 1200,
  created_at: '2026-11-15T10:00:00+00:00',
  buyer_name: 'Гость',
  buyer_email: null,
  customer_note: null,
  fulfillment: { mode: 'pickup', address: { city: 'Омск', street_line: null } },
  lines: [line],
  allowed_next: ['packing', 'cancelled'],
}

describe('staffBodyGuards', () => {
  it('accepts a staff order list', () => {
    expect(isStaffOrderBody(order)).toBe(true)
    expect(isStaffOrderListBody({ items: [order] })).toBe(true)
    expect(isStaffOrderListBody({ items: [{ ...order, status: 'nope' }] })).toBe(false)
  })

  it('accepts stats and money payloads', () => {
    expect(
      isStaffStatsBody({
        order_count: 1,
        buyer_count: 1,
        buyer_slices: [{ label: 'Гость', value_rub: 100 }],
        product_slices: [{ label: 'Рибай', value_rub: 100 }],
      }),
    ).toBe(true)
    expect(
      isStaffMoneyBody({
        revenue_rub: 100,
        avg_check_rub: 100,
        inflow_rub: 100,
        operation_count: 1,
        revenue_by_day: [{ day: '2026-11-15', label: '15 ноя', value_rub: 100 }],
        top_by_qty: [{ label: 'Рибай', quantity: 1 }],
        pay_by_channel: [{ label: 'Наличные / карта в точке', value_rub: 100 }],
        inflows: [
          {
            id: '1',
            at: '2026-11-15T10:00:00+06:00',
            title: 'Заказ',
            subtitle: 'Гость',
            amount_rub: 100,
            channel: 'Наличные / карта в точке',
          },
        ],
      }),
    ).toBe(true)
  })
})
