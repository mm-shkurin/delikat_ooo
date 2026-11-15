/**
 * @param {{
 *   row: { id: string, title: string, sortOrder: number, productCount: number }
 *   index: number
 *   total: number
 *   drag: boolean
 *   onEdit: () => void
 *   onDelete: () => void
 *   onMove: (direction: 'up' | 'down') => void
 *   onDragStart: () => void
 *   onDrop: () => void
 * }} props
 */
export function CategoryRow({ row, index, total, drag, onEdit, onDelete, onMove, onDragStart, onDrop }) {
  return (
    <li
      className="admin-cat"
      data-testid={`category-row-${row.id}`}
      draggable={drag}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        if (drag) event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop()
      }}
    >
      <div>
        <strong>{row.title}</strong>
        <span className="admin-meta">
          {row.id} · порядок {row.sortOrder} · {row.productCount}
        </span>
      </div>
      <div className="admin-row-actions">
        <button type="button" className="admin-btn ghost" disabled={index === 0} onClick={() => onMove('up')}>
          Выше
        </button>
        <button
          type="button"
          className="admin-btn ghost"
          disabled={index === total - 1}
          onClick={() => onMove('down')}
        >
          Ниже
        </button>
        {drag ? (
          <span className="admin-meta" data-testid={`category-drag-${row.id}`}>
            Перетащить
          </span>
        ) : null}
        <button type="button" className="admin-btn ghost" onClick={onEdit}>
          Изменить
        </button>
        <button type="button" className="admin-btn ghost" onClick={onDelete} data-testid={`category-delete-${row.id}`}>
          Удалить
        </button>
      </div>
    </li>
  )
}
