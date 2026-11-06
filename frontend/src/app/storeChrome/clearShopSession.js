import { logout } from '../../features/auth/api/authApi'
import { resetGuestSession } from '../../features/cart/api/sessionApi'
import { currentSession, endSession } from '../../shared/session/authSession'
import { FULFILLMENT_STORAGE_KEY } from './logic/fulfillmentView'

/**
 * Full client reset: JWT (localStorage), guest cookie, local fulfillment.
 * Server httpOnly JWT cookies are out of scope until the backend ships them.
 * @param {{ onLocalReset?: () => void }} [options]
 */
export async function clearShopSession(options = {}) {
  const session = currentSession()
  if (session?.accessToken) {
    try {
      await logout(session.refreshToken)
    } catch {
      endSession()
    }
  } else {
    endSession()
  }
  endSession()
  try {
    sessionStorage.removeItem(FULFILLMENT_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  try {
    await resetGuestSession()
  } catch {
    /* offline dev — local reset still useful */
  }
  options.onLocalReset?.()
}
