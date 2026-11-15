import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OrderCard } from './OrderCard'

const order = {
  order_id: '11111111-1111-1111-1111-111111111111',
  status: 'accepted',
  total_rub: 1200,
  created_at: '2026-11-15T10:00:00+00:00',
  buyer_name: 'Гость',
  buyer_email: null,
  customer_note: null,
  fulfillment: { mode: 'pickup', address: { city: 'Омск', street_line: null } },
  lines: [
    {
      product_id: 'ribeye',
      product_name: 'Рибай',
      weight_label: '0.4 кг',
      unit_price_rub: 1200,
      quantity: 1,
      line_total_rub: 1200,
    },
  ],
  allowed_next: ['packing', 'cancelled'],
}

describe('OrderCard', () => {
  it('renders status control and line items', () => {
    render(<OrderCard order={order} busy={false} onStatus={vi.fn()} />)
    expect(screen.getByTestId('order-card')).toBeTruthy()
    expect(screen.getByTestId('order-status').value).toBe('accepted')
    expect(screen.getByText(/Рибай/)).toBeTruthy()
  })
})
