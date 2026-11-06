import { useCallback, useRef, useState } from 'react'
import { loadCartWithSession } from '../../features/cart/logic/loadCart'
import { createOrder } from '../../features/checkout/api/orderApi'
import { orderCreatedToView } from '../../features/checkout/logic/orderView'
import { isAbortError } from '../../shared/api/abortError'
import { failureText } from '../../shared/api/failureText'
import { httpErrorIn } from '../../shared/api/httpResponse'
import { useUnmountSignal } from './useUnmountSignal'

/**
 * Checkout busy/error, last order, and place-order flow.
 * @param {{
 *   applyCartBody: (body: unknown) => void,
 *   canCheckout: boolean,
 *   openLayer: (id: 'cart' | 'address' | 'auth' | 'product' | 'receipt') => void,
 *   setLayer: (id: null | 'cart' | 'address' | 'auth' | 'product' | 'receipt') => void,
 * }} options
 */
export function useCheckoutFlow({ applyCartBody, canCheckout, openLayer, setLayer }) {
  const signal = useUnmountSignal()
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [lastOrder, setLastOrder] = useState(
    /** @type {ReturnType<typeof orderCreatedToView> | null} */ (null),
  )

  const checkoutKey = useRef(/** @type {string | null} */ (null))
  const checkoutInFlight = useRef(false)

  const submitCheckout = useCallback(async () => {
    if (checkoutInFlight.current || !canCheckout) return
    checkoutInFlight.current = true
    setCheckoutBusy(true)
    setCheckoutError('')
    if (!checkoutKey.current) checkoutKey.current = crypto.randomUUID()
    try {
      const body = await createOrder({ idempotencyKey: checkoutKey.current, signal })
      if (signal.aborted) return
      const view = orderCreatedToView(body)
      setLastOrder(view)
      const cartBody = await loadCartWithSession(signal)
      if (signal.aborted) return
      applyCartBody(cartBody)
      setLayer('receipt')
      checkoutKey.current = null
    } catch (error) {
      if (signal.aborted || isAbortError(error)) return
      const failure = httpErrorIn(error)
      if (failure?.errorCode === 'address_required') {
        openLayer('address')
      }
      setCheckoutError(failureText(error))
    } finally {
      checkoutInFlight.current = false
      if (!signal.aborted) setCheckoutBusy(false)
    }
  }, [applyCartBody, canCheckout, openLayer, setLayer, signal])

  const clearCheckoutState = useCallback(() => {
    setCheckoutError('')
    setLastOrder(null)
  }, [])

  return {
    checkoutBusy,
    checkoutError,
    setCheckoutError,
    lastOrder,
    submitCheckout,
    clearCheckoutState,
  }
}
