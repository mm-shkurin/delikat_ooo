import { useEffect, useState } from 'react'
import { isBrowser } from '../../../shared/browser/dom'
import { CATEGORY_COPY, dragEnabled } from '../logic/staffCategoryForm'
import { useCategoriesPanel } from '../useCategoriesPanel'
import { CategoryDialogs } from './CategoryDialogs'
import { CategoryRow } from './CategoryRow'

export function CategoriesPanel() {
  const page = useCategoriesPanel()
  const drag = useDragEnabled()

  return (
    <section
      id="panel-categories"
      role="tabpanel"
      aria-labelledby="tab-categories"
      data-testid="panel-categories"
    >
      <div className="admin-toolbar">
        <button type="button" className="admin-btn solid" onClick={page.openCreate} data-testid="category-add">
          Добавить
        </button>
      </div>
      {page.banner ? (
        <p className="admin-error" role="alert">
          {page.banner}
        </p>
      ) : null}
      {page.status === 'loading' ? <p className="admin-lede">Загружаем категории…</p> : null}
      {page.status === 'error' && !page.banner ? <p className="admin-error">{CATEGORY_COPY.failed}</p> : null}
      {page.status === 'ready' && page.rows.length === 0 ? (
        <p className="admin-empty" data-testid="categories-empty">
          {CATEGORY_COPY.emptyList}
        </p>
      ) : null}
      {page.rows.length > 0 ? (
        <ul className="admin-cat-list" data-testid="category-list">
          {page.rows.map((row, index) => (
            <CategoryRow
              key={row.id}
              row={row}
              index={index}
              total={page.rows.length}
              drag={drag}
              onEdit={() => page.openEdit(row)}
              onDelete={() => page.setPendingDelete(row)}
              onMove={(direction) => page.move(index, direction)}
              onDragStart={() => page.setDragId(row.id)}
              onDrop={() => page.dropOn(row.id)}
            />
          ))}
        </ul>
      ) : null}
      <CategoryDialogs
        editor={page.editor}
        fieldErrors={page.fieldErrors}
        saving={page.saving}
        onChange={page.setEditor}
        onClose={() => page.setEditor(null)}
        onSave={page.saveEditor}
        pending={page.pendingDelete}
        onCancelDelete={() => page.setPendingDelete(null)}
        onConfirmDelete={page.confirmDelete}
      />
    </section>
  )
}

function useDragEnabled() {
  const [enabled, setEnabled] = useState(() => dragEnabled(isBrowser() ? window.innerWidth : 1024))
  useEffect(() => {
    if (!isBrowser()) return undefined
    const query = window.matchMedia('(max-width: 420px)')
    const apply = () => setEnabled(!query.matches)
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])
  return enabled
}
