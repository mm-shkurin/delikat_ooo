import { assignableRoles, canMutateMember } from '../logic/staffAcl'

/**
 * @param {{
 *   actorRole: 'owner' | 'manager' | 'cashier'
 *   members: Array<{
 *     memberId: string
 *     email: string
 *     displayName: string | null
 *     role: string
 *     roleLabel: string
 *     status: string
 *     statusLabel: string
 *   }>
 *   status: string
 *   error: string | null
 *   onChangeRole: (memberId: string, role: 'manager' | 'cashier') => Promise<boolean>
 *   onRemove: (memberId: string) => Promise<boolean>
 * }} props
 */
export function EmployeesList({ actorRole, members, status, error, onChangeRole, onRemove }) {
  const roleOptions = assignableRoles(actorRole)

  if (status === 'loading') return <p className="admin-lede">Загружаем список…</p>
  if (status === 'error') return <p className="admin-error">{error}</p>
  if (status === 'ready' && members.length === 0) {
    return <p className="admin-empty">Пока никого нет — назначьте сотрудника.</p>
  }

  return (
    <ul className="admin-staff-list" data-testid="employees-list">
      {members.map((row) => {
        const mutable = canMutateMember(actorRole, /** @type {'owner'|'manager'|'cashier'} */ (row.role))
        return (
          <li key={row.memberId} className="admin-staff-row" data-testid="employees-row">
            <div className="admin-staff-main">
              <strong>{row.displayName || row.email}</strong>
              {row.displayName ? <span className="admin-meta">{row.email}</span> : null}
              <span className="admin-meta">
                {row.roleLabel} · {row.statusLabel}
              </span>
            </div>
            <div className="admin-row-actions">
              {mutable ? (
                <>
                  <label className="admin-field">
                    <span className="visually-hidden">Роль</span>
                    <select
                      aria-label={`Роль ${row.email}`}
                      value={row.role}
                      onChange={(e) => onChangeRole(row.memberId, /** @type {'manager'|'cashier'} */ (e.target.value))}
                      data-testid="employees-role-select"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="admin-btn ghost"
                    type="button"
                    onClick={() => onRemove(row.memberId)}
                    data-testid="employees-remove"
                  >
                    Убрать
                  </button>
                </>
              ) : (
                <span className="admin-meta" data-testid="employees-readonly">
                  Только просмотр
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
