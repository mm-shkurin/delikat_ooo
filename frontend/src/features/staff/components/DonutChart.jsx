import { formatRub } from '../logic/analyticsFormat'
import { donutModel } from '../logic/donutModel'

/** @param {{ slices: Array<{ label: string, value_rub: number }>, empty: string }} props */
export function DonutChart({ slices, empty }) {
  const model = donutModel(slices)
  if (!model.legend.length) {
    return <div className="donut-wrap">{empty}</div>
  }
  return (
    <div className="donut-wrap">
      <div className="donut-figure">
        <svg viewBox="0 0 168 168" className="donut" aria-hidden="true">
          {model.arcs.map((arc, index) => (
            <circle
              key={index}
              cx="84"
              cy="84"
              r="58"
              fill="none"
              stroke={arc.color}
              strokeWidth="22"
              strokeDasharray={arc.dash}
              strokeDashoffset={arc.offset}
              transform="rotate(-90 84 84)"
            />
          ))}
          <circle cx="84" cy="84" r="44" fill="var(--surface)" />
        </svg>
        <div className="donut-center">
          <strong>{formatRub(model.total)}</strong>
          <span>всего</span>
        </div>
      </div>
      <ul className="chart-legend">
        {model.legend.map((row) => (
          <li key={row.label}>
            <span className="swatch" style={{ background: row.color }} />
            <span>{row.label}</span>
            <strong>{formatRub(row.value_rub)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
