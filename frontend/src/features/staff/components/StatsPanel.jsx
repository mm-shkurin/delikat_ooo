import { useAnalyticsPanel } from '../useAnalyticsPanel'
import { DonutChart } from './DonutChart'
import { KpiRow } from './KpiRow'
import '../analytics.css'
import '../analytics-more.css'

const EMPTY = 'Нет данных'

export function StatsPanel() {
  const panel = useAnalyticsPanel('stats')
  return (
    <section id="panel-stats" role="tabpanel" aria-labelledby="tab-stats" data-testid="panel-stats">
      {panel.banner ? (
        <p className="admin-error" role="alert" data-testid="stats-error">
          {panel.banner}
        </p>
      ) : null}
      {panel.phase === 'ready' && panel.data ? (
        <>
          <KpiRow
            items={[
              ['Заказов', String(panel.data.order_count)],
              ['Покупателей', String(panel.data.buyer_count)],
            ]}
          />
          <div className="stats-grid">
            <article className="chart-card">
              <h2>Кто заказывает</h2>
              <p className="chart-lead">Доля выручки по покупателям</p>
              <DonutChart slices={panel.data.buyer_slices} empty={EMPTY} />
            </article>
            <article className="chart-card">
              <h2>Что берут</h2>
              <p className="chart-lead">Доля выручки по товарам</p>
              <DonutChart slices={panel.data.product_slices} empty={EMPTY} />
            </article>
          </div>
        </>
      ) : null}
    </section>
  )
}
