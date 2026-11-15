export const CHART_COLORS = [
  '#8b1a1a',
  '#0a0a0a',
  '#c41e3a',
  '#5c5c5c',
  '#2a9b6a',
  '#5c1010',
  '#9f1239',
  '#3a3a3a',
]

const OMSK = 'Asia/Omsk'

/** @param {number} rub */
export function formatRub(rub) {
  return `${new Intl.NumberFormat('ru-RU').format(rub)} ₽`
}

/** @param {Array<{ label: string, value_rub: number }>} slices */
export function topSlices(slices) {
  return slices.slice(0, 8)
}

/** @param {Array<{ label: string, quantity: number }>} rows */
export function topQty(rows) {
  return rows.slice(0, 8)
}

/**
 * @param {string} iso
 * @param {Date} [now]
 */
export function payDayHeading(iso, now = new Date()) {
  const day = omskDayKey(iso)
  const today = omskDayKey(now.toISOString())
  if (day === today) return 'Сегодня'
  if (day === shiftOmskDay(today, -1)) return 'Вчера'
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: OMSK,
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso))
}

/** @param {string} iso */
export function payTime(iso) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: OMSK,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** @param {string} channel */
export function channelIcon(channel) {
  if (channel === 'Наличные / карта в точке') return '₽'
  return '↓'
}

/**
 * @param {Array<{ id: string, at: string, title: string, subtitle: string, amount_rub: number, channel: string }>} inflows
 * @param {Date} [now]
 */
export function groupInflows(inflows, now = new Date()) {
  /** @type {Array<{ heading: string | null, row: (typeof inflows)[number] }>} */
  const rows = []
  let lastHeading = ''
  for (const row of inflows) {
    const heading = payDayHeading(row.at, now)
    rows.push({ heading: heading === lastHeading ? null : heading, row })
    lastHeading = heading
  }
  return rows
}

/** @param {string} isoOrDate */
function omskDayKey(isoOrDate) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: OMSK,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(isoOrDate))
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value
  return `${year}-${month}-${day}`
}

/** @param {string} dayKey YYYY-MM-DD @param {number} delta */
function shiftOmskDay(dayKey, delta) {
  const [y, m, d] = dayKey.split('-').map(Number)
  const utc = Date.UTC(y, m - 1, d, 6) + delta * 24 * 60 * 60 * 1000
  return omskDayKey(new Date(utc).toISOString())
}
