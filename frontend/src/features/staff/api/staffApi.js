import { send } from '../../../shared/api/send'
import {
  isStaffMeBody,
  isStaffMemberBody,
  isStaffMemberListBody,
} from '../../../shared/api/backend/bodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function getStaffMe(signal) {
  return send(BACKEND.staff.me, { signal, bearer: true, guard: isStaffMeBody })
}

export function listStaffMembers(signal) {
  return send(BACKEND.staff.members, { signal, bearer: true, guard: isStaffMemberListBody })
}

/** @param {{ email: string, role: 'manager' | 'cashier' }} body */
export function assignStaffMember(body, signal) {
  return send(BACKEND.staff.members, {
    method: 'POST',
    bearer: true,
    signal,
    body,
    guard: isStaffMemberBody,
  })
}

/** @param {string} memberId @param {{ role: 'manager' | 'cashier' }} body */
export function updateStaffMemberRole(memberId, body, signal) {
  return send(BACKEND.staff.member(memberId), {
    method: 'PATCH',
    bearer: true,
    signal,
    body,
    guard: isStaffMemberBody,
  })
}

/** @param {string} memberId */
export function removeStaffMember(memberId, signal) {
  return send(BACKEND.staff.member(memberId), {
    method: 'DELETE',
    bearer: true,
    signal,
  })
}
