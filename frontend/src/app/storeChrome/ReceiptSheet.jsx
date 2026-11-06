/**
 * @param {{
 *   chrome: ReturnType<import('./useStoreChrome').useStoreChrome>,
 *   order: NonNullable<ReturnType<import('./useStoreChrome').useStoreChrome>['lastOrder']>,
 * }} props
 */
export function ReceiptSheet({ chrome, order }) {
  return (
    <div className="panel drawer" id="receipt" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
      <button className="close" type="button" aria-label="Закрыть" onClick={chrome.closeLayers}>
        ×
      </button>
      <h2 id="receipt-title">Заказ оформлен</h2>
      <p className="muted">№ {order.orderId.slice(0, 8)}</p>
      <p>{order.message}</p>
      <ul className="muted" style={{ paddingLeft: 18 }}>
        {order.lines.map((line) => (
          <li key={`${line.productId}-${line.weightLabel}`}>
            {line.name} · {line.weightLabel} × {line.quantity} — {chrome.rub(line.lineTotal)}
          </li>
        ))}
      </ul>
      <p>
        <strong>Итого {chrome.rub(order.total)}</strong>
      </p>
      <p className="muted">
        {order.mode === 'pickup'
          ? 'Самовывоз'
          : `${order.city}${order.streetLine ? `, ${order.streetLine}` : ''}`}
      </p>
      <button className="btn btn-accent" type="button" onClick={chrome.closeLayers}>
        Закрыть
      </button>
    </div>
  )
}
