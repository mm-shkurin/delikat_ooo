import { Link, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <Link to="/">Деликат</Link>
        <Link to="/catalog">Каталог</Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
