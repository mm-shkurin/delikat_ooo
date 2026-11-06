import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { clearShopSession } from '../../app/storeChrome/clearShopSession'
import { currentSession } from '../../shared/session/authSession'
import { httpErrorIn } from '../../shared/api/httpResponse'
import { isSessionExpired } from '../../shared/session/authorizedRequest'
import { rememberAuthReturn } from '../auth/logic/authReturn'
import { startYandexLogin } from '../auth/api/authApi'
import {
  assignStaffMember,
  getStaffMe,
  listStaffMembers,
  removeStaffMember,
  updateStaffMemberRole,
} from './api/staffApi'
import { canManageRoster, resolveAllowedTab } from './logic/staffAcl'
import { staffMeToView, staffMemberListToView } from './logic/staffView'

/**
 * @returns {{
 *   phase: 'loading' | 'need_auth' | 'forbidden' | 'ready' | 'error'
 *   errorText: string | null
 *   me: ReturnType<typeof staffMeToView> | null
 *   tab: string | null
 *   members: ReturnType<typeof staffMemberListToView>
 *   membersStatus: 'idle' | 'loading' | 'ready' | 'error'
 *   membersError: string | null
 *   actionError: string | null
 *   login: () => void
 *   logout: () => Promise<void>
 *   setTab: (tab: string) => void
 *   reloadMembers: () => Promise<void>
 *   assign: (email: string, role: 'manager' | 'cashier') => Promise<boolean>
 *   changeRole: (memberId: string, role: 'manager' | 'cashier') => Promise<boolean>
 *   remove: (memberId: string) => Promise<boolean>
 * }}
 */
export function useAdminPage() {
  const { tab: tabParam } = useParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState('loading')
  const [errorText, setErrorText] = useState(null)
  const [me, setMe] = useState(null)
  const [members, setMembers] = useState([])
  const [membersStatus, setMembersStatus] = useState('idle')
  const [membersError, setMembersError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const boot = useRef(0)

  useEffect(() => {
    const runId = ++boot.current
    if (!currentSession()?.accessToken) {
      setPhase('need_auth')
      setMe(null)
      return
    }
    setPhase('loading')
    getStaffMe()
      .then((body) => {
        if (runId !== boot.current) return
        setMe(staffMeToView(body))
        setPhase('ready')
        setErrorText(null)
      })
      .catch((error) => {
        if (runId !== boot.current) return
        if (isSessionExpired(error)) {
          setPhase('need_auth')
          setMe(null)
          return
        }
        const http = httpErrorIn(error)
        if (http?.status === 403) {
          setPhase('forbidden')
          setMe(null)
          return
        }
        setPhase('error')
        setErrorText(error instanceof Error ? error.message : 'Не удалось открыть кабинет')
      })
  }, [])

  const tab = me ? resolveAllowedTab(me.role, tabParam) : null

  useEffect(() => {
    if (!me || !tab) return
    if (tabParam !== tab) {
      navigate(`/admin/${tab}`, { replace: true })
    }
  }, [me, tab, tabParam, navigate])

  async function reloadMembers() {
    if (!me || !canManageRoster(me.role)) {
      setMembers([])
      setMembersStatus('idle')
      return
    }
    setMembersStatus('loading')
    setMembersError(null)
    try {
      const body = await listStaffMembers()
      setMembers(staffMemberListToView(body))
      setMembersStatus('ready')
    } catch (error) {
      setMembersStatus('error')
      setMembersError(error instanceof Error ? error.message : 'Не удалось загрузить список')
    }
  }

  useEffect(() => {
    if (phase !== 'ready' || tab !== 'employees') return
    reloadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when entering employees
  }, [phase, tab, me?.role])

  function login() {
    rememberAuthReturn('/admin')
    startYandexLogin()
  }

  async function logout() {
    await clearShopSession()
    setMe(null)
    setMembers([])
    setPhase('need_auth')
    navigate('/admin', { replace: true })
  }

  function setTab(next) {
    if (!me) return
    const allowed = resolveAllowedTab(me.role, next)
    if (allowed) navigate(`/admin/${allowed}`)
  }

  async function assign(email, role) {
    setActionError(null)
    try {
      await assignStaffMember({ email: email.trim(), role })
      await reloadMembers()
      return true
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось назначить')
      return false
    }
  }

  async function changeRole(memberId, role) {
    setActionError(null)
    try {
      await updateStaffMemberRole(memberId, { role })
      await reloadMembers()
      return true
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось сменить роль')
      return false
    }
  }

  async function remove(memberId) {
    setActionError(null)
    try {
      await removeStaffMember(memberId)
      await reloadMembers()
      return true
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось убрать')
      return false
    }
  }

  return {
    phase,
    errorText,
    me,
    tab,
    members,
    membersStatus,
    membersError,
    actionError,
    login,
    logout,
    setTab,
    reloadMembers,
    assign,
    changeRole,
    remove,
  }
}
