import { describe, expect, it } from 'vitest'
import {
  CATALOG_EMPTY_COPY,
  PRODUCT_NOT_FOUND_COPY,
  PRODUCT_OPEN_FAILED_COPY,
  catalogEmptyCopy,
  isProductNotFoundError,
  productIdFromSearch,
  productPanelCopy,
  searchWithProduct,
} from './storefront'

function httpFailure(status, errorCode) {
  const error = new Error('http')
  error.status = status
  error.errorCode = errorCode
  return new Error('wrapped', { cause: error })
}

describe('product panel copy', () => {
  it('shows the exact not-found line only for a missing product', () => {
    expect(productPanelCopy({ loading: false, notFound: true })).toBe(PRODUCT_NOT_FOUND_COPY)
    expect(PRODUCT_NOT_FOUND_COPY).toBe('товар не найден')
  })

  it('keeps the existing failure line for other open errors', () => {
    expect(productPanelCopy({ loading: false, notFound: false })).toBe(PRODUCT_OPEN_FAILED_COPY)
    expect(productPanelCopy({ loading: true, notFound: false })).toBe('Загрузка карточки…')
  })
})

describe('isProductNotFoundError', () => {
  it('treats 404 and product_not_found as the panel not-found case', () => {
    expect(isProductNotFoundError(httpFailure(404, 'product_not_found'))).toBe(true)
    expect(isProductNotFoundError(httpFailure(404, undefined))).toBe(true)
    expect(isProductNotFoundError(httpFailure(400, 'product_not_found'))).toBe(true)
  })

  it('leaves network and server failures on the generic panel line', () => {
    expect(isProductNotFoundError(new Error('offline'))).toBe(false)
    expect(isProductNotFoundError(httpFailure(500, 'internal'))).toBe(false)
    expect(isProductNotFoundError(httpFailure(400, 'validation_error'))).toBe(false)
  })
})

describe('catalog empty copy', () => {
  it('does not mention hidden products', () => {
    expect(catalogEmptyCopy(false)).toBe(CATALOG_EMPTY_COPY)
    expect(CATALOG_EMPTY_COPY.toLowerCase()).not.toContain('скрыт')
    expect(catalogEmptyCopy(true)).not.toContain('скрыт')
  })
})

describe('catalog product deep link', () => {
  it('reads and writes the product query', () => {
    expect(productIdFromSearch('?product=rib')).toBe('rib')
    expect(productIdFromSearch('')).toBeNull()
    expect(productIdFromSearch('?product=')).toBeNull()
    expect(searchWithProduct('', 'rib')).toBe('?product=rib')
    expect(searchWithProduct('?product=rib', null)).toBe('')
    expect(searchWithProduct('?foo=1', 'hidden-sku')).toBe('?foo=1&product=hidden-sku')
  })
})
