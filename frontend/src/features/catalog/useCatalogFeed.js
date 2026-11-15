import { useCallback, useEffect, useRef, useState } from 'react'
import { httpErrorIn } from '../../shared/api/httpResponse'
import { listCategories, listProducts } from './api/catalogApi'
import { buildCatalogQuery, formatShownCount } from './logic/catalogQuery'
import { refreshProductLimit, selectedCategoryMissing } from './logic/catalogRefresh'
import { catalogCardsFromList } from './logic/productView'
import { useCatalogLive } from './useCatalogLive'

/**
 * @param {{
 *   categoryId: string
 *   sort: 'pop' | 'price' | 'sale'
 *   maxPriceRub: number
 *   properties: string[]
 * }} filters
 * @param {(next: typeof filters | ((prev: typeof filters) => typeof filters)) => void} setFilters
 */
export function useCatalogFeed(filters, setFilters) {
  const [categories, setCategories] = useState(/** @type {Array<{ id: string, title: string }>} */ ([]))
  const [products, setProducts] = useState(/** @type {ReturnType<typeof catalogCardsFromList>} */ ([]))
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState('')
  const [reloadTick, setReloadTick] = useState(0)
  const loadMoreAbort = useRef(/** @type {AbortController | null} */ (null))
  const flightAbort = useRef(/** @type {AbortController | null} */ (null))
  const run = useRef(0)
  const skip = useRef(false)
  const filtersRef = useRef(filters)
  const productsRef = useRef(products)
  filtersRef.current = filters
  productsRef.current = products

  const queryKey = JSON.stringify({
    categoryId: filters.categoryId,
    sort: filters.sort,
    maxPriceRub: filters.maxPriceRub,
    properties: [...filters.properties].sort(),
  })

  useEffect(() => {
    if (skip.current) {
      skip.current = false
      return undefined
    }
    const flight = startFlight(run, flightAbort, loadMoreAbort)
    setStatus('loading')
    Promise.all([
      listCategories(flight.signal),
      listProducts(buildCatalogQuery({ ...filters, offset: 0 }), flight.signal),
    ])
      .then(([categoryPage, page]) => {
        if (!flight.alive()) return
        applyPage(setCategories, setProducts, setTotalCount, setStatus, categoryPage, page)
      })
      .catch((error) => {
        if (!flight.alive() || isAbort(error)) return
        setStatus('error')
      })
    return () => flight.controller.abort()
  }, [queryKey, filters, reloadTick])

  const refreshFromSignal = useCallback(() => {
    const flight = startFlight(run, flightAbort, loadMoreAbort)
    const current = filtersRef.current
    listCategories(flight.signal)
      .then(async (categoryPage) => {
        if (!flight.alive()) return null
        const items = categoryPage.items ?? []
        let next = current
        if (selectedCategoryMissing(items, current.categoryId)) {
          next = { ...current, categoryId: 'all' }
          skip.current = true
          setFilters(next)
        }
        const page = await loadChangedProducts(next, productsRef.current.length, flight, setFilters, skip)
        return { items, page }
      })
      .then((loaded) => {
        if (!loaded || !flight.alive()) return
        applyPage(setCategories, setProducts, setTotalCount, setStatus, { items: loaded.items }, loaded.page)
      })
      .catch((error) => {
        if (!flight.alive() || isAbort(error)) return
        setStatus('error')
      })
  }, [setFilters])

  useCatalogLive(refreshFromSignal)

  useEffect(() => () => flightAbort.current?.abort(), [])

  const loadMore = useCallback(() => {
    if (products.length >= totalCount) return
    loadMoreAbort.current?.abort()
    const controller = new AbortController()
    loadMoreAbort.current = controller
    setLoadingMore(true)
    setLoadMoreError('')
    listProducts(buildCatalogQuery({ ...filters, offset: products.length }), controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return
        setProducts((prev) => [...prev, ...catalogCardsFromList(page.items)])
      })
      .catch((error) => {
        if (controller.signal.aborted || isAbort(error)) return
        setLoadMoreError('Не удалось подгрузить товары.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMore(false)
      })
  }, [filters, products.length, totalCount])

  return {
    categories,
    products,
    totalCount,
    status,
    loadingMore,
    loadMoreError,
    retryLoad: () => setReloadTick((tick) => tick + 1),
    loadMore,
    canLoadMore: products.length < totalCount,
    shownLabel: formatShownCount(products.length),
  }
}

function startFlight(run, flightAbort, loadMoreAbort) {
  const id = ++run.current
  flightAbort.current?.abort()
  loadMoreAbort.current?.abort()
  const controller = new AbortController()
  flightAbort.current = controller
  return {
    controller,
    signal: controller.signal,
    alive: () => id === run.current && !controller.signal.aborted,
  }
}

async function loadChangedProducts(next, shown, flight, setFilters, skip) {
  const limit = refreshProductLimit(shown)
  try {
    return await listProducts(buildCatalogQuery({ ...next, offset: 0, limit }), flight.signal)
  } catch (error) {
    if (!isCategoryRejected(error) || next.categoryId === 'all') throw error
    const cleared = { ...next, categoryId: 'all' }
    skip.current = true
    setFilters(cleared)
    return listProducts(buildCatalogQuery({ ...cleared, offset: 0, limit }), flight.signal)
  }
}

function applyPage(setCategories, setProducts, setTotalCount, setStatus, categoryPage, page) {
  const items = categoryPage.items ?? []
  setCategories([{ id: 'all', title: 'Все' }, ...items.map((row) => ({ id: row.id, title: row.title }))])
  setProducts(catalogCardsFromList(page.items))
  setTotalCount(page.total_count)
  setStatus('ready')
}

function isAbort(error) {
  return error?.name === 'AbortError' || error?.cause?.name === 'AbortError'
}

function isCategoryRejected(error) {
  return httpErrorIn(error)?.status === 400
}
