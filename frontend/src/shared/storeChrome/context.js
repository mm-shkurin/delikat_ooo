import { createContext, useContext } from 'react'

/** Shared chrome context so features depend on shared/, not app/. */
export const StoreChromeContext = createContext(/** @type {object | null} */ (null))

export function useStoreChromeContext() {
  const chrome = useContext(StoreChromeContext)
  if (!chrome) {
    throw new Error('useStoreChromeContext must be used within StoreChromeProvider')
  }
  return chrome
}
