import { safeImageUrl } from '../../../shared/ui/safeImageUrl'
import { formatRub } from '../logic/staffCatalogView'

/**
 * @param {{
 *   product: {
 *     id: string
 *     name: string
 *     categoryTitle: string
 *     weightLabel: string
 *     price: number
 *     was: number | null
 *     discountPercent: number | null
 *     badge: string | null
 *     imageUrl: string
 *     hidden: boolean
 *   }
 *   onBadge: (badge: 'NEW' | 'SALE' | 'TOP') => void
 *   onHideToggle: () => void
 *   onEdit: () => void
 * }} props
 */
export function CatalogSkuRow({ product, onBadge, onHideToggle, onEdit }) {
  const src = safeImageUrl(product.imageUrl)
  const badgeClass =
    product.badge === 'SALE' ? ' sale' : product.badge === 'NEW' ? ' new' : product.badge === 'TOP' ? ' top' : ''

  return (
    <li
      className={`admin-sku${product.hidden ? ' is-hidden' : ''}`}
      data-testid="catalog-sku-row"
      data-product-id={product.id}
    >
      {src ? <img src={src} alt="" /> : <div className="admin-sku-ph" aria-hidden="true" />}
      <div className="admin-sku-title">
        <h3>{product.name}</h3>
        <div className="admin-meta">
          {product.id} · {product.categoryTitle} · {product.weightLabel}
        </div>
      </div>
      <div className="admin-sku-price" data-testid="catalog-sku-price">
        <span>{formatRub(product.price)}</span>
        {product.was != null ? (
          <span className="admin-sku-was" data-testid="catalog-sku-was">
            {formatRub(product.was)}
          </span>
        ) : null}
        {product.discountPercent != null ? (
          <span className="admin-sku-discount" data-testid="catalog-sku-discount">
            −{product.discountPercent}%
          </span>
        ) : null}
      </div>
      <div className="admin-sku-pills">
        {product.badge ? <span className={`admin-pill${badgeClass}`}>{product.badge}</span> : null}
        {product.hidden ? <span className="admin-pill off">скрыт</span> : null}
      </div>
      <div className="admin-row-actions">
        <BadgeBtn label="NEW" on={product.badge === 'NEW'} onClick={() => onBadge('NEW')} />
        <BadgeBtn label="SALE" on={product.badge === 'SALE'} kind="sale" onClick={() => onBadge('SALE')} />
        <BadgeBtn label="TOP" on={product.badge === 'TOP'} kind="top" onClick={() => onBadge('TOP')} />
        <button className="admin-btn ghost" type="button" onClick={onHideToggle} data-testid="catalog-hide">
          {product.hidden ? 'Вернуть' : 'Скрыть'}
        </button>
        <button className="admin-btn ghost" type="button" onClick={onEdit} data-testid="catalog-edit">
          Править
        </button>
      </div>
    </li>
  )
}

function BadgeBtn({ label, on, kind = 'new', onClick }) {
  return (
    <button
      type="button"
      className={`admin-btn admin-badge-btn is-${kind}${on ? ' is-on' : ''}`}
      aria-pressed={on}
      title={on ? `Снять плашку ${label}` : `Пометить ${label}`}
      onClick={onClick}
      data-testid={`catalog-badge-${label}`}
    >
      {label}
    </button>
  )
}
