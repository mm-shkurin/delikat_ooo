import { send } from '../../../shared/api/send'
import { isOrderCreatedBody } from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

/**
 * @param {{ customerNote?: string, idempotencyKey: string, signal?: AbortSignal }} options
 */
export function createOrder({ customerNote, idempotencyKey, signal }) {
  const body = customerNote ? { customer_note: customerNote } : undefined
  return send(BACKEND.orders.create, {
    method: 'POST',
    body,
    signal,
    headers: { 'Idempotency-Key': idempotencyKey },
    guard: isOrderCreatedBody,
  })
}
