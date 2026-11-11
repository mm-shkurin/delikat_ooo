/** Placeholder panels from site/admin — live write in stories 14–16. Catalog is live (13). */

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
