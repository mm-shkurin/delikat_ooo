import { describe, expect, it } from 'vitest'
import { failureText } from './failureText'

function wrapped(status, errorCode) {
  const error = new Error('http')
  error.status = status
  error.errorCode = errorCode
  return new Error('wrapped', { cause: error })
}

describe('failureText product_not_found', () => {
  it('uses the same sentence for a hidden sku and an unknown sku', () => {
    const hidden = failureText(wrapped(404, 'product_not_found'))
    const missing = failureText(wrapped(404, 'product_not_found'))
    expect(hidden).toBe('Товар не найден.')
    expect(missing).toBe(hidden)
  })

  it('does not reuse that sentence for other cart failures', () => {
    expect(failureText(wrapped(500, 'internal'))).not.toBe('Товар не найден.')
    expect(failureText(new Error('offline'))).not.toBe('Товар не найден.')
  })
})
