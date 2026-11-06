import { useCallback, useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, normalizeTheme } from './logic/fulfillmentView'

/** Theme preference for store chrome (wine / charcoal). */
export function useTheme() {
  const [theme, setThemeState] = useState(() =>
    normalizeTheme(typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null),
  )

  const setTheme = useCallback((next) => {
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(THEME_STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
