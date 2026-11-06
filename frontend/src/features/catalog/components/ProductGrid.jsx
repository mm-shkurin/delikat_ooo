import { memo } from 'react'
import { safeImageUrl } from '../../../shared/ui/safeImageUrl'

/**
 * @param {{
 *   product: {
 *     id: string,
 *     name: string,
 *     imageUrl?: string | null,
 *     badge?: string | null,
 *     marbleGrade?: string | null,
 *     weightLabel: string,
 *     was?: number | null,
 *     price: number,
 *   },
 *   onOpen: (id: string) => void,
 *   onQuickAdd: (product: { id: string, name: string, price: number, weightLabel: string }) => void,
 *   rub: (n: number) => string,
 * }} props
 */
const ProductCard = memo(function ProductCard({ product, onOpen, onQuickAdd, rub }) {
  const imageSrc = safeImageUrl(product.imageUrl)
  return (
    <article className="card">
      <button type="button" className="card-open" onClick={() => onOpen(product.id)}>
        <div className="plate">
          {imageSrc ? <img src={imageSrc} alt="" loading="lazy" /> : null}
          {product.badge ? <span className={`badge${product.badge === 'TOP' ? ' top' : ''}`}>{product.badge}</span> : null}
          {product.marbleGrade ? <span className="marble">{product.marbleGrade}</span> : null}
        </div>
        <div className="card-body">
          <h3>{product.name}</h3>
          <div className="meta-row">
            <span className="weight">{product.weightLabel}</span>
            <div className="price">
              {product.was ? <s>{rub(product.was)}</s> : null}
              {rub(product.price)}
            </div>
          </div>
        </div>
      </button>
      <button type="button" className="add" onClick={() => onQuickAdd(product)}>
        + В корзину
      </button>
    </article>
  )
})

/**
 * @param {{
 *   products: Array<{ id: string, name: string, price: number, weightLabel: string }>,
 *   busy: boolean,
 *   failed?: boolean,
 *   onOpen: (id: string) => void,
 *   onQuickAdd: (product: { id: string, name: string, price: number, weightLabel: string }) => void,
 *   rub: (n: number) => string,
 * }} props
 */
export const ProductGrid = memo(function ProductGrid({ products, busy, failed = false, onOpen, onQuickAdd, rub }) {
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
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onOpen={onOpen} onQuickAdd={onQuickAdd} rub={rub} />
      ))}
    </div>
  )
})
