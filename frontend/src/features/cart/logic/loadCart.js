import { getCart } from '../api/cartApi'
import { createSession } from '../api/sessionApi'
import { httpErrorIn } from '../../../shared/api/httpResponse'

export async function loadCartWithSession() {
  try {
    return await getCart()
  } catch (error) {
    const failure = httpErrorIn(error)
    if (failure?.status === 401) {
      await createSession()
      return getCart()
    }
    throw error
  }
}
