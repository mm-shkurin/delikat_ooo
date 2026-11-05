import { Link } from 'react-router-dom'

/**
 * @param {{
 *   chrome: ReturnType<import('../../../shared/storeChrome/useStoreChrome').useStoreChrome>,
 *   onOpenAuth: () => void,
 * }} props
 */
export function HeroSection({ chrome, onOpenAuth }) {
  return (
    <section className="hero wrap" aria-label="Главный экран">
      <div className="hero-main">
        <div>
          <div className="proof">
            <b className="glass">★ 4.9</b>
            <em className="glass">Свежее</em>
            <em className="glass">Мраморность</em>
            <em className="glass">Доставка</em>
          </div>
          <p className="hero-kicker">Fresh meat choice</p>
          <h1>
            <span>Деликат</span>Market
          </h1>
          <p className="hero-lead">Мраморная баранина на срезе. Режем под заказ и везём охлаждённой.</p>
          <div className="cta-row">
            <button
              className="btn-glass"
              id="mode-delivery"
              type="button"
              aria-pressed={chrome.mode === 'delivery'}
              onClick={() => chrome.setMode('delivery')}
            >
              Доставка
            </button>
            <button
              className="btn-glass"
              id="mode-pickup"
              type="button"
              aria-pressed={chrome.mode === 'pickup'}
              onClick={() => chrome.setMode('pickup')}
            >
              Самовывоз
            </button>
            <button className="btn-glass" id="login-cta" type="button" onClick={onOpenAuth}>
              {chrome.authMocked ? 'Кабинет' : 'Войти'}
            </button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <img src="/assets/hero/hero-meat.png" alt="" width="2400" height="1792" />
        </div>
      </div>
      <div className="hero-bottom">
        <Link className="hero-shop" to="/catalog">
          В мясной каталог
        </Link>
      </div>
    </section>
  )
}
