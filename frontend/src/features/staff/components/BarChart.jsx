/** @param {{
 *  rows: Array<{ label: string, value: number, display: string }>,
 *  empty: string,
 *  ariaLabel: string,
 * }} props */
export function BarChart({ rows, empty, ariaLabel }) {
  if (!rows.length) {
    return (
      <div className="bars" role="img" aria-label={ariaLabel}>
        {empty}
      </div>
    )
  }
  const max = Math.max(...rows.map((row) => row.value)) || 1
  return (
    <div className="bars" role="img" aria-label={ariaLabel}>
      {rows.map((row) => (
        <div className="bar-row" key={row.label}>
          <span className="bar-label">{row.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.max(4, Math.round((row.value / max) * 100))}%` }} />
          </div>
          <span className="bar-value">{row.display}</span>
        </div>
      ))}
    </div>
  )
}
