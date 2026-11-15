import { useEffect, useState } from 'react'
import { getStaffMoney, getStaffStats } from './api/staffAnalyticsApi'
import { analyticsFailureText } from './logic/analyticsFailure'

/** @param {'stats' | 'money'} kind */
export function useAnalyticsPanel(kind) {
  const [phase, setPhase] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [data, setData] = useState(/** @type {Record<string, unknown> | null} */ (null))
  const [banner, setBanner] = useState(/** @type {string | null} */ (null))

  useEffect(() => {
    let live = true
    const load = kind === 'stats' ? getStaffStats : getStaffMoney
    setPhase('loading')
    setData(null)
    setBanner(null)
    load()
      .then((body) => {
        if (!live) return
        setData(body)
        setPhase('ready')
      })
      .catch((error) => {
        if (!live) return
        setPhase('error')
        setBanner(analyticsFailureText(error))
      })
    return () => {
      live = false
    }
  }, [kind])

  return { phase, data, banner }
}
