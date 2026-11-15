export const STATUS_LABELS = {
  accepted: 'Принят',
  packing: 'Собираем',
  ready: 'Готов',
  done: 'Выдан',
  cancelled: 'Отменён',
}

export const FILTER_OPTIONS = [
  ['all', 'Все'],
  ['accepted', 'Принят'],
  ['packing', 'Собираем'],
  ['ready', 'Готов'],
  ['done', 'Выдан'],
  ['cancelled', 'Отменён'],
]

const rubles = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export function formatRub(amount) {
  return `${rubles.format(amount)} ₽`
}

export function formatWhen(iso) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function metaLine(order) {
  const mode = order.fulfillment.mode === 'pickup' ? 'Самовывоз' : 'Доставка'
  const street = (order.fulfillment.address.street_line ?? '').trim()
  const head = `${formatWhen(order.created_at)} · ${mode}`
  return street ? `${head} · ${street}` : head
}

export function contactLine(order) {
  const short = String(order.order_id).toLowerCase().slice(0, 8)
  return order.buyer_email ? `${order.buyer_email} · № ${short}` : `№ ${short}`
}

export function visibleNote(order) {
  const note = (order.customer_note ?? '').trim()
  return note || null
}

export function lineText(line) {
  return `${line.product_name} · ${line.weight_label} × ${line.quantity} — ${formatRub(line.line_total_rub)}`
}

export function statusOptions(order) {
  return [order.status, ...order.allowed_next].map((code) => ({
    code,
    label: STATUS_LABELS[code],
  }))
}

export function matchesQuery(order, raw) {
  const query = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (!query) return true
  const id = String(order.order_id).toLowerCase()
  const parts = [id, order.buyer_name]
  if (order.buyer_email) parts.push(order.buyer_email)
  if (order.customer_note) parts.push(order.customer_note)
  const street = order.fulfillment.address.street_line
  if (street) parts.push(street)
  return parts.some((part) => String(part).toLowerCase().includes(query))
}

export function visibleOrders(orders, filter, query) {
  return orders.filter((order) => {
    if (filter !== 'all' && order.status !== filter) return false
    return matchesQuery(order, query)
  })
}

export function ordersChrome(phase, shown, total) {
  if (phase !== 'ready') return { counter: null, empty: false }
  return { counter: `${shown} из ${total}`, empty: shown === 0 }
}

export function orderCardModel(order) {
  return {
    title: order.buyer_name,
    meta: metaLine(order),
    total: formatRub(order.total_rub),
    contact: contactLine(order),
    note: visibleNote(order),
    lines: order.lines.map(lineText),
    pill: STATUS_LABELS[order.status],
    options: statusOptions(order),
    statusDisabled: order.allowed_next.length === 0,
  }
}
