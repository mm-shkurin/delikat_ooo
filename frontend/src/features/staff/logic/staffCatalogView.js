/** @param {number} price @param {number | null | undefined} compareAt */
export function saleDiscountPercent(price, compareAt) {
  if (typeof price !== 'number' || typeof compareAt !== 'number') return null
  if (compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}

/**
 * @param {object} p StaffProduct wire
 * @param {Record<string, string>} [categoryTitleById]
 */
export function staffProductToView(p, categoryTitleById = {}) {
  const was = p.compare_at_price_rub ?? null
  const badge = p.badge ?? null
  const discountPercent =
    badge === 'SALE' ? saleDiscountPercent(p.price_rub, was) : null
  return {
    id: p.id,
    name: p.name,
    categoryId: p.category_id,
    categoryTitle: categoryTitleById[p.category_id] ?? p.category_id,
    weightLabel: p.default_weight_label,
    price: p.price_rub,
    was,
    discountPercent,
    popularity: p.popularity_score,
    properties: Array.isArray(p.properties) ? p.properties : [],
    badge,
    marbleGrade: p.marble_grade_label ?? null,
    imageUrl: p.image_url,
    description: p.description ?? null,
    hidden: Boolean(p.hidden),
    createdAt: p.created_at,
  }
}

/** @param {{ items?: unknown[] }} list @param {Record<string, string>} [categoryTitleById] */
export function staffProductListToView(list, categoryTitleById = {}) {
  return (list.items ?? []).map((row) => staffProductToView(row, categoryTitleById))
}

/** @param {string | null | undefined} current @param {'NEW' | 'SALE' | 'TOP'} next */
export function nextBadgeToggle(current, next) {
  return current === next ? null : next
}

export function formatRub(amount) {
  return `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`
}
