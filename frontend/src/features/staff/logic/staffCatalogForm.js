export const PRODUCT_ID_PATTERN = /^[a-z][a-z0-9-]{0,31}$/
export const PROPERTY_OPTIONS = [
  { value: 'chilled', label: 'Охлаждённое' },
  { value: 'frozen', label: 'Замороженное' },
  { value: 'fresh', label: 'Свежее' },
  { value: 'premium', label: 'Премиум' },
]
export const BADGE_OPTIONS = [
  { value: '', label: 'Нет' },
  { value: 'NEW', label: 'NEW' },
  { value: 'SALE', label: 'SALE' },
  { value: 'TOP', label: 'TOP' },
]

export function emptyEditorDraft() {
  return {
    id: '',
    name: '',
    categoryId: '',
    weightLabel: '',
    price: '',
    compareAt: '',
    popularity: '50',
    badge: '',
    marbleGrade: '',
    description: '',
    properties: [],
    hidden: false,
  }
}

/** @param {ReturnType<import('./staffCatalogView').staffProductToView>} product */
export function draftFromProduct(product) {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    weightLabel: product.weightLabel,
    price: String(product.price),
    compareAt: product.was == null ? '' : String(product.was),
    popularity: String(product.popularity),
    badge: product.badge ?? '',
    marbleGrade: product.marbleGrade ?? '',
    description: product.description ?? '',
    properties: [...product.properties],
    hidden: product.hidden,
  }
}

function parseRequiredInt(raw, min, max, label) {
  const text = String(raw ?? '').trim()
  if (!text) return { error: `Укажите ${label}.` }
  if (!/^\d+$/.test(text)) return { error: `${label} — целое число.` }
  const value = Number(text)
  if (value < min || value > max) return { error: `${label}: от ${min} до ${max}.` }
  return { value }
}

function parseOptionalInt(raw, label) {
  const text = String(raw ?? '').trim()
  if (!text) return { value: null }
  if (!/^\d+$/.test(text)) return { error: `${label} — пусто или целое число.` }
  return { value: Number(text) }
}

/**
 * @param {ReturnType<typeof emptyEditorDraft>} draft
 * @param {{ mode: 'create' | 'edit', hasImage: boolean, keepImage: boolean }} opts
 */
export function validateEditorDraft(draft, opts) {
  /** @type {Record<string, string>} */
  const fieldErrors = {}
  if (opts.mode === 'create') {
    const id = draft.id.trim()
    if (!PRODUCT_ID_PATTERN.test(id)) {
      fieldErrors.id = 'Код: латиница, цифры, дефис; начинается с буквы (до 32).'
    }
  }
  if (!draft.name.trim()) fieldErrors.name = 'Укажите название.'
  if (!draft.categoryId) fieldErrors.categoryId = 'Выберите категорию.'
  if (!draft.weightLabel.trim()) fieldErrors.weightLabel = 'Укажите вес.'

  const price = parseRequiredInt(draft.price, 1, 99999, 'Цену')
  if (price.error) fieldErrors.price = price.error
  const popularity = parseRequiredInt(draft.popularity, 0, 100, 'Популярность')
  if (popularity.error) fieldErrors.popularity = popularity.error
  const compare = parseOptionalInt(draft.compareAt, '«Было»')
  if (compare.error) fieldErrors.compareAt = compare.error

  const badge = draft.badge || null
  if (badge && !['NEW', 'SALE', 'TOP'].includes(badge)) {
    fieldErrors.badge = 'Плашка: NEW, SALE, TOP или нет.'
  }
  if (badge === 'SALE') {
    if (compare.value == null) fieldErrors.compareAt = 'Для SALE укажите цену «Было».'
    else if (price.value != null && compare.value <= price.value) {
      fieldErrors.compareAt = '«Было» должно быть больше цены.'
    }
  } else if (compare.value != null && price.value != null && compare.value <= price.value) {
    fieldErrors.compareAt = '«Было» должно быть больше цены.'
  }

  if (opts.mode === 'create' && !opts.hasImage) {
    fieldErrors.image = 'Добавьте фото товара.'
  }
  if (opts.mode === 'edit' && !opts.keepImage && !opts.hasImage) {
    fieldErrors.image = 'Оставьте текущее фото или выберите новое.'
  }

  const ok = Object.keys(fieldErrors).length === 0
  return {
    ok,
    fieldErrors,
    values: ok
      ? {
          id: draft.id.trim(),
          name: draft.name.trim(),
          categoryId: draft.categoryId,
          weightLabel: draft.weightLabel.trim(),
          priceRub: /** @type {number} */ (price.value),
          compareAt: compare.value,
          popularity: /** @type {number} */ (popularity.value),
          badge,
          marbleGrade: draft.marbleGrade.trim() || null,
          description: draft.description.trim() || null,
          properties: draft.properties,
          hidden: Boolean(draft.hidden),
        }
      : null,
  }
}

/** @param {NonNullable<ReturnType<typeof validateEditorDraft>['values']>} values @param {File} file */
export function buildCreateFormData(values, file) {
  const form = new FormData()
  form.append('id', values.id)
  form.append('name', values.name)
  form.append('category_id', values.categoryId)
  form.append('default_weight_label', values.weightLabel)
  form.append('price_rub', String(values.priceRub))
  form.append('popularity_score', String(values.popularity))
  form.append('properties', JSON.stringify(values.properties))
  form.append('hidden', values.hidden ? 'true' : 'false')
  if (values.compareAt != null) form.append('compare_at_price_rub', String(values.compareAt))
  if (values.badge) form.append('badge', values.badge)
  if (values.marbleGrade) form.append('marble_grade_label', values.marbleGrade)
  if (values.description) form.append('description', values.description)
  form.append('image', file)
  return form
}

/**
 * @param {NonNullable<ReturnType<typeof validateEditorDraft>['values']>} values
 * @param {ReturnType<import('./staffCatalogView').staffProductToView>} original
 */
export function buildPatchBody(values, original) {
  /** @type {Record<string, unknown>} */
  const body = {
    name: values.name,
    category_id: values.categoryId,
    default_weight_label: values.weightLabel,
    price_rub: values.priceRub,
    popularity_score: values.popularity,
    properties: values.properties,
    hidden: values.hidden,
    badge: values.badge,
    compare_at_price_rub: values.compareAt,
    marble_grade_label: values.marbleGrade,
    description: values.description,
  }
  // Always send nulls so server can clear (exclude_unset would skip undefined).
  void original
  return body
}
