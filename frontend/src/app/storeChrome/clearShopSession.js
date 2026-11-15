import { logout } from '../../features/auth/api/authApi'
import { resetGuestSession } from '../../features/cart/api/sessionApi'
import { endSession } from '../../shared/session/authSession'
import { removeSessionStorage } from '../../shared/browser/dom'
import { FULFILLMENT_STORAGE_KEY } from './logic/fulfillmentView'

/**
 * Full client reset: expiry hint, HttpOnly auth cookies (via logout), guest cookie, fulfillment.
 * @param {{ onLocalReset?: () => void }} [options]
 */
export async function clearShopSession(options = {}) {
  try {
    await logout()
  } catch {
    endSession()
  }
  endSession()
  removeSessionStorage(FULFILLMENT_STORAGE_KEY)
  try {
    await resetGuestSession()
  } catch {
    /* offline dev — local reset still useful */
  }
  options.onLocalReset?.()
}
