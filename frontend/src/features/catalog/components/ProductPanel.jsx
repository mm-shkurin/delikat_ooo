import { useEffect, useState } from 'react'
import { safeImageUrl } from '../../../shared/ui/safeImageUrl'

/**
 * @param {{
 *   detail: import('../logic/productView').productDetailToView extends (...args: any) => infer R ? R | null : null,
 *   loading: boolean,
 *   failed: boolean,
 *   chrome: ReturnType<import('../../../app/storeChrome/useStoreChrome').useStoreChrome>,
 *   onClose: () => void,
 * }} props
 */
export function ProductPanel({ detail, loading, failed = false, chrome, onClose }) {
  const [weight, setWeight] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!detail) return
    setWeight(detail.weightOptions[0] ?? detail.weightLabel)
    setQty(1)
  }, [detail?.id, detail])

  if (loading || !detail) {
    return (
      <div className="panel dish-panel" id="product" role="dialog" aria-modal="true" aria-labelledby="product-title">
        <button className="close" type="button" aria-label="Закрыть" onClick={onClose}>
          ×
        </button>
        <p className="muted" id="product-title" style={{ padding: 24 }}>
          {loading && !failed ? 'Загрузка карточки…' : 'Не удалось открыть карточку.'}
        </p>
      </div>
    )
  }

  const weights = Array.from(new Set([detail.weightLabel, ...detail.weightOptions]))
  const imageSrc = safeImageUrl(detail.imageUrl)

  return (
    <div className="panel dish-panel" id="product" role="dialog" aria-modal="true" aria-labelledby="product-title">
      <div className="dish-visual">
        <button className="close" type="button" aria-label="Закрыть" onClick={onClose}>
          ×
        </button>
        {imageSrc ? <img src={imageSrc} alt={detail.name} /> : null}
      </div>
      <div className="dish-sheet">
        <h2 id="product-title">{detail.name}</h2>
        <p className="price-lg">
          {detail.was ? <s>{chrome.rub(detail.was)}</s> : null}
          {chrome.rub(detail.price)}
        </p>
        <p className="dish-meta">{detail.marbleGrade ?? detail.weightLabel}</p>
        {detail.description ? <p className="muted">{detail.description}</p> : null}
        <p className="field-label">Вес</p>
        <div className="weights">
          {weights.map((w) => (
            <button key={w} type="button" aria-pressed={weight === w} onClick={() => setWeight(w)}>
              {w}
            </button>
          ))}
        </div>
        <div className="qty-row">
          <div className="stepper">
            <button type="button" aria-label="Меньше" onClick={() => setQty(Math.max(1, qty - 1))}>
              −
            </button>
            <b>{qty}</b>
            <button type="button" aria-label="Больше" onClick={() => setQty(Math.min(99, qty + 1))}>
              +
            </button>
          </div>
          <button
            className="add-cart"
            type="button"
            onClick={() =>
              chrome.requestAddToCart({
                productId: detail.id,
                name: detail.name,
                price: detail.price,
                weightLabel: weight,
                qty,
              })
            }
          >
            В корзину · {chrome.rub(detail.price * qty)}
          </button>
        </div>
      </div>
    </div>
  )
}
