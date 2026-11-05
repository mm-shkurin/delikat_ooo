/**
 * @param {{ onPrivacyClick: () => void }} props
 */
export function LandingFooter({ onPrivacyClick }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer-grid">
          <div id="delivery" style={{ scrollMarginTop: 72 }}>
            <h2>Доставка и оплата</h2>
            <p className="muted">Охлаждённая доставка по Омску. Оплата картой или при получении.</p>
          </div>
          <div id="about" style={{ scrollMarginTop: 72 }}>
            <h2>О нас</h2>
            <p className="muted">Премиальное мясо на заказ. Режем под вес и способ приготовления.</p>
          </div>
          <div id="recipes" style={{ scrollMarginTop: 72 }}>
            <h2>Рецепты</h2>
            <p className="muted">QR на упаковке — таймер прожарки и шаги приготовления.</p>
          </div>
          <div id="contacts" style={{ scrollMarginTop: 72 }}>
            <h2>Контакты</h2>
            <p className="muted">Омск · +7 (3812) 30-00-00</p>
          </div>
        </div>
        <p className="site-footer-bar">
          <span>Деликат · Омск</span>
          <a
            href="#privacy-note"
            id="privacy-link"
            onClick={(e) => {
              e.preventDefault()
              onPrivacyClick()
            }}
          >
            Как храним адрес
          </a>
        </p>
      </div>
    </footer>
  )
}
