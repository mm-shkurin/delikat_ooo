import { useCallback, useEffect, useState } from 'react'
import { getMe } from '../../features/auth/api/authApi'
import { profileToView } from '../../features/auth/logic/profileView'
import { httpErrorIn } from '../../shared/api/httpResponse'
import { currentSession, endSession } from '../../shared/session/authSession'
import { isSessionExpired } from '../../shared/session/authorizedRequest'

/**
 * Signed-in profile + session refresh for store chrome.
 */
export function useAuthChrome() {
  const [signedIn, setSignedIn] = useState(() => !!currentSession())
  const [userProfile, setUserProfile] = useState(
    /** @type {ReturnType<typeof profileToView> | null} */ (null),
  )
  const [profileBusy, setProfileBusy] = useState(false)
  const [privacyNoteVisible, setPrivacyNoteVisible] = useState(false)

  const refreshUserProfile = useCallback(async () => {
    if (!currentSession()) {
      setUserProfile(null)
      setSignedIn(false)
      return null
    }
    setProfileBusy(true)
    try {
      const body = await getMe()
      const view = profileToView(body)
      setUserProfile(view)
      setSignedIn(true)
      return view
    } catch (error) {
      const unauthorized = isSessionExpired(error) || httpErrorIn(error)?.status === 401
      if (unauthorized) {
        endSession()
        setUserProfile(null)
        setSignedIn(false)
      }
      return null
    } finally {
      setProfileBusy(false)
    }
  }, [])

  useEffect(() => {
    refreshUserProfile()
  }, [refreshUserProfile])

  const completeAuth = useCallback(() => {
    setSignedIn(true)
    refreshUserProfile()
  }, [refreshUserProfile])

  const applyUserProfile = useCallback((view) => {
    setUserProfile(view)
    setSignedIn(true)
  }, [])

  const clearAuthState = useCallback(() => {
    setUserProfile(null)
    setSignedIn(false)
  }, [])

  return {
    signedIn,
    userProfile,
    profileBusy,
    privacyNoteVisible,
    setPrivacyNoteVisible,
    refreshUserProfile,
    completeAuth,
    applyUserProfile,
    clearAuthState,
  }
}
