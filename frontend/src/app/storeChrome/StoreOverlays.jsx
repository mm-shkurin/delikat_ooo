import { AddressSheet } from './AddressSheet'
import { AuthSheet } from './AuthSheet'
import { CartSheet } from './CartSheet'
import { ReceiptSheet } from './ReceiptSheet'

/**
 * @param {{
 *   chrome: ReturnType<import('./useStoreChrome').useStoreChrome>,
 *   catalogMode?: boolean,
 *   productPanel?: React.ReactNode,
 * }} props
 */
export function StoreOverlays({ chrome, catalogMode = false, productPanel = null }) {
  const shadeVisible = chrome.layer !== null

  return (
    <>
      {chrome.cartCount > 0 ? (
        <button className="dock" id="dock" type="button" onClick={() => chrome.openLayer('cart')}>
          К заказу · {chrome.cartTotalLabel}
        </button>
      ) : null}

      {shadeVisible ? (
        <div className="shade" id="shade" role="presentation" onClick={chrome.closeLayers} />
      ) : null}

      {chrome.layer === 'product' && productPanel}
      {chrome.layer === 'cart' ? <CartSheet chrome={chrome} catalogMode={catalogMode} /> : null}
      {chrome.layer === 'receipt' && chrome.lastOrder ? <ReceiptSheet chrome={chrome} order={chrome.lastOrder} /> : null}
      {chrome.layer === 'address' ? <AddressSheet chrome={chrome} /> : null}
      {chrome.layer === 'auth' ? <AuthSheet chrome={chrome} /> : null}

      {chrome.privacyNoteVisible ? (
        <p id="privacy-note" className="wrap muted" style={{ padding: 16, background: '#fff' }} tabIndex={-1}>
          Адрес и состав корзины сохраняются на сервере для оформления заказа. JWT хранится локально до выхода.
        </p>
      ) : null}
    </>
  )
}
