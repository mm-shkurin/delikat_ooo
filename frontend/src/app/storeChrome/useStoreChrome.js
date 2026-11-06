import { useCallback, useEffect, useRef, useState } from 'react'
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
import { elementById, onDocument } from '../../shared/browser/dom'
import { clearShopSession } from './clearShopSession'
import { addressChipLabel, readStoredFulfillment, writeStoredFulfillment } from './logic/fulfillmentView'
import { useAuthChrome } from './useAuthChrome'
import { useCartBootstrap } from './useCartBootstrap'
import { useCheckoutFlow } from './useCheckoutFlow'
import { useDialogFocus } from './useDialogFocus'
import { useTheme } from './useTheme'

const rub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'

/**
 * Store chrome composer: theme, fulfillment, cart, auth overlays, checkout.
 */
export function useStoreChrome() {
  const { theme, setTheme } = useTheme()
  const {
    signedIn,
    userProfile,
    profileBusy,
    privacyNoteVisible,
    setPrivacyNoteVisible,
    refreshUserProfile,
    completeAuth: markSignedIn,
    applyUserProfile,
    clearAuthState,
  } = useAuthChrome()

  const [mode, setModeState] = useState(() => readStoredFulfillment().mode)
  const [address, setAddressState] = useState(() => readStoredFulfillment().address)
  const [cartView, setCartView] = useState(() => ({
    mode: readStoredFulfillment().mode,
    city: 'Омск',
    streetLine: readStoredFulfillment().address,
    items: [],
    itemsCount: 0,
    total: 0,
    canCheckout: false,
  }))
  const [menuOpen, setMenuOpen] = useState(false)
  const [layer, setLayer] = useState(
    /** @type {null | 'cart' | 'address' | 'auth' | 'product' | 'receipt'} */ (null),
  )
  const [fulfillmentError, setFulfillmentError] = useState('')
  const [pendingAdd, setPendingAdd] = useState(
    /** @type {null | { name: string, note: string, price: number, qty: number, productId: string }} */ (null),
  )

  const clearCheckoutErrorRef = useRef(/** @type {(message: string) => void} */ (() => {}))

  const applyCartBody = useCallback((body) => {
    const view = cartToView(body)
    setCartView(view)
    setModeState(view.mode)
    setAddressState(view.streetLine)
    writeStoredFulfillment({ mode: view.mode, address: view.streetLine })
  }, [])

  const { cartSyncing, bootstrapCart } = useCartBootstrap({
    applyCartBody,
    setFulfillmentError,
  })
  useDialogFocus(layer)

  const openLayer = useCallback((id) => {
    setLayer(id)
    setMenuOpen(false)
    if (id === 'cart') clearCheckoutErrorRef.current('')
    if (id === 'address') setFulfillmentError('')
  }, [])

  const {
    checkoutBusy,
    checkoutError,
    setCheckoutError,
    lastOrder,
    submitCheckout,
    clearCheckoutState,
  } = useCheckoutFlow({
    applyCartBody,
    canCheckout: cartView.canCheckout,
    openLayer,
    setLayer,
  })
  clearCheckoutErrorRef.current = setCheckoutError

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

  useEffect(() => {
    if (!layer) return undefined
    return onDocument('keydown', (event) => {
      if (event.key === 'Escape') setLayer(null)
    })
  }, [layer])

  const closeLayers = useCallback(() => {
    setLayer(null)
    setCheckoutError('')
    setFulfillmentError('')
  }, [setCheckoutError])

  const openProduct = useCallback(() => {
    openLayer('product')
  }, [openLayer])

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
    [address, applyCartBody, mode, openLayer, pendingAdd],
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
        setCheckoutError(error instanceof Error ? error.message : 'Не удалось добавить в корзину.')
        openLayer('cart')
      }
    },
    [address, applyCartBody, mode, openLayer, setCheckoutError],
  )

  const completeAuth = useCallback(() => {
    markSignedIn()
    setLayer(null)
  }, [markSignedIn])

  const resetShopSession = useCallback(async () => {
    await clearShopSession({
      onLocalReset: () => {
        clearCheckoutState()
        setFulfillmentError('')
        setPendingAdd(null)
        clearAuthState()
        setLayer(null)
        setModeState('delivery')
        setAddressState('')
        setCartView({
          mode: 'delivery',
          city: 'Омск',
          streetLine: '',
          items: [],
          itemsCount: 0,
          total: 0,
          canCheckout: false,
        })
      },
    })
    await bootstrapCart()
  }, [bootstrapCart, clearAuthState, clearCheckoutState])

  const adjustLineQty = useCallback(
    async (lineId, delta) => {
      const line = cartView.items.find((item) => item.lineId === lineId)
      if (!line) return
      const nextQty = line.quantity + delta
      if (nextQty > 99) return
      try {
        const body =
          nextQty <= 0 ? await deleteCartItem(lineId) : await patchCartItem(lineId, nextQty)
        applyCartBody(body)
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : 'Не удалось изменить количество.')
      }
    },
    [applyCartBody, cartView.items, setCheckoutError],
  )

  const scrollToId = useCallback((id) => {
    const target = elementById(id)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }, [])

  return {
    theme,
    setTheme,
    mode,
    setMode,
    address,
    addressLabel: addressChipLabel({ mode, address }),
    menuOpen,
    setMenuOpen,
    layer,
    openLayer,
    closeLayers,
    openProduct,
    saveAddress,
    completeAuth,
    refreshUserProfile,
    applyUserProfile,
    resetShopSession,
    userProfile,
    profileBusy,
    signedIn,
    privacyNoteVisible,
    setPrivacyNoteVisible,
    cart: cartView.items,
    cartCount: cartView.itemsCount,
    cartTotal: cartView.total,
    cartTotalLabel: rub(cartView.total),
    cartSyncing,
    canCheckout: cartView.canCheckout,
    adjustLineQty,
    requestAddToCart,
    submitCheckout,
    checkoutBusy,
    checkoutError,
    fulfillmentError,
    lastOrder,
    scrollToId,
    rub,
  }
}
