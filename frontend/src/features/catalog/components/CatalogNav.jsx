import { Link } from 'react-router-dom'
import { StoreNavChrome } from '../../../app/storeChrome/StoreNavChrome'

/**
 * @param {{
 *   chrome: ReturnType<import('../../../app/storeChrome/useStoreChrome').useStoreChrome>,
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
        <StoreNavChrome chrome={chrome} onOpenAuth={onOpenAuth} cartCountId="cart-count" />
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
