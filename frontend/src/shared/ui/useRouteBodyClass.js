import { useEffect } from 'react'
import { addBodyClass, removeBodyClass } from '../browser/dom'

/** One route class on `<body>` so route CSS (landing vs catalog) does not fight in the SPA bundle. */
export function useRouteBodyClass(className) {
  useEffect(() => {
    addBodyClass(className)
    return () => removeBodyClass(className)
  }, [className])
}
