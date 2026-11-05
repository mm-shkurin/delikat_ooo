import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getProduct, listCategories, listProducts } from './api/catalogApi'
import { buildCatalogQuery, formatShownCount, PAGE_SIZE } from './logic/catalogQuery'
import { productDetailToView, productSummaryToView } from './logic/productView'

const DEFAULT_FILTERS = {
  categoryId: 'all',
  sort: /** @type {'pop' | 'price' | 'sale'} */ ('pop'),
  maxPriceRub: 7000,
  properties: ['chilled', 'fresh'],
}

export function useCatalogPage() {
  const location = useLocation()
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    sort: location.hash === '#sale' ? 'sale' : DEFAULT_FILTERS.sort,
  }))
  const [categories, setCategories] = useState(/** @type {Array<{ id: string, title: string }>} */ ([]))
  const [products, setProducts] = useState(/** @type {ReturnType<typeof productSummaryToView>[]} */ ([]))
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [loadingMore, setLoadingMore] = useState(false)
  const [productDetail, setProductDetail] = useState(
    /** @type {ReturnType<typeof productDetailToView> | null} */ (null),
  )
  const [productLoading, setProductLoading] = useState(false)
  const [productFailed, setProductFailed] = useState(false)
  const loadMoreAbort = useRef(/** @type {AbortController | null} */ (null))

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
        setProducts(page.items.map(productSummaryToView))
        setTotalCount(page.total_count)
        setStatus('ready')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error')
      })
    return () => controller.abort()
  }, [queryKey, filters])

  const loadMore = useCallback(() => {
    if (products.length >= totalCount) return
    const nextOffset = products.length
    loadMoreAbort.current?.abort()
    const controller = new AbortController()
    loadMoreAbort.current = controller
    setLoadingMore(true)
    listProducts(buildCatalogQuery({ ...filters, offset: nextOffset }), controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return
        setProducts((prev) => [...prev, ...page.items.map(productSummaryToView)])
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setStatus('error')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMore(false)
      })
  }, [filters, products.length, totalCount])

  const loadProduct = useCallback((productId) => {
    setProductLoading(true)
    setProductFailed(false)
    setProductDetail(null)
    const controller = new AbortController()
    getProduct(productId, controller.signal)
      .then((body) => {
        if (controller.signal.aborted) return
        setProductDetail(productDetailToView(body))
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        setProductDetail(null)
        setProductFailed(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductLoading(false)
      })
    return () => controller.abort()
  }, [])

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
    loadMore,
    canLoadMore,
    shownLabel,
    loadProduct,
    productDetail,
    productLoading,
    productFailed,
  }
}
