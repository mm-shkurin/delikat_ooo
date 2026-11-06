import { Link } from 'react-router-dom'

/**
 * @param {{
 *   chrome: ReturnType<import('./useStoreChrome').useStoreChrome>,
 *   catalogMode: boolean,
 * }} props
 */
export function CartSheet({ chrome, catalogMode }) {
  return (
    <div className="panel drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button className="close" type="button" aria-label="Закрыть" onClick={chrome.closeLayers}>
        ×
      </button>
      <h2 id="cart-title">Корзина</h2>
      {chrome.cartSyncing ? <p className="muted">Загрузка…</p> : null}
      {!chrome.cartSyncing && chrome.cart.length === 0 ? (
        <p className="muted">{catalogMode ? 'Пока пусто.' : 'Пока пусто. Товары добавляются в каталоге.'}</p>
      ) : (
        chrome.cart.map((line) => (
          <div className="line" key={line.lineId}>
            <div>
              <strong>{line.name}</strong>
              <br />
              <span className="muted">{line.weightLabel}</span>
            </div>
            <div>
              <div className="qty">
                <button type="button" onClick={() => chrome.adjustLineQty(line.lineId, -1)}>
                  −
                </button>
                <span>{line.quantity}</span>
                <button type="button" onClick={() => chrome.adjustLineQty(line.lineId, 1)}>
                  +
                </button>
              </div>
              <div>{chrome.rub(line.lineTotal)}</div>
            </div>
          </div>
        ))
      )}
      <p>
        <strong>Итого {chrome.cartTotalLabel}</strong>
      </p>
      {catalogMode ? (
        <>
          <button
            className="btn btn-accent"
            id="checkout"
            type="button"
            disabled={!chrome.canCheckout || chrome.checkoutBusy || chrome.cartCount === 0}
            onClick={chrome.submitCheckout}
          >
            {chrome.checkoutBusy ? 'Оформляем…' : 'Оформить заказ'}
          </button>
          {chrome.checkoutError ? (
            <p className="muted" id="checkout-note" role="alert">
              {chrome.checkoutError}
            </p>
          ) : null}
        </>
      ) : (
        <Link className="btn btn-accent" to="/catalog" style={{ textAlign: 'center' }} onClick={chrome.closeLayers}>
          Открыть каталог
        </Link>
      )}
    </div>
  )
}
