import { describe, expect, it } from 'vitest'
import { safeImageUrl } from './safeImageUrl'

describe('safeImageUrl', () => {
  it('keeps root-relative paths', () => {
    expect(safeImageUrl('/assets/products/ribeye.jpg')).toBe('/assets/products/ribeye.jpg')
  })

  it('keeps https urls', () => {
    expect(safeImageUrl('https://cdn.example/ava.png')).toBe('https://cdn.example/ava.png')
  })

  it('rejects http, javascript, and protocol-relative', () => {
    expect(safeImageUrl('http://evil.test/x.png')).toBeNull()
    expect(safeImageUrl('javascript:alert(1)')).toBeNull()
    expect(safeImageUrl('//evil.test/x.png')).toBeNull()
    expect(safeImageUrl('')).toBeNull()
    expect(safeImageUrl(null)).toBeNull()
  })
})
