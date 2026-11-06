/** Placeholder panels from site/admin — live write in stories 13–16. */

export function CatalogShell() {
  return (
    <section id="panel-catalog" role="tabpanel" aria-labelledby="tab-catalog" data-testid="panel-catalog">
      <div className="admin-toolbar">
        <label className="admin-field grow">
          <span>Поиск</span>
          <input type="search" placeholder="Имя или код" disabled />
        </label>
        <button className="admin-btn solid" type="button" disabled>
          Новый товар
        </button>
      </div>
      <p className="admin-empty">Каркас каталога — правка SKU в следующей истории.</p>
    </section>
  )
}

export function OrdersShell() {
  return (
    <section id="panel-orders" role="tabpanel" aria-labelledby="tab-orders" data-testid="panel-orders">
      <div className="admin-toolbar">
        <label className="admin-field grow">
          <span>Поиск</span>
          <input type="search" placeholder="Номер, имя, телефон" disabled />
        </label>
      </div>
      <p className="admin-empty">Каркас заказов — статусы появятся позже.</p>
    </section>
  )
}

export function StatsShell() {
  return (
    <section id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" data-testid="panel-stats">
      <p className="admin-empty">Статистика — каркас для владельца.</p>
    </section>
  )
}

export function MoneyShell() {
  return (
    <section id="panel-money" role="tabpanel" aria-labelledby="tab-money" data-testid="panel-money">
      <p className="admin-empty">Деньги — каркас для владельца.</p>
    </section>
  )
}
