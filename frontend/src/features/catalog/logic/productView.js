/** Провод → поля UI (как catalog.js в site/, без переименования в *Api). */

export function productSummaryToView(p) {
  return {
    id: p.id,
    name: p.name,
    categoryId: p.category_id,
    weightLabel: p.default_weight_label,
    price: p.price_rub,
    was: p.compare_at_price_rub ?? null,
    popularity: p.popularity_score,
    properties: p.properties,
    badge: p.badge ?? null,
    marbleGrade: p.marble_grade_label ?? null,
    imageUrl: p.image_url,
  }
}

export function productDetailToView(p) {
  return {
    ...productSummaryToView(p),
    weightOptions: p.weight_options ?? [],
    description: p.description ?? null,
  }
}

/** Grid after a list fetch: exactly the live page, no leftover cards. */
export function catalogCardsFromList(items) {
  return items.map(productSummaryToView)
}
