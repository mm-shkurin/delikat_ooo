import { useCallback, useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'delikat-theme'

/** @param {string | null | undefined} saved */
export function normalizeTheme(saved) {
  return saved === 'charcoal' ? 'charcoal' : 'wine'
}

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
