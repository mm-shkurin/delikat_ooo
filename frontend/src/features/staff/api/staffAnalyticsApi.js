import { send } from '../../../shared/api/send'
import { isStaffMoneyBody, isStaffStatsBody } from '../../../shared/api/backend/staffBodyGuards'
import { BACKEND } from '../../../shared/api/backend/paths'

export function getStaffStats(signal) {
  return send(BACKEND.staff.stats, { signal, bearer: true, guard: isStaffStatsBody })
}

export function getStaffMoney(signal) {
  return send(BACKEND.staff.money, { signal, bearer: true, guard: isStaffMoneyBody })
}
