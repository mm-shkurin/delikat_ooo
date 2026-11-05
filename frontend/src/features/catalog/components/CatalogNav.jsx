import { Link } from 'react-router-dom'

/**
 * @param {{
 *   chrome: ReturnType<import('../../../shared/storeChrome/useStoreChrome').useStoreChrome>,
 *   onOpenAuth: () => void,
 * }} props
 */
export function CatalogNav({ chrome, onOpenAuth }) {
  return (
    <header className="nav wrap">
      <div className="nav-bar">
        <Link className="logo" to="/" aria-label="Деликат + — на главную">
          <img className="logo-img" src="/assets/logo/logo.svg" alt="Деликат +" />
        </Link>
        <nav className="nav-links" aria-label="Разделы">
          <Link to="/catalog" aria-current="page">
            Каталог
          </Link>
          <Link to="/catalog#sale">Акции</Link>
          <Link to="/#delivery">Доставка и оплата</Link>
          <Link to="/#about">О нас</Link>
          <Link to="/#recipes">Рецепты</Link>
          <Link to="/#contacts">Контакты</Link>
        </nav>
        <div className="nav-right">
          <div className="theme-toggle" role="group" aria-label="Фон">
            <button
              type="button"
              aria-pressed={chrome.theme === 'wine'}
              title="Бордовый фон"
              onClick={() => chrome.setTheme('wine')}
            >
              ●
            </button>
            <button
              type="button"
              aria-pressed={chrome.theme === 'charcoal'}
              title="Тёмный фон"
              onClick={() => chrome.setTheme('charcoal')}
            >
              ◐
            </button>
          </div>
          <button
            className="nav-chip"
            type="button"
            data-testid="address-chip"
            onClick={() => chrome.openLayer('address')}
          >
            {chrome.addressLabel}
          </button>
          <a className="nav-phone" href="tel:+73812300000">
            +7 (3812) 30-00-00
          </a>
          <button className="icon-circle" type="button" aria-label="Профиль" onClick={onOpenAuth}>
            {chrome.authMocked ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12l5 5L20 7" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
              </svg>
            )}
          </button>
          <button className="icon-circle cart" type="button" aria-label="Корзина" onClick={() => chrome.openLayer('cart')}>
            ▤
            {chrome.cartCount > 0 ? <span id="cart-count">{chrome.cartCount}</span> : null}
          </button>
          <button
            className="burger"
            type="button"
            aria-expanded={chrome.menuOpen}
            aria-controls="menu-pop"
            aria-label="Меню"
            onClick={() => chrome.setMenuOpen(!chrome.menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
      <div className={`menu-pop${chrome.menuOpen ? ' open' : ''}`} id="menu-pop">
        <Link to="/catalog" aria-current="page" onClick={() => chrome.setMenuOpen(false)}>
          Каталог
        </Link>
        <Link to="/catalog#sale" onClick={() => chrome.setMenuOpen(false)}>
          Акции
        </Link>
        <Link to="/#delivery" onClick={() => chrome.setMenuOpen(false)}>
          Доставка и оплата
        </Link>
        <Link to="/#about" onClick={() => chrome.setMenuOpen(false)}>
          О нас
        </Link>
        <Link to="/#recipes" onClick={() => chrome.setMenuOpen(false)}>
          Рецепты
        </Link>
        <Link to="/#contacts" onClick={() => chrome.setMenuOpen(false)}>
          Контакты
        </Link>
        <button type="button" onClick={() => chrome.openLayer('address')}>
          Адрес доставки
        </button>
      </div>
    </header>
  )
}
