import { useCallback, useState } from 'react'
import {
  addCartItem,
  deleteCartItem,
  patchCartItem,
  updateFulfillment,
} from '../../features/cart/api/cartApi'
import { buildFulfillmentUpdate } from '../../features/cart/logic/fulfillmentPayload'
import { cartToView } from '../../features/cart/logic/cartView'
import { failureText } from '../../shared/api/failureText'
import { httpErrorIn } from '../../shared/api/httpResponse'
import { readStoredFulfillment, writeStoredFulfillment } from './logic/fulfillmentView'

/** @param {'delivery' | 'pickup'} [mode] @param {string} [streetLine] */
function emptyCart(mode = 'delivery', streetLine = '') {
  return {
    mode,
    city: 'Омск',
    streetLine,
    items: [],
    itemsCount: 0,
    total: 0,
    canCheckout: false,
  }
}

/**
 * Cart fulfillment and line mutations for store chrome.
 * @param {{
 *   openLayer: (id: 'cart' | 'address' | 'auth' | 'product' | 'receipt') => void,
 *   setLayer: (id: null | 'cart' | 'address' | 'auth' | 'product' | 'receipt') => void,
 *   reportCartError: (message: string) => void,
 * }} options
 */
export function useCartMutations({ openLayer, setLayer, reportCartError }) {
  const [mode, setModeState] = useState(() => readStoredFulfillment().mode)
  const [address, setAddressState] = useState(() => readStoredFulfillment().address)
  const [cartView, setCartView] = useState(() => {
    const stored = readStoredFulfillment()
    return emptyCart(stored.mode, stored.address)
  })
  const [fulfillmentError, setFulfillmentError] = useState('')
  const [pendingAdd, setPendingAdd] = useState(
    /** @type {null | { name: string, note: string, price: number, qty: number, productId: string }} */ (null),
  )

  const applyCartBody = useCallback((body) => {
    const view = cartToView(body)
    setCartView(view)
    setModeState(view.mode)
    setAddressState(view.streetLine)
    writeStoredFulfillment({ mode: view.mode, address: view.streetLine })
  }, [])

  const setMode = useCallback(
    async (next) => {
      const previous = mode
      setModeState(next)
      writeStoredFulfillment({ mode: next, address })
      setFulfillmentError('')
      try {
        const body = await updateFulfillment(buildFulfillmentUpdate(next, address))
        applyCartBody(body)
      } catch (error) {
        setModeState(previous)
        writeStoredFulfillment({ mode: previous, address })
        setFulfillmentError(failureText(error))
      }
    },
    [address, applyCartBody, mode],
  )

  const saveAddress = useCallback(
    async (street) => {
      const trimmed = street.trim()
      if (!trimmed) return
      const previous = address
      setAddressState(trimmed)
      writeStoredFulfillment({ mode, address: trimmed })
      setFulfillmentError('')
      const queuedAdd = pendingAdd
      try {
        const body = await updateFulfillment(buildFulfillmentUpdate(mode, trimmed))
        applyCartBody(body)
        if (queuedAdd) {
          const cartBody = await addCartItem({
            product_id: queuedAdd.productId,
            weight_label: queuedAdd.note,
            quantity: queuedAdd.qty,
          })
          setPendingAdd(null)
          applyCartBody(cartBody)
          openLayer('cart')
        } else {
          setLayer(null)
        }
      } catch (error) {
        setAddressState(previous)
        writeStoredFulfillment({ mode, address: previous })
        setFulfillmentError(failureText(error))
      }
    },
    [address, applyCartBody, mode, openLayer, pendingAdd, setLayer],
  )

  const requestAddToCart = useCallback(
    async ({ productId, name, price, weightLabel, qty = 1 }) => {
      const note = weightLabel
      if (mode === 'delivery' && !address.trim()) {
        setPendingAdd({ productId, name, note, price, qty })
        openLayer('address')
        return
      }
      try {
        const body = await addCartItem({
          product_id: productId,
          weight_label: weightLabel,
          quantity: qty,
        })
        applyCartBody(body)
        openLayer('cart')
      } catch (error) {
        const failure = httpErrorIn(error)
        if (failure?.errorCode === 'address_required') {
          setPendingAdd({ productId, name, note, price, qty })
          openLayer('address')
          return
        }
        reportCartError(error instanceof Error ? error.message : 'Не удалось добавить в корзину.')
        openLayer('cart')
      }
    },
    [address, applyCartBody, mode, openLayer, reportCartError],
  )

  const adjustLineQty = useCallback(
    async (lineId, delta) => {
      const line = cartView.items.find((item) => item.lineId === lineId)
      if (!line) return
      const nextQty = line.quantity + delta
      if (nextQty > 99) return
      try {
        const body = nextQty <= 0 ? await deleteCartItem(lineId) : await patchCartItem(lineId, nextQty)
        applyCartBody(body)
      } catch (error) {
        reportCartError(error instanceof Error ? error.message : 'Не удалось изменить количество.')
      }
    },
    [applyCartBody, cartView.items, reportCartError],
  )

  const resetLocalCart = useCallback(() => {
    setFulfillmentError('')
    setPendingAdd(null)
    setModeState('delivery')
    setAddressState('')
    setCartView(emptyCart())
  }, [])

  return {
    mode,
    address,
    cartView,
    fulfillmentError,
    setFulfillmentError,
    applyCartBody,
    setMode,
    saveAddress,
    requestAddToCart,
    adjustLineQty,
    resetLocalCart,
  }
}
