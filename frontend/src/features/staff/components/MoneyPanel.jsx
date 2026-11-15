import { channelIcon, formatRub, groupInflows, payTime, topQty } from '../logic/analyticsFormat'
import { useAnalyticsPanel } from '../useAnalyticsPanel'
import { BarChart } from './BarChart'
import { KpiRow } from './KpiRow'

const EMPTY = 'Нет данных'

export function MoneyPanel() {
  const panel = useAnalyticsPanel('money')
  const data = panel.data
  return (
    <section id="panel-money" role="tabpanel" aria-labelledby="tab-money" data-testid="panel-money">
      {panel.banner ? (
        <p className="admin-error" role="alert" data-testid="money-error">
          {panel.banner}
        </p>
      ) : null}
      {panel.phase === 'ready' && data ? (
        <>
          <KpiRow
            items={[
              ['Выручка', formatRub(data.revenue_rub)],
              ['Средний чек', formatRub(data.avg_check_rub)],
              ['Приходы', formatRub(data.inflow_rub)],
              ['Операций', String(data.operation_count)],
            ]}
          />
          <div className="stats-grid">
            <article className="chart-card chart-wide">
              <h2>Выручка по дням</h2>
              <p className="chart-lead">Сумма принятых заказов (без отменённых)</p>
              <BarChart
                ariaLabel="Столбчатый график выручки"
                empty={EMPTY}
                rows={data.revenue_by_day.map((row) => ({
                  label: row.label,
                  value: row.value_rub,
                  display: formatRub(row.value_rub),
                }))}
              />
            </article>
            <article className="chart-card chart-wide">
              <h2>Топ позиций</h2>
              <p className="chart-lead">Сколько штук заказали</p>
              <BarChart
                ariaLabel="Количество по товарам"
                empty={EMPTY}
                rows={topQty(data.top_by_qty).map((row) => ({
                  label: row.label,
                  value: row.quantity,
                  display: `${row.quantity} шт`,
                }))}
              />
            </article>
          </div>
          <section className="pay-block" aria-label="Приходы">
            <header className="pay-head">
              <div>
                <p className="pay-kicker">Счёт магазина</p>
                <h2>Приходы</h2>
              </div>
              <div className="pay-balance">
                <span>Доступно</span>
                <strong>{formatRub(data.inflow_rub)}</strong>
              </div>
            </header>
            <InflowFeed inflows={data.inflows} />
          </section>
        </>
      ) : null}
    </section>
  )
}

/** @param {{ inflows: Array<{ id: string, at: string, title: string, subtitle: string, amount_rub: number, channel: string }> }} props */
function InflowFeed({ inflows }) {
  if (!inflows.length) {
    return <div data-testid="pay-feed">{EMPTY}</div>
  }
  return (
    <div data-testid="pay-feed">
      {groupInflows(inflows).map(({ heading, row }) => (
        <div key={row.id}>
          {heading ? <h3 className="pay-day">{heading}</h3> : null}
          <article className="pay-row">
            <div className="pay-icon">{channelIcon(row.channel)}</div>
            <div className="pay-body">
              <strong>{row.title}</strong>
              <span>{row.subtitle}</span>
            </div>
            <div className="pay-right">
              <div className="pay-amount">+ {formatRub(row.amount_rub)}</div>
              <div className="pay-time">{payTime(row.at)}</div>
            </div>
          </article>
        </div>
      ))}
    </div>
  )
}
