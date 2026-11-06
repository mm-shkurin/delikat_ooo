import { beforeEach, describe, expect, it } from 'vitest'
import { consumeAuthReturn, rememberAuthReturn } from './authReturn'

describe('authReturn', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('remembers and consumes a safe return path', () => {
    rememberAuthReturn('/admin')
    expect(consumeAuthReturn('/catalog')).toBe('/admin')
    expect(consumeAuthReturn('/catalog')).toBe('/catalog')
  })

  it('rejects protocol-relative paths', () => {
    rememberAuthReturn('//evil.example')
    expect(consumeAuthReturn('/catalog')).toBe('/catalog')
  })
})
