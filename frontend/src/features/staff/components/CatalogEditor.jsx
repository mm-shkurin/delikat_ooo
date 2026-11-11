import { CatalogEditorFields } from './CatalogEditorFields'

/**
 * @param {{
 *   open: boolean
 *   mode: 'create' | 'edit'
 *   draft: ReturnType<typeof import('../logic/staffCatalogForm').emptyEditorDraft>
 *   categories: Array<{ id: string, title: string }>
 *   imageFile: File | null
 *   currentImageUrl: string | null
 *   fieldErrors: Record<string, string>
 *   formError: string | null
 *   saving: boolean
 *   onChange: (next: typeof draft) => void
 *   onImage: (file: File | null) => void
 *   onClose: () => void
 *   onSave: () => void
 * }} props
 */
export function CatalogEditor({
  open,
  mode,
  draft,
  categories,
  imageFile,
  currentImageUrl,
  fieldErrors,
  formError,
  saving,
  onChange,
  onImage,
  onClose,
  onSave,
}) {
  if (!open) return null

  return (
    <div className="admin-editor-layer" data-testid="catalog-editor">
      <button type="button" className="admin-editor-scrim" aria-label="Закрыть" onClick={onClose} disabled={saving} />
      <div className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="catalog-editor-title">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
        >
          <header className="admin-editor-head">
            <h2 id="catalog-editor-title">{mode === 'create' ? 'Новый товар' : 'Редактирование'}</h2>
            <button className="admin-icon-x" type="button" aria-label="Закрыть" onClick={onClose} disabled={saving}>
              ×
            </button>
          </header>
          <CatalogEditorFields
            mode={mode}
            draft={draft}
            categories={categories}
            imageFile={imageFile}
            currentImageUrl={currentImageUrl}
            fieldErrors={fieldErrors}
            onChange={onChange}
            onImage={onImage}
          />
          {formError ? <p className="admin-error">{formError}</p> : null}
          <footer className="admin-editor-actions">
            <button className="admin-btn ghost" type="button" onClick={onClose} disabled={saving}>
              Отмена
            </button>
            <button className="admin-btn solid" type="submit" disabled={saving} data-testid="catalog-save">
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
