import { Route, Routes } from 'react-router-dom'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { OAuthCallbackPage } from '../features/auth/OAuthCallbackPage'
import { LandingPage } from '../features/landing/LandingPage'
import { AdminPage } from '../features/staff/AdminPage'
import { ErrorBoundary } from './ErrorBoundary'
import { StoreChromeProvider } from './storeChrome/StoreChromeProvider'

export function App() {
  return (
    <ErrorBoundary>
      <StoreChromeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/admin/:tab?" element={<AdminPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        </Routes>
      </StoreChromeProvider>
    </ErrorBoundary>
  )
}
