import { orderCardModel } from '../logic/staffOrdersView'

/**
 * @param {{
 *   order: Record<string, any>,
 *   busy: boolean,
 *   onStatus: (orderId: string, status: string) => void,
 * }} props
 */
export function OrderCard({ order, busy, onStatus }) {
  const card = orderCardModel(order)
  return (
    <article className="order-card" data-testid="order-card">
      <header className="order-card-head">
        <h2>{card.title}</h2>
        <span className="order-pill" data-status={order.status}>
          {card.pill}
        </span>
      </header>
      <p className="order-meta">{card.meta}</p>
      <p className="order-total">{card.total}</p>
      <p className="order-contact">{card.contact}</p>
      {card.note ? <p className="order-note">{card.note}</p> : null}
      <ul className="order-lines">
        {card.lines.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <label className="admin-field">
        <span>Статус</span>
        <select
          aria-label="Статус"
          data-testid="order-status"
          value={order.status}
          disabled={busy || card.statusDisabled}
          onChange={(event) => onStatus(order.order_id, event.target.value)}
        >
          {card.options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}
