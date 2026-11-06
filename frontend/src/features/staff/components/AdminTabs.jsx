import { TAB_LABELS, tabsForRole } from '../logic/staffAcl'

/**
 * @param {{
 *   role: 'owner' | 'manager' | 'cashier'
 *   activeTab: string
 *   onSelect: (tab: string) => void
 * }} props
 */
export function AdminTabs({ role, activeTab, onSelect }) {
  const tabs = tabsForRole(role)
  return (
    <nav className="admin-tabs wrap-tabs" role="tablist" aria-label="Разделы кабинета" data-testid="admin-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`tab-${tab}`}
          aria-controls={`panel-${tab}`}
          aria-selected={tab === activeTab}
          data-tab={tab}
          data-testid={`admin-tab-${tab}`}
          onClick={() => onSelect(tab)}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </nav>
  )
}
