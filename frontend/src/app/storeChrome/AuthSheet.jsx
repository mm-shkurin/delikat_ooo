import { useEffect, useState } from 'react'
import { startYandexLogin, updateMe } from '../../features/auth/api/authApi'
import { profileToView } from '../../features/auth/logic/profileView'
import { isAbortError } from '../../shared/api/abortError'
import { failureText } from '../../shared/api/failureText'
import { safeImageUrl } from '../../shared/ui/safeImageUrl'
import { useUnmountSignal } from './useUnmountSignal'

/**
 * @param {{ chrome: ReturnType<import('./useStoreChrome').useStoreChrome> }} props
 */
export function AuthSheet({ chrome }) {
  const signal = useUnmountSignal()
  const signedIn = chrome.signedIn && chrome.userProfile
  const [nameDraft, setNameDraft] = useState(chrome.userProfile?.displayName ?? '')
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState('')
  const { layer, signedIn: isSignedIn, userProfile, profileBusy, refreshUserProfile, applyUserProfile, resetShopSession } =
    chrome

  useEffect(() => {
    if (layer === 'auth' && isSignedIn && !userProfile && !profileBusy) {
      refreshUserProfile()
    }
  }, [layer, isSignedIn, userProfile, profileBusy, refreshUserProfile])

  useEffect(() => {
    setNameDraft(userProfile?.displayName ?? '')
  }, [userProfile?.displayName])

  const saveName = async (event) => {
    event.preventDefault()
    setSaveError('')
    setSaveBusy(true)
    try {
      const body = await updateMe(nameDraft, signal)
      if (signal.aborted) return
      applyUserProfile(profileToView(body))
    } catch (error) {
      if (signal.aborted || isAbortError(error)) return
      setSaveError(failureText(error))
    } finally {
      if (!signal.aborted) setSaveBusy(false)
    }
  }

  const avatarSrc = safeImageUrl(userProfile?.avatarUrl)

  return (
    <div className="panel sheet" id="auth" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="close" type="button" aria-label="Закрыть" onClick={chrome.closeLayers}>
        ×
      </button>
      <h2 id="auth-title">{signedIn ? 'Профиль' : 'Вход'}</h2>
      {profileBusy ? <p className="muted">Загрузка…</p> : null}
      {signedIn ? (
        <>
          {avatarSrc ? (
            <img src={avatarSrc} alt="" width={64} height={64} style={{ borderRadius: '50%', marginBottom: 12 }} />
          ) : null}
          <p className="muted">{userProfile.email}</p>
          <p className="muted" style={{ fontSize: 13 }}>
            В Yandex: {userProfile.providerDisplayName}
          </p>
          <form onSubmit={saveName}>
            <label className="field" htmlFor="display-name">
              Имя в магазине
            </label>
            <input
              id="display-name"
              name="displayName"
              type="text"
              required
              maxLength={120}
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
            />
            {saveError ? <p className="muted">{saveError}</p> : null}
            <button className="btn btn-accent" type="submit" disabled={saveBusy} style={{ marginTop: 12 }}>
              {saveBusy ? 'Сохранение…' : 'Сохранить имя'}
            </button>
          </form>
          <button className="btn" type="button" style={{ marginTop: 12 }} onClick={() => void resetShopSession()}>
            Выйти
          </button>
        </>
      ) : (
        <>
          <p className="muted">Yandex ID — аватар и имя подтягиваются при входе.</p>
          <button className="btn btn-accent" type="button" onClick={startYandexLogin}>
            Войти через Yandex
          </button>
        </>
      )}
    </div>
  )
}
