import { useCallback, useEffect, useState } from 'react'
import { readLocalStorage, setDocumentAttribute, writeLocalStorage } from '../../shared/browser/dom'

export const THEME_STORAGE_KEY = 'delikat-theme'

/** @param {string | null | undefined} saved */
export function normalizeTheme(saved) {
  return saved === 'charcoal' ? 'charcoal' : 'wine'
}

/** Theme preference for store chrome (wine / charcoal). */
export function useTheme() {
  const [theme, setThemeState] = useState(() => normalizeTheme(readLocalStorage(THEME_STORAGE_KEY)))

  const setTheme = useCallback((next) => {
    setThemeState(next)
    setDocumentAttribute('data-theme', next)
    writeLocalStorage(THEME_STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    setDocumentAttribute('data-theme', theme)
  }, [theme])

  return { theme, setTheme }
}
