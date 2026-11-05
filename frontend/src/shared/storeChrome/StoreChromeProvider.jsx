import { createContext, useContext } from 'react'
import { useStoreChrome } from './useStoreChrome'

const StoreChromeContext = createContext(/** @type {ReturnType<typeof useStoreChrome> | null} */ (null))

export function StoreChromeProvider({ children }) {
  const chrome = useStoreChrome()
  return <StoreChromeContext.Provider value={chrome}>{children}</StoreChromeContext.Provider>
}

export function useStoreChromeContext() {
  const chrome = useContext(StoreChromeContext)
  if (!chrome) {
    throw new Error('useStoreChromeContext must be used within StoreChromeProvider')
  }
  return chrome
}
