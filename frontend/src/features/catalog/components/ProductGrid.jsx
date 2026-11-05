/**
 * @param {{
 *   products: Array<import('../logic/productView').productSummaryToView extends (...args: any) => infer R ? R : never>,
 *   busy: boolean,
 *   onOpen: (id: string) => void,
 *   onQuickAdd: (product: { id: string, name: string, price: number, weightLabel: string }) => void,
 *   chrome: { rub: (n: number) => string },
 * }} props
 */
export function ProductGrid({ products, busy, onOpen, onQuickAdd, chrome }) {
  if (!busy && products.length === 0) {
    return (
      <div className="grid" id="grid" data-testid="product-grid" aria-busy="false">
        <p className="empty">Ничего не нашлось. Снимите часть фильтров.</p>
      </div>
    )
  }

  return (
    <div className="grid" id="grid" data-testid="product-grid" aria-busy={busy ? 'true' : 'false'}>
      {products.map((p) => (
        <button key={p.id} type="button" className="card" onClick={() => onOpen(p.id)}>
          <div className="plate">
            <img src={p.imageUrl} alt="" loading="lazy" />
            {p.badge ? <span className={`badge${p.badge === 'TOP' ? ' top' : ''}`}>{p.badge}</span> : null}
            {p.marbleGrade ? <span className="marble">{p.marbleGrade}</span> : null}
          </div>
          <div className="card-body">
            <h3>{p.name}</h3>
            <div className="meta-row">
              <span className="weight">{p.weightLabel}</span>
              <div className="price">
                {p.was ? <s>{chrome.rub(p.was)}</s> : null}
                {chrome.rub(p.price)}
              </div>
            </div>
            <span
              className="add"
              role="presentation"
              onClick={(event) => {
                event.stopPropagation()
                onQuickAdd(p)
              }}
              onKeyDown={() => {}}
            >
              + В корзину
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
