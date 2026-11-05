export function PackagingSection() {
  return (
    <section className="pack" id="packaging" aria-labelledby="pack-title">
      <div className="wrap pack-grid">
        <div>
          <p className="pack-badge">Интеллектуальная упаковка</p>
          <h2 id="pack-title">Идеальная прожарка в каждом стейке. Просто наведите камеру</h2>
          <p className="pack-lead">
            На каждой упаковке — персональный QR. Сканируете — открывается пошаговый рецепт, таймер прожарки и
            советы шефа бренда под ваш отруб.
          </p>
          <div className="pack-features">
            <div className="pack-feature">
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </i>
              <span>Персональный рецепт под ваш отруб</span>
            </div>
            <div className="pack-feature">
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </i>
              <span>Интерактивный таймер прожарки</span>
            </div>
            <div className="pack-feature">
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <path d="M8 14c0-4 1.5-7 4-7s4 3 4 7" />
                  <path d="M7 18h10" />
                  <path d="M12 7V4" />
                </svg>
              </i>
              <span>Секреты и лайфхаки от мастеров</span>
            </div>
          </div>
          <a className="pack-cta" href="#recipes">
            Попробовать демо рецепта →
          </a>
        </div>
        <div className="pack-visual">
          <img
            src="/assets/packaging/packaging.png"
            alt="Упаковка стейка Деликат с QR и приложением рецепта"
            width="1024"
            height="1024"
          />
        </div>
      </div>
    </section>
  )
}
