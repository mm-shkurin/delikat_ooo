import { Link } from 'react-router-dom'

/**
 * @param {{
 *   roleLabel: string
 *   onLogout: () => void
 * }} props
 */
export function AdminHeader({ roleLabel, onLogout }) {
  return (
    <header className="admin-top">
      <Link className="admin-brand" to="/catalog">
        <img src="/assets/logo/logo.svg" alt="" />
        <span>
          <small>Деликат</small>
          Кабинет
        </span>
      </Link>
      <div className="admin-top-actions">
        <span className="admin-role-chip" data-testid="admin-role-chip">
          {roleLabel}
        </span>
        <Link className="admin-text-link" to="/catalog">
          На витрину
        </Link>
        <button className="admin-btn ghost" type="button" onClick={onLogout} data-testid="admin-logout">
          Выйти
        </button>
      </div>
    </header>
  )
}
