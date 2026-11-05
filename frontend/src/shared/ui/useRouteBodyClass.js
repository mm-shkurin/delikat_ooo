import { useEffect } from 'react'

/** One route class on `<body>` so route CSS (landing vs catalog) does not fight in the SPA bundle. */
export function useRouteBodyClass(className) {
  useEffect(() => {
    document.body.classList.add(className)
    return () => document.body.classList.remove(className)
  }, [className])
}
