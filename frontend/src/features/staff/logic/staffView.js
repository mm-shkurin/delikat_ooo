import { ROLE_LABELS } from './staffAcl'

/** @param {{ user_id: string, email: string, display_name: string, role: string }} me */
export function staffMeToView(me) {
  return {
    userId: me.user_id,
    email: me.email,
    displayName: me.display_name,
    role: me.role,
    roleLabel: ROLE_LABELS[me.role] ?? me.role,
  }
}

/**
 * @param {{
 *   member_id: string
 *   user_id?: string | null
 *   email: string
 *   display_name?: string | null
 *   role: string
 *   status: string
 * }} member
 */
export function staffMemberToView(member) {
  return {
    memberId: member.member_id,
    userId: member.user_id ?? null,
    email: member.email,
    displayName: member.display_name ?? null,
    role: member.role,
    roleLabel: ROLE_LABELS[member.role] ?? member.role,
    status: member.status,
    statusLabel: member.status === 'pending' ? 'Ожидает вход' : 'Активен',
  }
}

/** @param {{ items: unknown[] }} list */
export function staffMemberListToView(list) {
  return (list.items ?? []).map(staffMemberToView)
}
