import { OrderCard } from './OrderCard'
import { useOrdersPanel } from '../useOrdersPanel'
import { FILTER_OPTIONS, ordersChrome } from '../logic/staffOrdersView'

export function OrdersPanel() {
  const panel = useOrdersPanel()
  const chrome = ordersChrome(panel.phase, panel.shown.length, panel.total)
  return (
    <section
      id="panel-orders"
      role="tabpanel"
      aria-labelledby="tab-orders"
      data-testid="panel-orders"
    >
      <div className="admin-toolbar">
        <label className="admin-field grow">
          <span>Поиск</span>
          <input
            type="search"
            placeholder="Номер, имя, почта"
            autoComplete="off"
            data-testid="orders-search"
            value={panel.query}
            onChange={(event) => panel.setQuery(event.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>Статус</span>
          <select
            aria-label="Фильтр статуса"
            data-testid="orders-filter"
            value={panel.filter}
            onChange={(event) => panel.setFilter(event.target.value)}
          >
            {FILTER_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {panel.banner ? (
        <p className="admin-error" role="alert" data-testid="orders-error">
          {panel.banner}
        </p>
      ) : null}
      {chrome.counter ? (
        <p className="order-count" data-testid="orders-count">
          {chrome.counter}
        </p>
      ) : null}
      {chrome.empty ? (
        <p className="admin-empty" data-testid="orders-empty">
          Заказов нет
        </p>
      ) : null}
      <ul className="order-list">
        {panel.phase === 'ready'
          ? panel.shown.map((order) => (
              <li key={order.order_id}>
                <OrderCard
                  order={order}
                  busy={panel.savingId === order.order_id}
                  onStatus={panel.changeStatus}
                />
              </li>
            ))
          : null}
      </ul>
    </section>
  )
}
