import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProduct } from './api/catalogApi'
import { isProductNotFoundError, productIdFromSearch, searchWithProduct } from './logic/storefront'
import { productDetailToView } from './logic/productView'

/**
 * Buyer product panel. The open / deep-link / refresh GET lives in the search
 * effect so a cancelled run always starts the next one. An already open panel
 * stays stale until that search changes.
 * @param {{
 *   onOpenProduct?: () => void,
 *   onCloseProduct?: () => void,
 *   layer?: string | null,
 * }} actions
 */
export function useProductDetail({ onOpenProduct, onCloseProduct, layer = null } = {}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [productDetail, setProductDetail] = useState(
    /** @type {ReturnType<typeof productDetailToView> | null} */ (null),
  )
  const [productLoading, setProductLoading] = useState(false)
  const [productFailed, setProductFailed] = useState(false)
  const [productNotFound, setProductNotFound] = useState(false)
  const hadProduct = useRef(false)
  const layerRef = useRef(layer)

  const clearPanel = useCallback(() => {
    setProductDetail(null)
    setProductLoading(false)
    setProductFailed(false)
    setProductNotFound(false)
  }, [])

  const writeProductSearch = useCallback(
    (productId, replace) => {
      const next = searchWithProduct(location.search, productId)
      if (next === location.search) return
      navigate(
        { pathname: location.pathname, search: next, hash: location.hash },
        { replace },
      )
    },
    [location.hash, location.pathname, location.search, navigate],
  )

  const openProduct = useCallback(
    (id) => {
      onOpenProduct?.()
      setProductLoading(true)
      setProductFailed(false)
      setProductNotFound(false)
      setProductDetail(null)
      writeProductSearch(id, false)
    },
    [onOpenProduct, writeProductSearch],
  )

  useEffect(() => {
    const previous = layerRef.current
    layerRef.current = layer
    if (previous !== 'product' || layer === 'product') return
    hadProduct.current = false
    writeProductSearch(null, true)
  }, [layer, writeProductSearch])

  const closeProduct = useCallback(() => {
    hadProduct.current = false
    clearPanel()
    onCloseProduct?.()
    writeProductSearch(null, true)
  }, [clearPanel, onCloseProduct, writeProductSearch])

  useEffect(() => {
    const id = productIdFromSearch(location.search)
    if (!id) {
      if (!hadProduct.current) return undefined
      hadProduct.current = false
      clearPanel()
      onCloseProduct?.()
      return undefined
    }
    hadProduct.current = true
    onOpenProduct?.()
    const controller = new AbortController()
    setProductLoading(true)
    setProductFailed(false)
    setProductNotFound(false)
    setProductDetail(null)
    getProduct(id, controller.signal)
      .then((body) => {
        if (controller.signal.aborted) return
        setProductDetail(productDetailToView(body))
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === 'AbortError') return
        const notFound = isProductNotFoundError(error)
        setProductNotFound(notFound)
        setProductFailed(!notFound)
      })
      .finally(() => {
        if (!controller.signal.aborted) setProductLoading(false)
      })
    return () => controller.abort()
  }, [clearPanel, location.search, onCloseProduct, onOpenProduct])

  return {
    productDetail,
    productLoading,
    productFailed,
    productNotFound,
    openProduct,
    closeProduct,
  }
}
