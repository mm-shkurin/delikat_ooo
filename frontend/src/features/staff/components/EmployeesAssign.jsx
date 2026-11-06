import { useState } from 'react'
import { ROLE_LABELS, assignableRoles } from '../logic/staffAcl'

/**
 * @param {{
 *   actorRole: 'owner' | 'manager' | 'cashier'
 *   error: string | null
 *   onAssign: (email: string, role: 'manager' | 'cashier') => Promise<boolean>
 * }} props
 */
export function EmployeesAssign({ actorRole, error, onAssign }) {
  const roles = assignableRoles(actorRole)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(roles[0] ?? 'cashier')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!email.trim() || !roles.includes(role)) return
    setBusy(true)
    const ok = await onAssign(email, role)
    setBusy(false)
    if (ok) setEmail('')
  }

  return (
    <form className="admin-assign" onSubmit={submit} data-testid="employees-assign">
      <label className="admin-field grow">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          data-testid="employees-assign-email"
        />
      </label>
      <label className="admin-field">
        <span>Роль</span>
        <select
          value={role}
          onChange={(e) => setRole(/** @type {'manager'|'cashier'} */ (e.target.value))}
          data-testid="employees-assign-role"
        >
          {roles.map((option) => (
            <option key={option} value={option}>
              {ROLE_LABELS[option]}
            </option>
          ))}
        </select>
      </label>
      <button className="admin-btn solid" type="submit" disabled={busy || roles.length === 0}>
        Назначить
      </button>
      {error ? <p className="admin-error">{error}</p> : null}
    </form>
  )
}
