/** @typedef {'delivery' | 'pickup'} FulfillmentMode */

/**
 * Body for PUT /cart/fulfillment (store_api.yaml).
 * @param {FulfillmentMode} mode
 * @param {string} streetLine
 * @param {string} [city]
 */
export function buildFulfillmentUpdate(mode, streetLine, city = 'Омск') {
  const trimmed = streetLine.trim()
  if (mode === 'pickup') {
    return {
      mode: 'pickup',
      address: { city, street_line: null },
    }
  }
  return {
    mode: 'delivery',
    address: { city, street_line: trimmed || null },
  }
}
