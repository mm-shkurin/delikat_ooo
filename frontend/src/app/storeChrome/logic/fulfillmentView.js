/** @typedef {'delivery' | 'pickup'} FulfillmentMode */

/**
 * @param {{ mode: FulfillmentMode, address?: string, defaultCity?: string }} input
 */
export function addressChipLabel({ mode, address = '', defaultCity = 'Омск' }) {
  if (mode === 'pickup') return 'Самовывоз'
  const trimmed = address.trim()
  return trimmed || defaultCity
}

export const THEME_STORAGE_KEY = 'delikat-theme'
export const FULFILLMENT_STORAGE_KEY = 'delikat.fulfillment'

/** @param {string | null | undefined} saved */
export function normalizeTheme(saved) {
  return saved === 'charcoal' ? 'charcoal' : 'wine'
}

/** @returns {{ mode: FulfillmentMode, address: string }} */
export function readStoredFulfillment() {
  const fallback = { mode: /** @type {FulfillmentMode} */ ('delivery'), address: '' }
  if (typeof sessionStorage === 'undefined') return fallback
  try {
    const raw = sessionStorage.getItem(FULFILLMENT_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const mode = parsed?.mode === 'pickup' ? 'pickup' : 'delivery'
    const address = typeof parsed?.address === 'string' ? parsed.address : ''
    return { mode, address }
  } catch {
    return fallback
  }
}

/** @param {{ mode: FulfillmentMode, address: string }} snapshot */
export function writeStoredFulfillment(snapshot) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(
    FULFILLMENT_STORAGE_KEY,
    JSON.stringify({ mode: snapshot.mode, address: snapshot.address.trim() }),
  )
}
