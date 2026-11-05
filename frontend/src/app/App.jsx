import { Route, Routes } from 'react-router-dom'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { OAuthCallbackPage } from '../features/auth/OAuthCallbackPage'
import { LandingPage } from '../features/landing/LandingPage'
import { StoreChromeProvider } from '../shared/storeChrome/StoreChromeProvider'

export function App() {
  return (
    <StoreChromeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      </Routes>
    </StoreChromeProvider>
  )
}
