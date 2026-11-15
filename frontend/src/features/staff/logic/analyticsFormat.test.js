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

  it('splits the ring evenly for equal slices', () => {
    const model = donutModel([
      { label: 'a', value_rub: 50 },
      { label: 'b', value_rub: 50 },
    ])
    const half = Math.PI * 58
    expect(model.arcs).toHaveLength(2)
    expect(model.arcs[0].dash).toBe(`${half} ${half}`)
    expect(model.arcs[1].offset).toBe(-half)
  })
})
