import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { updateMe } from '../../features/auth/api/authApi'
import { profileToView } from '../../features/auth/logic/profileView'

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

      {chrome.layer === 'cart' ? (
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
      ) : null}

      {chrome.layer === 'receipt' && chrome.lastOrder ? (
        <div className="panel drawer" id="receipt" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
          <button className="close" type="button" aria-label="Закрыть" onClick={chrome.closeLayers}>
            ×
          </button>
          <h2 id="receipt-title">Заказ оформлен</h2>
          <p className="muted">№ {chrome.lastOrder.orderId.slice(0, 8)}</p>
          <p>{chrome.lastOrder.message}</p>
          <ul className="muted" style={{ paddingLeft: 18 }}>
            {chrome.lastOrder.lines.map((line) => (
              <li key={`${line.productId}-${line.weightLabel}`}>
                {line.name} · {line.weightLabel} × {line.quantity} — {chrome.rub(line.lineTotal)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Итого {chrome.rub(chrome.lastOrder.total)}</strong>
          </p>
          <p className="muted">
            {chrome.lastOrder.mode === 'pickup'
              ? 'Самовывоз'
              : `${chrome.lastOrder.city}${chrome.lastOrder.streetLine ? `, ${chrome.lastOrder.streetLine}` : ''}`}
          </p>
          <button className="btn btn-accent" type="button" onClick={chrome.closeLayers}>
            Закрыть
          </button>
        </div>
      ) : null}

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

/** @param {{ chrome: ReturnType<import('./useStoreChrome').useStoreChrome> }} props */
function AddressSheet({ chrome }) {
  return (
    <form
      className="panel sheet"
      id="address"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-title"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        void chrome.saveAddress(String(data.get('street') ?? ''))
      }}
    >
      <button className="close" type="button" aria-label="Закрыть" onClick={chrome.closeLayers}>
        ×
      </button>
      <h2 id="address-title">Куда везти</h2>
      <p className="muted">Без улицы стейк в корзину не кладётся.</p>
      {chrome.checkoutError ? <p role="alert">{chrome.checkoutError}</p> : null}
      <label className="field" htmlFor="street">
        Улица и дом
      </label>
      <input
        id="street"
        name="street"
        type="text"
        required
        maxLength={80}
        placeholder="Ленина 10"
        defaultValue={chrome.address}
      />
      <button className="btn btn-accent" type="submit">
        Сохранить адрес
      </button>
    </form>
  )
}

/** @param {{ chrome: ReturnType<import('./useStoreChrome').useStoreChrome> }} props */
function AuthSheet({ chrome }) {
  const signedIn = chrome.signedIn && chrome.userProfile
  const [nameDraft, setNameDraft] = useState(chrome.userProfile?.displayName ?? '')
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (chrome.layer === 'auth' && chrome.signedIn && !chrome.userProfile && !chrome.profileBusy) {
      chrome.refreshUserProfile()
    }
  }, [chrome])

  useEffect(() => {
    setNameDraft(chrome.userProfile?.displayName ?? '')
  }, [chrome.userProfile?.displayName])

  const saveName = async (event) => {
    event.preventDefault()
    setSaveError('')
    setSaveBusy(true)
    try {
      const body = await updateMe(nameDraft)
      chrome.applyUserProfile(profileToView(body))
    } catch {
      setSaveError('Не удалось сохранить имя.')
    } finally {
      setSaveBusy(false)
    }
  }

  const signOut = () => {
    void chrome.resetShopSession()
  }

  return (
    <div className="panel sheet" id="auth" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="close" type="button" aria-label="Закрыть" onClick={chrome.closeLayers}>
        ×
      </button>
      <h2 id="auth-title">{signedIn ? 'Профиль' : 'Вход'}</h2>
      {chrome.profileBusy ? <p className="muted">Загрузка…</p> : null}
      {signedIn ? (
        <>
          {chrome.userProfile.avatarUrl ? (
            <img
              src={chrome.userProfile.avatarUrl}
              alt=""
              width={64}
              height={64}
              style={{ borderRadius: '50%', marginBottom: 12 }}
            />
          ) : null}
          <p className="muted">{chrome.userProfile.email}</p>
          <p className="muted" style={{ fontSize: 13 }}>
            В Yandex: {chrome.userProfile.providerDisplayName}
          </p>
          <form onSubmit={saveName}>
            <label className="field" htmlFor="display-name">
              Имя в магазине
            </label>
            <input
              id="display-name"
              name="displayName"
              type="text"
              required
              maxLength={120}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
            />
            {saveError ? <p className="muted">{saveError}</p> : null}
            <button className="btn btn-accent" type="submit" disabled={saveBusy} style={{ marginTop: 12 }}>
              {saveBusy ? 'Сохранение…' : 'Сохранить имя'}
            </button>
          </form>
          <button className="btn" type="button" style={{ marginTop: 12 }} onClick={signOut}>
            Выйти
          </button>
        </>
      ) : (
        <>
          <p className="muted">Yandex ID — аватар и имя подтягиваются при входе.</p>
          <button
            className="btn btn-accent"
            type="button"
            onClick={() => {
              import('../../features/auth/api/authApi').then(({ startYandexLogin }) => startYandexLogin())
            }}
          >
            Войти через Yandex
          </button>
        </>
      )}
    </div>
  )
}
