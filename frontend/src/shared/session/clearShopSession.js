import { logout } from '../../features/auth/api/authApi'
import { resetGuestSession } from '../../features/cart/api/sessionApi'
import { FULFILLMENT_STORAGE_KEY } from '../storeChrome/logic/fulfillmentView'
import { currentSession, endSession } from './authSession'

/**
 * Full client reset before Wave 2 server cart: JWT, guest cookie, local fulfillment.
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
