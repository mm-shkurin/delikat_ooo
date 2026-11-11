import { BADGE_OPTIONS, PROPERTY_OPTIONS } from '../logic/staffCatalogForm'

/**
 * @param {{
 *   mode: 'create' | 'edit'
 *   draft: ReturnType<typeof import('../logic/staffCatalogForm').emptyEditorDraft>
 *   categories: Array<{ id: string, title: string }>
 *   imageFile: File | null
 *   currentImageUrl: string | null
 *   fieldErrors: Record<string, string>
 *   onChange: (next: typeof draft) => void
 *   onImage: (file: File | null) => void
 * }} props
 */
export function CatalogEditorFields({
  mode,
  draft,
  categories,
  imageFile,
  currentImageUrl,
  fieldErrors,
  onChange,
  onImage,
}) {
  const set = (patch) => onChange({ ...draft, ...patch })
  const idReadOnly = mode === 'edit'

  return (
    <div className="admin-form-grid">
      <Field label="Код" error={fieldErrors.id}>
        <input
          value={draft.id}
          onChange={(e) => set({ id: e.target.value })}
          required={mode === 'create'}
          maxLength={32}
          readOnly={idReadOnly}
          disabled={idReadOnly}
          data-testid="catalog-field-id"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="rib"
        />
      </Field>
      <Field label="Название" error={fieldErrors.name}>
        <input
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
          required
          maxLength={80}
          data-testid="catalog-field-name"
        />
      </Field>
      <Field label="Категория" error={fieldErrors.categoryId}>
        <select
          value={draft.categoryId}
          onChange={(e) => set({ categoryId: e.target.value })}
          required
          data-testid="catalog-field-category"
        >
          <option value="">Выберите</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Вес" error={fieldErrors.weightLabel}>
        <input
          value={draft.weightLabel}
          onChange={(e) => set({ weightLabel: e.target.value })}
          required
          maxLength={40}
          placeholder="~350 г"
          data-testid="catalog-field-weight"
        />
      </Field>
      <Field label="Цена, ₽" error={fieldErrors.price}>
        <input
          value={draft.price}
          onChange={(e) => set({ price: e.target.value })}
          required
          inputMode="numeric"
          maxLength={5}
          data-testid="catalog-field-price"
        />
      </Field>
      <Field label="Было, ₽" error={fieldErrors.compareAt}>
        <input
          value={draft.compareAt}
          onChange={(e) => set({ compareAt: e.target.value })}
          inputMode="numeric"
          maxLength={5}
          placeholder="необязательно"
          data-testid="catalog-field-compare"
        />
      </Field>
      <Field label="Популярность, 0–100" error={fieldErrors.popularity}>
        <input
          value={draft.popularity}
          onChange={(e) => set({ popularity: e.target.value })}
          required
          inputMode="numeric"
          maxLength={3}
          data-testid="catalog-field-pop"
        />
      </Field>
      <fieldset className="admin-badge-field">
        <legend>Плашки витрины</legend>
        {BADGE_OPTIONS.map((opt) => (
          <label key={opt.value || 'none'} className="admin-badge-opt">
            <input
              type="radio"
              name="catalog-badge"
              value={opt.value}
              checked={draft.badge === opt.value}
              onChange={() => set({ badge: opt.value })}
            />
            {opt.label}
          </label>
        ))}
      </fieldset>
      <Field label="Мраморность" className="span-2">
        <input
          value={draft.marbleGrade}
          onChange={(e) => set({ marbleGrade: e.target.value })}
          maxLength={40}
          placeholder="необязательно"
        />
      </Field>
      <Field label="Фото" className="span-2" error={fieldErrors.image}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => onImage(e.target.files?.[0] ?? null)}
          data-testid="catalog-field-image"
        />
        {mode === 'edit' && !imageFile && currentImageUrl ? (
          <span className="admin-meta">Текущее фото сохранится, если не выбрать новое</span>
        ) : null}
        {imageFile ? <span className="admin-meta">{imageFile.name}</span> : null}
      </Field>
      <fieldset className="admin-props span-2">
        <legend>Свойства</legend>
        {PROPERTY_OPTIONS.map((opt) => {
          const on = draft.properties.includes(opt.value)
          return (
            <label key={opt.value}>
              <input
                type="checkbox"
                checked={on}
                onChange={() =>
                  set({
                    properties: on
                      ? draft.properties.filter((p) => p !== opt.value)
                      : [...draft.properties, opt.value],
                  })
                }
              />{' '}
              {opt.label}
            </label>
          )
        })}
      </fieldset>
      <Field label="Описание" className="span-2">
        <textarea
          rows={3}
          maxLength={400}
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <label className="admin-check span-2">
        <input
          type="checkbox"
          checked={draft.hidden}
          onChange={(e) => set({ hidden: e.target.checked })}
          data-testid="catalog-field-hidden"
        />
        Скрыть с витрины
      </label>
    </div>
  )
}

function Field({ label, error, className = '', children }) {
  return (
    <label className={`admin-field ${className}`.trim()}>
      <span>{label}</span>
      {children}
      {error ? <span className="admin-field-error">{error}</span> : null}
    </label>
  )
}
