import { useEffect, useState } from 'react'
import { listStaffOrders, patchStaffOrderStatus } from './api/staffOrdersApi'
import { ordersFailureText } from './logic/ordersFailure'
import { visibleOrders } from './logic/staffOrdersView'

export function useOrdersPanel() {
  const [phase, setPhase] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [items, setItems] = useState(/** @type {Array<Record<string, unknown>>} */ ([]))
  const [banner, setBanner] = useState(/** @type {string | null} */ (null))
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    const ac = new AbortController()
    listStaffOrders(ac.signal)
      .then((body) => {
        if (ac.signal.aborted) return
        setItems(body.items)
        setPhase('ready')
        setBanner(null)
      })
      .catch((error) => {
        if (ac.signal.aborted || error?.name === 'AbortError') return
        setPhase('error')
        setBanner(ordersFailureText(error))
      })
    return () => ac.abort()
  }, [])

  async function changeStatus(orderId, status) {
    setSavingId(orderId)
    setBanner(null)
    try {
      const next = await patchStaffOrderStatus(orderId, status)
      setItems((current) => current.map((row) => (row.order_id === orderId ? next : row)))
    } catch (error) {
      setBanner(ordersFailureText(error))
    } finally {
      setSavingId('')
    }
  }

  return {
    phase,
    banner,
    filter,
    setFilter,
    query,
    setQuery,
    shown: visibleOrders(items, filter, query),
    total: items.length,
    savingId,
    changeStatus,
  }
}
