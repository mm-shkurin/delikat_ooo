/** @param {number} shownCount */
export function refreshProductLimit(shownCount) {
  const shown = Number.isFinite(shownCount) ? shownCount : 0
  return Math.min(100, Math.max(16, shown))
}

/** @param {Array<{ id: string }>} categories @param {string} categoryId */
export function selectedCategoryMissing(categories, categoryId) {
  if (!categoryId || categoryId === 'all') return false
  return !categories.some((row) => row.id === categoryId)
}

/** @param {unknown} raw */
export function isCatalogChangedFrame(raw) {
  try {
    const body = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Boolean(body) && !Array.isArray(body) && body.type === 'catalog_changed'
  } catch {
    return false
  }
}
