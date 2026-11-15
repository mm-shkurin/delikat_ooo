import { useStoreChrome } from './useStoreChrome'
import { StoreChromeContext } from '../../shared/storeChrome/context'

export function StoreChromeProvider({ children }) {
  const chrome = useStoreChrome()
  return <StoreChromeContext.Provider value={chrome}>{children}</StoreChromeContext.Provider>
}
