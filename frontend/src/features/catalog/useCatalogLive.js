import { useEffect, useRef } from 'react'
import { isBrowser } from '../../shared/browser/dom'

const CATALOG_LIVE_PATH = '/api/v1/catalog/live'
import { isCatalogChangedFrame } from './logic/catalogRefresh'

/** @param {() => void} onChange */
export function useCatalogLive(onChange) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!isBrowser()) return undefined
    let stopped = false
    /** @type {WebSocket | undefined} */
    let socket
    /** @type {number | undefined} */
    let timer

    const connect = () => {
      if (stopped) return
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${proto}//${window.location.host}${CATALOG_LIVE_PATH}`)
      socket.onmessage = (event) => {
        if (isCatalogChangedFrame(event.data)) onChangeRef.current()
      }
      socket.onclose = () => {
        if (!stopped) timer = window.setTimeout(connect, 400)
      }
    }

    connect()
    return () => {
      stopped = true
      window.clearTimeout(timer)
      socket?.close()
    }
  }, [])
}
