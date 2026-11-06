import { useCallback, useEffect, useRef, useState } from 'react'
import { getMe } from '../../features/auth/api/authApi'
import { profileToView } from '../../features/auth/logic/profileView'
import {
  addCartItem,
  deleteCartItem,
  patchCartItem,
  updateFulfillment,
} from '../../features/cart/api/cartApi'
import { buildFulfillmentUpdate } from '../../features/cart/logic/fulfillmentPayload'
import { loadCartWithSession } from '../../features/cart/logic/loadCart'
import { cartToView } from '../../features/cart/logic/cartView'
import { createOrder } from '../../features/checkout/api/orderApi'
import { orderCreatedToView } from '../../features/checkout/logic/orderView'
import { failureText } from '../../shared/api/failureText'
import { httpErrorIn } from '../../shared/api/httpResponse'
import { currentSession, endSession } from '../../shared/session/authSession'
import { clearShopSession } from './clearShopSession'
import { addressChipLabel, readStoredFulfillment, writeStoredFulfillment } from './logic/fulfillmentView'
import { useCartBootstrap } from './useCartBootstrap'
import { useDialogFocus } from './useDialogFocus'
import { useTheme } from './useTheme'

const rub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽'

/**
 * Store chrome: theme, fulfillment, server cart, auth overlays, checkout.
 */
export function useStoreChrome() {
  const { theme, setTheme } = useTheme()
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
  const [signedIn, setSignedIn] = useState(() => !!currentSession())
  const [userProfile, setUserProfile] = useState(
    /** @type {ReturnType<typeof profileToView> | null} */ (null),
  )
  const [profileBusy, setProfileBusy] = useState(false)
  const [privacyNoteVisible, setPrivacyNoteVisible] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [lastOrder, setLastOrder] = useState(
    /** @type {ReturnType<typeof orderCreatedToView> | null} */ (null),
  )
  const [pendingAdd, setPendingAdd] = useState(
    /** @type {null | { name: string, note: string, price: number, qty: number, productId: string }} */ (null),
  )
  const [activeProductId, setActiveProductId] = useState(/** @type {string | null} */ (null))

  const applyCartBody = useCallback((body) => {
    const view = cartToView(body)
    setCartView(view)
    setModeState(view.mode)
    setAddressState(view.streetLine)
    writeStoredFulfillment({ mode: view.mode, address: view.streetLine })
  }, [])

  const { cartSyncing, bootstrapCart } = useCartBootstrap({ applyCartBody, setCheckoutError })
  useDialogFocus(layer)

  const setMode = useCallback(
    async (next) => {
      const previous = mode
      setModeState(next)
      writeStoredFulfillment({ mode: next, address })
      try {
        const body = await updateFulfillment(buildFulfillmentUpdate(next, address))
        applyCartBody(body)
      } catch (error) {
        setModeState(previous)
        writeStoredFulfillment({ mode: previous, address })
        setCheckoutError(failureText(error))
      }
    },
    [address, applyCartBody, mode],
  )

  useEffect(() => {
    if (!layer) return
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setLayer(null)
        setActiveProductId(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [layer])

  const cartLines = cartView.items
  const cartCount = cartView.itemsCount
  const cartTotal = cartView.total
  const addressLabel = addressChipLabel({ mode, address })

  const closeLayers = useCallback(() => {
    setLayer(null)
    setActiveProductId(null)
    setCheckoutError('')
  }, [])

  const openLayer = useCallback((id) => {
    setLayer(id)
    setMenuOpen(false)
    if (id === 'cart') setCheckoutError('')
  }, [])

  const openProduct = useCallback(
    (productId) => {
      setActiveProductId(productId)
      openLayer('product')
    },
    [openLayer],
  )

  const saveAddress = useCallback(
    async (street) => {
      const trimmed = street.trim()
      if (!trimmed) return
      const previous = address
      setAddressState(trimmed)
      writeStoredFulfillment({ mode, address: trimmed })
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
        setCheckoutError(failureText(error))
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
    [address, applyCartBody, mode, openLayer],
  )

  const refreshUserProfile = useCallback(async () => {
    if (!currentSession()) {
      setUserProfile(null)
      setSignedIn(false)
      return null
    }
    setProfileBusy(true)
    try {
      const body = await getMe()
      const view = profileToView(body)
      setUserProfile(view)
      setSignedIn(true)
      return view
    } catch {
      endSession()
      setUserProfile(null)
      setSignedIn(false)
      return null
    } finally {
      setProfileBusy(false)
    }
  }, [])

  useEffect(() => {
    refreshUserProfile()
  }, [refreshUserProfile])

  const completeAuthMock = useCallback(() => {
    setSignedIn(true)
    setLayer(null)
    refreshUserProfile()
  }, [refreshUserProfile])

  const applyUserProfile = useCallback((view) => {
    setUserProfile(view)
    setSignedIn(true)
  }, [])

  const resetShopSession = useCallback(async () => {
    await clearShopSession({
      onLocalReset: () => {
        setCheckoutError('')
        setLastOrder(null)
        setPendingAdd(null)
        setUserProfile(null)
        setSignedIn(false)
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
  }, [bootstrapCart])

  const adjustLineQty = useCallback(
    async (lineId, delta) => {
      const line = cartView.items.find((item) => item.lineId === lineId)
      if (!line) return
      const nextQty = line.quantity + delta
      if (nextQty > 99) return
      try {
        const body =
          nextQty <= 0
            ? await deleteCartItem(lineId)
            : await patchCartItem(lineId, nextQty)
        applyCartBody(body)
      } catch (error) {
        setCheckoutError(error instanceof Error ? error.message : 'Не удалось изменить количество.')
      }
    },
    [applyCartBody, cartView.items],
  )

  const checkoutKey = useRef(/** @type {string | null} */ (null))
  const checkoutInFlight = useRef(false)

  const submitCheckout = useCallback(async () => {
    if (checkoutInFlight.current || !cartView.canCheckout) return
    checkoutInFlight.current = true
    setCheckoutBusy(true)
    setCheckoutError('')
    if (!checkoutKey.current) checkoutKey.current = crypto.randomUUID()
    try {
      const body = await createOrder({ idempotencyKey: checkoutKey.current })
      const view = orderCreatedToView(body)
      setLastOrder(view)
      const cartBody = await loadCartWithSession()
      applyCartBody(cartBody)
      setLayer('receipt')
      checkoutKey.current = null
    } catch (error) {
      const failure = httpErrorIn(error)
      if (failure?.errorCode === 'address_required') {
        openLayer('address')
      }
      setCheckoutError(error instanceof Error ? error.message : 'Не удалось оформить заказ.')
    } finally {
      checkoutInFlight.current = false
      setCheckoutBusy(false)
    }
  }, [applyCartBody, cartView.canCheckout, openLayer])

  const scrollToId = useCallback((id) => {
    const target = document.getElementById(id)
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }, [])

  return {
    theme,
    setTheme,
    mode,
    setMode,
    address,
    addressLabel,
    menuOpen,
    setMenuOpen,
    layer,
    openLayer,
    closeLayers,
    openProduct,
    activeProductId,
    saveAddress,
    completeAuthMock,
    refreshUserProfile,
    applyUserProfile,
    resetShopSession,
    userProfile,
    profileBusy,
    signedIn,
    privacyNoteVisible,
    setPrivacyNoteVisible,
    cart: cartLines,
    cartCount,
    cartTotal,
    cartTotalLabel: rub(cartTotal),
    cartSyncing,
    canCheckout: cartView.canCheckout,
    adjustLineQty,
    requestAddToCart,
    submitCheckout,
    checkoutBusy,
    checkoutError,
    lastOrder,
    scrollToId,
    rub,
  }
}
