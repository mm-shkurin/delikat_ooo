import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { listCategories, listProducts } from './api/catalogApi'
import { buildCatalogQuery, formatShownCount } from './logic/catalogQuery'
import { catalogCardsFromList } from './logic/productView'
import { useProductDetail } from './useProductDetail'

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
  const [categories, setCategories] = useState(/** @type {Array<{ id: string, title: string }>} */ ([]))
  const [products, setProducts] = useState(
    /** @type {ReturnType<typeof import('./logic/productView').productSummaryToView>[]} */ ([]),
  )
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState('')
  const [reloadTick, setReloadTick] = useState(0)
  const loadMoreAbort = useRef(/** @type {AbortController | null} */ (null))
  const detail = useProductDetail({ onOpenProduct, onCloseProduct, layer })

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        categoryId: filters.categoryId,
        sort: filters.sort,
        maxPriceRub: filters.maxPriceRub,
        properties: [...filters.properties].sort(),
      }),
    [filters],
  )

  useEffect(() => {
    if (location.hash === '#sale') {
      setFilters((prev) => (prev.sort === 'sale' ? prev : { ...prev, sort: 'sale' }))
    }
  }, [location.hash])

  useEffect(() => {
    const controller = new AbortController()
    loadMoreAbort.current?.abort()
    setStatus('loading')
    Promise.all([
      listCategories(controller.signal),
      listProducts(buildCatalogQuery({ ...filters, offset: 0 }), controller.signal),
    ])
      .then(([categoryPage, page]) => {
        if (controller.signal.aborted) return
        setCategories([{ id: 'all', title: 'Все' }, ...categoryPage.items.map((c) => ({ id: c.id, title: c.title }))])
        setProducts(catalogCardsFromList(page.items))
        setTotalCount(page.total_count)
        setStatus('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error')
      })
    return () => controller.abort()
  }, [queryKey, filters, reloadTick])

  const loadMore = useCallback(() => {
    if (products.length >= totalCount) return
    const nextOffset = products.length
    loadMoreAbort.current?.abort()
    const controller = new AbortController()
    loadMoreAbort.current = controller
    setLoadingMore(true)
    setLoadMoreError('')
    listProducts(buildCatalogQuery({ ...filters, offset: nextOffset }), controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return
        setProducts((prev) => [...prev, ...catalogCardsFromList(page.items)])
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setLoadMoreError('Не удалось подгрузить товары.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMore(false)
      })
  }, [filters, products.length, totalCount])

  const retryLoad = useCallback(() => setReloadTick((tick) => tick + 1), [])

  const quickAdd = useCallback(
    (product) => {
      requestAddToCart?.({
        productId: product.id,
        name: product.name,
        price: product.price,
        weightLabel: product.weightLabel,
        qty: 1,
      })
    },
    [requestAddToCart],
  )

  const shownLabel = formatShownCount(products.length)
  const canLoadMore = products.length < totalCount

  return {
    filters,
    setFilters,
    categories,
    products,
    totalCount,
    status,
    loadingMore,
    loadMoreError,
    retryLoad,
    loadMore,
    openProduct: detail.openProduct,
    closeProduct: detail.closeProduct,
    quickAdd,
    canLoadMore,
    shownLabel,
    productDetail: detail.productDetail,
    productLoading: detail.productLoading,
    productFailed: detail.productFailed,
    productNotFound: detail.productNotFound,
  }
}
