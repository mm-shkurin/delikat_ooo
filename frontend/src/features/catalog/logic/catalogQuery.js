export const PAGE_SIZE = 16

/** @typedef {'pop' | 'price' | 'sale'} CatalogSortUi */

/**
 * @param {CatalogSortUi} uiSort
 * @returns {'pop' | 'price_asc' | 'sale_first'}
 */
export function sortUiToApi(uiSort) {
  if (uiSort === 'price') return 'price_asc'
  if (uiSort === 'sale') return 'sale_first'
  return 'pop'
}

/**
 * @param {{
 *   categoryId?: string
 *   maxPriceRub?: number
 *   properties?: string[]
 *   sort?: CatalogSortUi
 *   offset?: number
 *   limit?: number
 * }} state
 */
export function buildCatalogQuery(state) {
  const categoryId = state.categoryId === 'all' ? undefined : state.categoryId
  const properties = state.properties?.length ? state.properties : undefined
  return {
    categoryId,
    maxPriceRub: state.maxPriceRub,
    properties,
    sort: sortUiToApi(state.sort ?? 'pop'),
    limit: state.limit ?? PAGE_SIZE,
    offset: state.offset ?? 0,
  }
}

/** @param {number} count */
export function formatShownCount(count) {
  const n = Math.abs(count)
  const mod100 = n % 100
  const mod10 = n % 10
  let word = 'товаров'
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = 'товар'
    else if (mod10 >= 2 && mod10 <= 4) word = 'товара'
  }
  return `Показано ${count} ${word}`
}
