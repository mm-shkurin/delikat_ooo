/**
 * @param {{
 *   q: string
 *   visibility: 'all' | 'live' | 'hidden'
 *   onQ: (value: string) => void
 *   onVisibility: (value: 'all' | 'live' | 'hidden') => void
 *   onCreate: () => void
 * }} props
 */
export function CatalogToolbar({ q, visibility, onQ, onVisibility, onCreate }) {
  return (
    <div className="admin-toolbar">
      <label className="admin-field grow">
        <span>Поиск</span>
        <input
          type="search"
          placeholder="Имя или код"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          data-testid="catalog-search"
          autoComplete="off"
        />
      </label>
      <label className="admin-field">
        <span>Показ</span>
        <select
          value={visibility}
          onChange={(e) => onVisibility(/** @type {'all'|'live'|'hidden'} */ (e.target.value))}
          data-testid="catalog-visibility"
        >
          <option value="all">Все</option>
          <option value="live">На витрине</option>
          <option value="hidden">Скрытые</option>
        </select>
      </label>
      <button className="admin-btn solid" type="button" onClick={onCreate} data-testid="catalog-create">
        Новый товар
      </button>
    </div>
  )
}
