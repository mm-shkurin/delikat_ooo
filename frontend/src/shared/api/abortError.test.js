import { describe, expect, it } from 'vitest'
import { isAbortError } from './abortError'

describe('isAbortError', () => {
  it('sees an abort through a wrapped cause', () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError')
    expect(isAbortError(abort)).toBe(true)
    expect(isAbortError(new Error('wrapped', { cause: abort }))).toBe(true)
    expect(isAbortError(new Error('other'))).toBe(false)
  })
})
