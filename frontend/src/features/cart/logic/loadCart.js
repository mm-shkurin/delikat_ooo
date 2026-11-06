import { getCart } from '../api/cartApi'
import { createSession } from '../api/sessionApi'
import { isAbortError } from '../../../shared/api/abortError'
import { httpErrorIn } from '../../../shared/api/httpResponse'

/** @param {AbortSignal} [signal] */
export async function loadCartWithSession(signal) {
  try {
    return await getCart(signal)
  } catch (error) {
    if (signal?.aborted || isAbortError(error)) throw error
    const failure = httpErrorIn(error)
    if (failure?.status === 401) {
      await createSession(signal)
      return getCart(signal)
    }
    throw error
  }
}
