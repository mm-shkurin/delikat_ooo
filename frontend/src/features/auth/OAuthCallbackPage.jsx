import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStoreChromeContext } from '../../shared/storeChrome/StoreChromeProvider'
import { exchangeOAuthCode } from './api/authApi'

export function OAuthCallbackPage() {
  const chrome = useStoreChromeContext()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const providerError = params.get('error')
    const code = params.get('code')
    if (providerError) {
      setError(providerError)
      return
    }
    if (!code) {
      setError('missing_code')
      return
    }
    let active = true
    exchangeOAuthCode(code)
      .then(() => {
        if (active) {
          chrome.completeAuthMock()
          navigate('/catalog', { replace: true })
        }
      })
      .catch(() => {
        if (active) setError('exchange_failed')
      })
    return () => {
      active = false
    }
  }, [params, navigate, chrome])

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Не удалось войти</h1>
        <p>{error}</p>
        <button type="button" onClick={() => navigate('/', { replace: true })}>
          На главную
        </button>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem' }}>
      <p>Вход…</p>
    </main>
  )
}
