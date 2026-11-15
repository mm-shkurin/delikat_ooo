import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useProductDetail } from './useProductDetail'
import { useCatalogFeed } from './useCatalogFeed'

const DEFAULT_FILTERS = {
  categoryId: 'all',
  sort: /** @type {'pop' | 'price' | 'sale'} */ ('pop'),
  maxPriceRub: 7000,
  properties: ['chilled', 'fresh'],
}

/**
 * @param {{
 *   onOpenProduct?: (id: string) => void,
 *   onCloseProduct?: () => void,
 *   layer?: string | null,
 *   requestAddToCart?: (item: {
 *     productId: string,
 *     name: string,
 *     price: number,
 *     weightLabel: string,
 *     qty: number,
 *   }) => void,
 * }} [actions]
 */
export function useCatalogPage({ onOpenProduct, onCloseProduct, requestAddToCart, layer = null } = {}) {
  const location = useLocation()
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    sort: location.hash === '#sale' ? 'sale' : DEFAULT_FILTERS.sort,
  }))
  const feed = useCatalogFeed(filters, setFilters)
  const detail = useProductDetail({ onOpenProduct, onCloseProduct, layer })

  useEffect(() => {
    if (location.hash === '#sale') {
      setFilters((prev) => (prev.sort === 'sale' ? prev : { ...prev, sort: 'sale' }))
    }
  }, [location.hash])

  const quickAdd = (product) => {
    requestAddToCart?.({
      productId: product.id,
      name: product.name,
      price: product.price,
      weightLabel: product.weightLabel,
      qty: 1,
    })
  }

  return {
    filters,
    setFilters,
    ...feed,
    quickAdd,
    openProduct: detail.openProduct,
    closeProduct: detail.closeProduct,
    productDetail: detail.productDetail,
    productLoading: detail.productLoading,
    productFailed: detail.productFailed,
    productNotFound: detail.productNotFound,
  }
}
