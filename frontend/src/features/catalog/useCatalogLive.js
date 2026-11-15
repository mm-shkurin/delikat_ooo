import { useEffect, useRef } from 'react'
import {
  clearSchedule,
  isBrowser,
  locationHost,
  locationProtocol,
  scheduleTimeout,
} from '../../shared/browser/dom'
import { BACKEND } from '../../shared/api/backend/paths'
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
      const proto = locationProtocol() === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${proto}//${locationHost()}${BACKEND.catalog.live}`)
      socket.onmessage = (event) => {
        if (isCatalogChangedFrame(event.data)) onChangeRef.current()
      }
      socket.onclose = () => {
        if (!stopped) timer = scheduleTimeout(connect, 400)
      }
    }

    connect()
    return () => {
      stopped = true
      clearSchedule(timer)
      socket?.close()
    }
  }, [])
}
