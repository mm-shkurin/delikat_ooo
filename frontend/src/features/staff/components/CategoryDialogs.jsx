import { deleteQuestion } from '../logic/staffCategoryForm'

/**
 * @param {{
 *   editor: { mode: 'create' | 'edit', id: string, title: string } | null
 *   fieldErrors: Record<string, string>
 *   saving: boolean
 *   onChange: (next: { mode: 'create' | 'edit', id: string, title: string }) => void
 *   onClose: () => void
 *   onSave: () => void
 *   pending: { id: string, title: string, productCount: number } | null
 *   onCancelDelete: () => void
 *   onConfirmDelete: () => void
 * }} props
 */
export function CategoryDialogs({
  editor,
  fieldErrors,
  saving,
  onChange,
  onClose,
  onSave,
  pending,
  onCancelDelete,
  onConfirmDelete,
}) {
  return (
    <>
      {editor ? (
        <div className="admin-editor-layer" data-testid="category-editor">
          <button type="button" className="admin-editor-scrim" aria-label="Закрыть" onClick={onClose} />
          <div className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="category-editor-title">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                onSave()
              }}
            >
              <header className="admin-editor-head">
                <h2 id="category-editor-title">{editor.mode === 'create' ? 'Новая категория' : 'Название'}</h2>
                <button className="admin-icon-x" type="button" aria-label="Закрыть" onClick={onClose}>
                  ×
                </button>
              </header>
              <label className="admin-field">
                Код
                <input
                  value={editor.id}
                  disabled={editor.mode === 'edit'}
                  onChange={(event) => onChange({ ...editor, id: event.target.value })}
                  data-testid="category-field-id"
                />
                {fieldErrors.id ? <span className="admin-error">{fieldErrors.id}</span> : null}
              </label>
              <label className="admin-field">
                Название
                <input
                  value={editor.title}
                  onChange={(event) => onChange({ ...editor, title: event.target.value })}
                  data-testid="category-field-title"
                />
                {fieldErrors.title ? <span className="admin-error">{fieldErrors.title}</span> : null}
              </label>
              <footer className="admin-editor-actions">
                <button className="admin-btn ghost" type="button" onClick={onClose}>
                  Отмена
                </button>
                <button className="admin-btn solid" type="submit" disabled={saving}>
                  Сохранить
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}
      {pending ? (
        <div className="admin-editor-layer" data-testid="category-delete-dialog">
          <button type="button" className="admin-editor-scrim" aria-label="Закрыть" onClick={onCancelDelete} />
          <div className="admin-editor" role="dialog" aria-modal="true">
            <p>{deleteQuestion(pending.title, pending.productCount)}</p>
            <footer className="admin-editor-actions">
              <button className="admin-btn ghost" type="button" onClick={onCancelDelete}>
                Отмена
              </button>
              <button className="admin-btn solid" type="button" onClick={onConfirmDelete} disabled={saving}>
                Удалить
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}
