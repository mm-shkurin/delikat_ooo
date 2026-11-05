import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { productSummaryToView } from './productView'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../../../')
const sample = JSON.parse(
  readFileSync(
    join(repoRoot, 'ProductSpecification/api-specs/examples/catalog-products-page.json'),
    'utf-8',
  ),
).items[0]

describe('productSummaryToView', () => {
  it('maps wire fields for UI', () => {
    const view = productSummaryToView(sample)
    expect(view.id).toBe('rib')
    expect(view.price).toBe(1450)
    expect(view.was).toBeNull()
    expect(view.imageUrl).toBe('/assets/products/ribeye.jpg')
  })
})
