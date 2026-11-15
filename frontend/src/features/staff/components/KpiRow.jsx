/** @param {{ items: Array<[string, string]> }} props */
export function KpiRow({ items }) {
  return (
    <div className="kpi-row" data-testid="kpi-row">
      {items.map(([label, value]) => (
        <article className="kpi" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  )
}
