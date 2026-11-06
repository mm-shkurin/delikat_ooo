import { useCallback, useEffect, useState } from 'react'
import { updateFulfillment } from '../../features/cart/api/cartApi'
import { buildFulfillmentUpdate } from '../../features/cart/logic/fulfillmentPayload'
import { loadCartWithSession } from '../../features/cart/logic/loadCart'
import { isAbortError } from '../../shared/api/abortError'
import { failureText } from '../../shared/api/failureText'
import { readStoredFulfillment } from './logic/fulfillmentView'
import { useUnmountSignal } from './useUnmountSignal'

/**
 * Loads guest/server cart once and syncs local fulfillment onto it.
 * @param {{
 *   applyCartBody: (body: unknown) => void,
 *   setFulfillmentError: (message: string) => void,
 * }} options
 */
export function useCartBootstrap({ applyCartBody, setFulfillmentError }) {
  const signal = useUnmountSignal()
  const [cartSyncing, setCartSyncing] = useState(true)

  const bootstrapCart = useCallback(async () => {
    const quiet = (error) => signal.aborted || isAbortError(error)
    setCartSyncing(true)
    try {
      const loaded = await loadCartWithSession(signal)
      if (signal.aborted) return
      applyCartBody(loaded)
      try {
        const local = readStoredFulfillment()
        const updated = await updateFulfillment(buildFulfillmentUpdate(local.mode, local.address), signal)
        if (signal.aborted) return
        applyCartBody(updated)
      } catch (error) {
        if (quiet(error)) return
        setFulfillmentError(failureText(error))
      }
    } catch (error) {
      if (quiet(error)) return
      setFulfillmentError(failureText(error))
    } finally {
      if (!signal.aborted) setCartSyncing(false)
    }
  }, [applyCartBody, setFulfillmentError, signal])

  useEffect(() => {
    bootstrapCart()
  }, [bootstrapCart])

  return { cartSyncing, bootstrapCart }
}
