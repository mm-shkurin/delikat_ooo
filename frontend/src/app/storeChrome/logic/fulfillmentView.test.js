import { describe, expect, it } from 'vitest'
import {
  FULFILLMENT_STORAGE_KEY,
  addressChipLabel,
  readStoredFulfillment,
  writeStoredFulfillment,
} from './fulfillmentView'

describe('addressChipLabel', () => {
  it('shows pickup label', () => {
    expect(addressChipLabel({ mode: 'pickup', address: 'Ленина 1' })).toBe('Самовывоз')
  })

  it('shows street when delivery address set', () => {
    expect(addressChipLabel({ mode: 'delivery', address: '  Ленина 10  ' })).toBe('Ленина 10')
  })

  it('falls back to default city', () => {
    expect(addressChipLabel({ mode: 'delivery', address: '' })).toBe('Омск')
  })
})

describe('fulfillment storage', () => {
  it('round-trips mode and address', () => {
    sessionStorage.clear()
    writeStoredFulfillment({ mode: 'pickup', address: '  Ленина 10  ' })
    expect(readStoredFulfillment()).toEqual({ mode: 'pickup', address: 'Ленина 10' })
    expect(sessionStorage.getItem(FULFILLMENT_STORAGE_KEY)).toContain('"pickup"')
  })

  it('defaults when storage missing or invalid', () => {
    sessionStorage.clear()
    expect(readStoredFulfillment()).toEqual({ mode: 'delivery', address: '' })
    sessionStorage.setItem(FULFILLMENT_STORAGE_KEY, '{bad')
    expect(readStoredFulfillment()).toEqual({ mode: 'delivery', address: '' })
  })
})
