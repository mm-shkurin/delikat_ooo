import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/catalog', label: 'Каталог', external: false },
  { to: '/catalog#sale', label: 'Акции', external: false },
  { hash: 'delivery', label: 'Доставка и оплата' },
  { hash: 'about', label: 'О нас' },
  { hash: 'packaging', label: 'Упаковка' },
  { hash: 'recipes', label: 'Рецепты' },
  { hash: 'contacts', label: 'Контакты' },
]

/**
 * @param {{
 *   chrome: ReturnType<import('../../../shared/storeChrome/useStoreChrome').useStoreChrome>,
 *   onOpenAuth: () => void,
 * }} props
 */
export function LandingNav({ chrome, onOpenAuth }) {
  return (
    <header className="nav wrap">
      <div className="nav-bar">
        <button className="logo" type="button" onClick={() => chrome.scrollToId('welcome')} aria-label="Деликат + — на главную">
          <img className="logo-img" src="/assets/logo/logo.svg" alt="Деликат +" />
        </button>
        <nav className="nav-links" aria-label="Разделы">
          {NAV_LINKS.map((item) =>
            item.hash ? (
              <a
                key={item.hash}
                href={`#${item.hash}`}
                onClick={(e) => {
                  e.preventDefault()
                  chrome.scrollToId(item.hash)
                }}
              >
                {item.label}
              </a>
            ) : (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="nav-right">
          <div className="theme-toggle" role="group" aria-label="Фон">
            <button
              type="button"
              data-theme-set="wine"
              aria-pressed={chrome.theme === 'wine'}
              title="Бордовый фон"
              onClick={() => chrome.setTheme('wine')}
            >
              ●
            </button>
            <button
              type="button"
              data-theme-set="charcoal"
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
            aria-label="Город"
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
          <button
            className="icon-circle cart"
            type="button"
            aria-label="Корзина"
            onClick={() => chrome.openLayer('cart')}
          >
            ▤
            {chrome.cartCount > 0 ? <span>{chrome.cartCount}</span> : null}
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
      <div className={`menu-pop glass${chrome.menuOpen ? ' open' : ''}`} id="menu-pop">
        {NAV_LINKS.map((item) =>
          item.hash ? (
            <a
              key={`m-${item.hash}`}
              href={`#${item.hash}`}
              onClick={(e) => {
                e.preventDefault()
                chrome.scrollToId(item.hash)
              }}
            >
              {item.label}
            </a>
          ) : (
            <Link key={`m-${item.to}`} to={item.to} onClick={() => chrome.setMenuOpen(false)}>
              {item.label}
            </Link>
          ),
        )}
        <button type="button" onClick={() => chrome.openLayer('address')}>
          Адрес доставки
        </button>
      </div>
    </header>
  )
}
