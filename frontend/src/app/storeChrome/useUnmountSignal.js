import { useEffect, useRef } from 'react'

/** AbortSignal cancelled when this component unmounts. One controller per mount. */
export function useUnmountSignal() {
  const controller = useRef(new AbortController())
  useEffect(() => {
    const current = controller.current
    return () => current.abort()
  }, [])
  return controller.current.signal
}
