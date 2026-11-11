import { useRouteBodyClass } from '../../shared/ui/useRouteBodyClass'
import { AdminGate } from './components/AdminGate'
import { AdminHeader } from './components/AdminHeader'
import { AdminTabs } from './components/AdminTabs'
import { CatalogPanel } from './components/CatalogPanel'
import { EmployeesPanel } from './components/EmployeesPanel'
import { MoneyShell, OrdersShell, StatsShell } from './components/ShellPanels'
import { useAdminPage } from './useAdminPage'
import '../../styles/admin.css'

export function AdminPage() {
  useRouteBodyClass('route-admin')
  const page = useAdminPage()

  if (page.phase !== 'ready' || !page.me || !page.tab) {
    return (
      <AdminGate
        mode={page.phase === 'ready' ? 'loading' : page.phase}
        errorText={page.errorText}
        onLogin={page.login}
      />
    )
  }

  return (
    <div className="admin-app" data-testid="admin-app">
      <AdminHeader roleLabel={page.me.roleLabel} onLogout={page.logout} />
      <AdminTabs role={page.me.role} activeTab={page.tab} onSelect={page.setTab} />
      <main className="admin-wrap">
        {page.tab === 'catalog' ? <CatalogPanel /> : null}
        {page.tab === 'orders' ? <OrdersShell /> : null}
        {page.tab === 'stats' ? <StatsShell /> : null}
        {page.tab === 'money' ? <MoneyShell /> : null}
        {page.tab === 'employees' ? (
          <EmployeesPanel
            actorRole={page.me.role}
            members={page.members}
            membersStatus={page.membersStatus}
            membersError={page.membersError}
            actionError={page.actionError}
            onAssign={page.assign}
            onChangeRole={page.changeRole}
            onRemove={page.remove}
          />
        ) : null}
      </main>
    </div>
  )
}
