import { describe, expect, it } from 'vitest'
import { buildFulfillmentUpdate } from './fulfillmentPayload'

describe('buildFulfillmentUpdate', () => {
  it('sends street for delivery', () => {
    expect(buildFulfillmentUpdate('delivery', '  Ленина 10  ')).toEqual({
      mode: 'delivery',
      address: { city: 'Омск', street_line: 'Ленина 10' },
    })
  })

  it('allows empty street on delivery (server validates at add/checkout)', () => {
    expect(buildFulfillmentUpdate('delivery', '')).toEqual({
      mode: 'delivery',
      address: { city: 'Омск', street_line: null },
    })
  })

  it('clears street for pickup', () => {
    expect(buildFulfillmentUpdate('pickup', 'Ленина 10')).toEqual({
      mode: 'pickup',
      address: { city: 'Омск', street_line: null },
    })
  })
})
