import { useState } from 'react'
import { EmployeesAssign } from './EmployeesAssign'
import { EmployeesList } from './EmployeesList'

/** @param {object} props */
export function EmployeesPanel({
  actorRole,
  members,
  membersStatus,
  membersError,
  actionError,
  onAssign,
  onChangeRole,
  onRemove,
}) {
  const [sub, setSub] = useState('list')

  return (
    <section id="panel-employees" role="tabpanel" aria-labelledby="tab-employees" data-testid="panel-employees">
      <div className="admin-subtabs" role="tablist" aria-label="Сотрудники">
        <button
          type="button"
          role="tab"
          aria-selected={sub === 'list'}
          data-testid="employees-sub-list"
          onClick={() => setSub('list')}
        >
          Список
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sub === 'assign'}
          data-testid="employees-sub-assign"
          onClick={() => setSub('assign')}
        >
          Назначить
        </button>
      </div>
      {actionError && sub === 'list' ? <p className="admin-error">{actionError}</p> : null}
      {sub === 'list' ? (
        <EmployeesList
          actorRole={actorRole}
          members={members}
          status={membersStatus}
          error={membersError}
          onChangeRole={onChangeRole}
          onRemove={onRemove}
        />
      ) : (
        <EmployeesAssign actorRole={actorRole} error={actionError} onAssign={onAssign} />
      )}
    </section>
  )
}
