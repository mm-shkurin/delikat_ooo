import { safeImageUrl } from '../../../shared/ui/safeImageUrl'

/**
 * @param {{
 *   products: Array<import('../logic/productView').productSummaryToView extends (...args: any) => infer R ? R : never>,
 *   busy: boolean,
 *   failed?: boolean,
 *   onOpen: (id: string) => void,
 *   onQuickAdd: (product: { id: string, name: string, price: number, weightLabel: string }) => void,
 *   chrome: { rub: (n: number) => string },
 * }} props
 */
export function ProductGrid({ products, busy, failed = false, onOpen, onQuickAdd, chrome }) {
  if (!busy && products.length === 0) {
    return (
      <div className="grid" id="grid" data-testid="product-grid" aria-busy="false">
        <p className="empty">
          {failed ? 'Каталог недоступен. Нажмите «Повторить» выше.' : 'Ничего не нашлось. Снимите часть фильтров.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid" id="grid" data-testid="product-grid" aria-busy={busy ? 'true' : 'false'}>
      {products.map((p) => {
        const imageSrc = safeImageUrl(p.imageUrl)
        return (
          <article key={p.id} className="card">
            <button type="button" className="card-open" onClick={() => onOpen(p.id)}>
              <div className="plate">
                {imageSrc ? <img src={imageSrc} alt="" loading="lazy" /> : null}
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
              </div>
            </button>
            <button type="button" className="add" onClick={() => onQuickAdd(p)}>
              + В корзину
            </button>
          </article>
        )
      })}
    </div>
  )
}
