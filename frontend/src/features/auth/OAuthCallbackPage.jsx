import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStoreChromeContext } from '../../shared/storeChrome/StoreChromeProvider'
import { exchangeOAuthCode } from './api/authApi'

export function OAuthCallbackPage() {
  const chrome = useStoreChromeContext()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const started = useRef(false)
  const completeAuth = useRef(chrome.completeAuthMock)
  completeAuth.current = chrome.completeAuthMock

  useEffect(() => {
    const providerError = params.get('error')
    const code = params.get('code')
    if (providerError) {
      setError('provider_rejected')
      return
    }
    if (!code) {
      setError('missing_code')
      return
    }
    if (started.current) return
    started.current = true
    exchangeOAuthCode(code)
      .then(() => {
        completeAuth.current()
        navigate('/catalog', { replace: true })
      })
      .catch(() => {
        started.current = false
        setError('exchange_failed')
        navigate('/auth/callback', { replace: true })
      })
  }, [params, navigate])

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Не удалось войти</h1>
        <p>
          {error === 'missing_code'
            ? 'В ссылке нет кода подтверждения.'
            : error === 'exchange_failed'
              ? 'Не удалось завершить вход. Попробуйте ещё раз.'
              : 'Провайдер отклонил вход.'}
        </p>
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
