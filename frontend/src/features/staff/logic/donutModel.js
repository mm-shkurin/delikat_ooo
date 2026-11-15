import { CHART_COLORS, topSlices } from './analyticsFormat'

export const DONUT_RADIUS = 58

/**
 * @param {Array<{ label: string, value_rub: number }>} slices
 */
export function donutModel(slices) {
  const shown = topSlices(slices)
  if (!shown.length) return { arcs: [], total: 0, legend: [] }
  const total = shown.reduce((sum, slice) => sum + slice.value_rub, 0) || 1
  const radius = DONUT_RADIUS
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const arcs = shown.map((slice, index) => {
    const len = (slice.value_rub / total) * circumference
    const arc = {
      color: CHART_COLORS[index % CHART_COLORS.length],
      dash: `${len} ${circumference - len}`,
      offset: -offset,
    }
    offset += len
    return arc
  })
  return {
    arcs,
    total: shown.reduce((sum, slice) => sum + slice.value_rub, 0),
    legend: shown.map((slice, index) => ({
      label: slice.label,
      value_rub: slice.value_rub,
      color: CHART_COLORS[index % CHART_COLORS.length],
    })),
  }
}
