/** Placeholder panels from site/admin. Orders are live (15). Stats and money stay shells until 16. */

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
