import { send } from '../../../shared/api/send'
import { isStaffOrderBody, isStaffOrderListBody } from '../../../shared/api/backend/staffBodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function listStaffOrders(signal) {
  return send(BACKEND.staff.orders, { signal, bearer: true, guard: isStaffOrderListBody })
}

/** @param {string} orderId @param {string} status */
export function patchStaffOrderStatus(orderId, status, signal) {
  return send(BACKEND.staff.order(orderId), {
    method: 'PATCH',
    bearer: true,
    signal,
    body: { status },
    guard: isStaffOrderBody,
  })
}
