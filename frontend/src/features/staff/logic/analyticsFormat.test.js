import { describe, expect, it } from 'vitest'
import { channelIcon, formatRub, payDayHeading, topSlices } from './analyticsFormat'
import { donutModel } from './donutModel'

describe('analyticsFormat', () => {
  it('formats rubles', () => {
    expect(formatRub(1500)).toMatch(/1.?500.?₽/)
  })

  it('caps slices at eight', () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({ label: String(i), value_rub: 10 - i }))
    expect(topSlices(rows)).toHaveLength(8)
  })

  it('maps channel icons', () => {
    expect(channelIcon('Наличные / карта в точке')).toBe('₽')
    expect(channelIcon('Онлайн-оплата')).toBe('↓')
  })

  it('labels Omsk today', () => {
    const now = new Date('2026-11-15T12:00:00+06:00')
    expect(payDayHeading('2026-11-15T09:00:00+06:00', now)).toBe('Сегодня')
    expect(payDayHeading('2026-11-14T09:00:00+06:00', now)).toBe('Вчера')
  })
})

describe('donutModel', () => {
  it('sums shown slices only', () => {
    const slices = Array.from({ length: 10 }, (_, i) => ({ label: String(i), value_rub: 100 }))
    const model = donutModel(slices)
    expect(model.legend).toHaveLength(8)
    expect(model.total).toBe(800)
  })
})
