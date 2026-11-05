import { send } from '../../../shared/api/send'
import { isCartBody } from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function getCart(signal) {
  return send(BACKEND.cart.root, { signal, guard: isCartBody })
}

/** @param {{ mode: 'delivery' | 'pickup', address?: { city?: string, street_line?: string } }} body */
export function updateFulfillment(body) {
  return send(BACKEND.cart.fulfillment, { method: 'PUT', body, guard: isCartBody })
}

/** @param {{ product_id: string, quantity?: number, weight_label?: string }} body */
export function addCartItem(body) {
  return send(BACKEND.cart.items, { method: 'POST', body, guard: isCartBody })
}

export function patchCartItem(lineId, quantity) {
  return send(BACKEND.cart.item(lineId), { method: 'PATCH', body: { quantity }, guard: isCartBody })
}

export function deleteCartItem(lineId) {
  return send(BACKEND.cart.item(lineId), { method: 'DELETE', guard: isCartBody })
}
