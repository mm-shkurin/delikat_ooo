import { describe, expect, it } from 'vitest'
import { normalizeTheme } from './useTheme'

describe('normalizeTheme', () => {
  it('defaults unknown to wine', () => {
    expect(normalizeTheme(null)).toBe('wine')
    expect(normalizeTheme('')).toBe('wine')
  })

  it('keeps charcoal', () => {
    expect(normalizeTheme('charcoal')).toBe('charcoal')
  })
})
