/**
 * @param {{
 *   mode: 'need_auth' | 'forbidden' | 'error' | 'loading'
 *   errorText?: string | null
 *   onLogin?: () => void
 * }} props
 */
export function AdminGate({ mode, errorText, onLogin }) {
  return (
    <section className="admin-gate" data-testid="admin-gate">
      <div className="admin-gate-card">
        <img className="admin-gate-logo" src="/assets/logo/logo.svg" alt="Деликат +" />
        <p className="admin-kicker">Кабинет</p>
        <h1>Деликат</h1>
        {mode === 'loading' ? <p className="admin-lede">Проверяем доступ…</p> : null}
        {mode === 'need_auth' ? (
          <>
            <p className="admin-lede">Войдите через Яндекс ID — роль подтянется с сервера.</p>
            <button className="admin-btn solid" type="button" onClick={onLogin} data-testid="admin-login">
              Войти через Яндекс
            </button>
          </>
        ) : null}
        {mode === 'forbidden' ? (
          <p className="admin-lede" data-testid="admin-forbidden">
            У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.
          </p>
        ) : null}
        {mode === 'error' ? (
          <p className="admin-error" data-testid="admin-error">
            {errorText ?? 'Не удалось открыть кабинет'}
          </p>
        ) : null}
      </div>
    </section>
  )
}
