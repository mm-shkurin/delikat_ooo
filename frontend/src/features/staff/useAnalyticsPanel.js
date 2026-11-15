import { useEffect, useState } from 'react'
import { getStaffMoney, getStaffStats } from './api/staffAnalyticsApi'
import { ordersFailureText } from './logic/ordersFailure'

/** @param {'stats' | 'money'} kind */
export function useAnalyticsPanel(kind) {
  const [phase, setPhase] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [data, setData] = useState(/** @type {Record<string, unknown> | null} */ (null))
  const [banner, setBanner] = useState(/** @type {string | null} */ (null))

  useEffect(() => {
    const ac = new AbortController()
    const load = kind === 'stats' ? getStaffStats : getStaffMoney
    setPhase('loading')
    setData(null)
    setBanner(null)
    load(ac.signal)
      .then((body) => {
        if (ac.signal.aborted) return
        setData(body)
        setPhase('ready')
      })
      .catch((error) => {
        if (ac.signal.aborted || error?.name === 'AbortError') return
        setPhase('error')
        setBanner(ordersFailureText(error))
      })
    return () => ac.abort()
  }, [kind])

  return { phase, data, banner }
}
