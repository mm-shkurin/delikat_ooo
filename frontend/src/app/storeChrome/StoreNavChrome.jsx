/**
 * Shared nav actions: theme, address chip, phone, profile, cart, burger.
 * @param {{
 *   chrome: {
 *     theme: string,
 *     setTheme: (next: string) => void,
 *     addressLabel: string,
 *     signedIn: boolean,
 *     cartCount: number,
 *     menuOpen: boolean,
 *     setMenuOpen: (open: boolean) => void,
 *     openLayer: (id: string) => void,
 *   },
 *   onOpenAuth: () => void,
 *   cartCountId?: string,
 * }} props
 */
export function StoreNavChrome({ chrome, onOpenAuth, cartCountId }) {
  return (
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
        {chrome.signedIn ? (
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
        {chrome.cartCount > 0 ? <span id={cartCountId}>{chrome.cartCount}</span> : null}
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
  )
}
