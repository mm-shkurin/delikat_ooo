import { Link } from 'react-router-dom'
import { StoreNavChrome } from '../../../app/storeChrome/StoreNavChrome'

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
 *   chrome: ReturnType<import('../../../app/storeChrome/useStoreChrome').useStoreChrome>,
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
        <StoreNavChrome chrome={chrome} onOpenAuth={onOpenAuth} />
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
