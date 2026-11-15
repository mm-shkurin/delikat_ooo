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

const BASE_MS = 400
const MAX_MS = 8_000

/** @param {() => void} onChange */
export function useCatalogLive(onChange) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!isBrowser()) return undefined
    let stopped = false
    let attempt = 0
    /** @type {WebSocket | undefined} */
    let socket
    /** @type {number | undefined} */
    let timer

    const connect = () => {
      if (stopped) return
      const proto = locationProtocol() === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${proto}//${locationHost()}${BACKEND.catalog.live}`)
      socket.onopen = () => {
        attempt = 0
      }
      socket.onmessage = (event) => {
        if (isCatalogChangedFrame(event.data)) onChangeRef.current()
      }
      socket.onclose = () => {
        if (stopped) return
        const delay = Math.min(MAX_MS, BASE_MS * 2 ** attempt)
        attempt += 1
        timer = scheduleTimeout(connect, delay)
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
