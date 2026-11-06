import { useCallback, useEffect, useRef, useState } from 'react'
import { elementById, onDocument } from '../../shared/browser/dom'
import { clearShopSession } from './clearShopSession'
import { addressChipLabel } from './logic/fulfillmentView'
import { useAuthChrome } from './useAuthChrome'
import { useCartBootstrap } from './useCartBootstrap'
import { useCartMutations } from './useCartMutations'
import { useCheckoutFlow } from './useCheckoutFlow'
import { useDialogFocus } from './useDialogFocus'
import { useTheme } from './useTheme'

export const rub = (amount) => new Intl.NumberFormat('ru-RU').format(amount) + ' ₽'

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

  const [menuOpen, setMenuOpen] = useState(false)
  const [layer, setLayer] = useState(
    /** @type {null | 'cart' | 'address' | 'auth' | 'product' | 'receipt'} */ (null),
  )
  const clearCheckoutErrorRef = useRef(/** @type {(message: string) => void} */ (() => {}))
  const clearFulfillmentErrorRef = useRef(/** @type {() => void} */ (() => {}))

  const openLayer = useCallback((id) => {
    setLayer(id)
    setMenuOpen(false)
    if (id === 'cart') clearCheckoutErrorRef.current('')
    if (id === 'address') clearFulfillmentErrorRef.current()
  }, [])

  const reportCartError = useCallback((message) => {
    clearCheckoutErrorRef.current(message)
  }, [])

  const {
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
  } = useCartMutations({ openLayer, setLayer, reportCartError })
  clearFulfillmentErrorRef.current = () => setFulfillmentError('')

  const { cartSyncing, bootstrapCart } = useCartBootstrap({ applyCartBody, setFulfillmentError })
  useDialogFocus(layer)

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
  }, [setCheckoutError, setFulfillmentError])

  const openProduct = useCallback(() => {
    openLayer('product')
  }, [openLayer])

  const completeAuth = useCallback(() => {
    markSignedIn()
    setLayer(null)
  }, [markSignedIn])

  const resetShopSession = useCallback(async () => {
    await clearShopSession({
      onLocalReset: () => {
        clearCheckoutState()
        resetLocalCart()
        clearAuthState()
        setLayer(null)
      },
    })
    await bootstrapCart()
  }, [bootstrapCart, clearAuthState, clearCheckoutState, resetLocalCart])

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
