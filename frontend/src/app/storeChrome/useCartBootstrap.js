import { useCallback, useEffect, useState } from 'react'
import { updateFulfillment } from '../../features/cart/api/cartApi'
import { buildFulfillmentUpdate } from '../../features/cart/logic/fulfillmentPayload'
import { loadCartWithSession } from '../../features/cart/logic/loadCart'
import { failureText } from '../../shared/api/failureText'
import { readStoredFulfillment } from './logic/fulfillmentView'

/**
 * Loads guest/server cart once and syncs local fulfillment onto it.
 * @param {{
 *   applyCartBody: (body: unknown) => void,
 *   setCheckoutError: (message: string) => void,
 * }} options
 */
export function useCartBootstrap({ applyCartBody, setCheckoutError }) {
  const [cartSyncing, setCartSyncing] = useState(true)

  const bootstrapCart = useCallback(async () => {
    setCartSyncing(true)
    try {
      const loaded = await loadCartWithSession()
      applyCartBody(loaded)
      try {
        const local = readStoredFulfillment()
        const updated = await updateFulfillment(buildFulfillmentUpdate(local.mode, local.address))
        applyCartBody(updated)
      } catch (error) {
        setCheckoutError(failureText(error))
      }
    } catch (error) {
      setCheckoutError(failureText(error))
    } finally {
      setCartSyncing(false)
    }
  }, [applyCartBody, setCheckoutError])

  useEffect(() => {
    bootstrapCart()
  }, [bootstrapCart])

  return { cartSyncing, bootstrapCart }
}
