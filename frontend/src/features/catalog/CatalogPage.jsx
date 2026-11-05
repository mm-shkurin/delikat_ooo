import { useRouteBodyClass } from '../../shared/ui/useRouteBodyClass'
import { StoreOverlays } from '../../shared/storeChrome/StoreOverlays'
import { useStoreChromeContext } from '../../shared/storeChrome/StoreChromeProvider'
import '../../styles/catalog.css'
import { CatalogNav } from './components/CatalogNav'
import { ProductGrid } from './components/ProductGrid'
import { ProductPanel } from './components/ProductPanel'
import { useCatalogPage } from './useCatalogPage'

const PROPERTY_OPTIONS = [
  { value: 'chilled', label: 'Охлаждённое' },
  { value: 'frozen', label: 'Замороженное' },
  { value: 'fresh', label: 'Свежее' },
  { value: 'premium', label: 'Премиум' },
]

export function CatalogPage() {
  useRouteBodyClass('route-catalog')
  const chrome = useStoreChromeContext()
  const page = useCatalogPage()
  const openAuth = () => chrome.openLayer('auth')

  const openProduct = (id) => {
    chrome.openProduct(id)
    page.loadProduct(id)
  }

  const toggleProperty = (value) => {
    page.setFilters((prev) => {
      const set = new Set(prev.properties)
      if (set.has(value)) set.delete(value)
      else set.add(value)
      return { ...prev, properties: [...set] }
    })
  }

  return (
    <>
      <CatalogNav chrome={chrome} onOpenAuth={openAuth} />
      <main className="page wrap" data-testid="catalog-page">
        <h1 className="page-title">Мясной каталог</h1>
        {page.status === 'error' ? (
          <p role="alert">
            Каталог сейчас недоступен.{' '}
            <button className="btn" type="button" onClick={page.retryLoad}>
              Повторить
            </button>
          </p>
        ) : null}
        <div className="layout">
          <aside className="filters" aria-label="Фильтры">
            <h2>Фильтры</h2>
            <div className="filter-block">
              <div className="cats" role="group" aria-label="Категории">
                {page.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    data-cat={cat.id}
                    aria-pressed={page.filters.categoryId === cat.id}
                    onClick={() => page.setFilters((f) => ({ ...f, categoryId: cat.id }))}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-block">
              <h3>Фильтр по цене</h3>
              <div className="price-row">
                <span id="price-min-label">0 ₽</span>
                <span id="price-max-label">{chrome.rub(page.filters.maxPriceRub)}</span>
              </div>
              <label className="visually-hidden" htmlFor="price-max">
                Максимальная цена
              </label>
              <input
                className="range"
                id="price-max"
                type="range"
                min={500}
                max={7000}
                step={50}
                value={page.filters.maxPriceRub}
                onChange={(e) =>
                  page.setFilters((f) => ({ ...f, maxPriceRub: Number(e.target.value) }))
                }
              />
            </div>
            <div className="filter-block">
              <h3>Фильтры по свойствам</h3>
              <div className="checks" id="props">
                {PROPERTY_OPTIONS.map((opt) => (
                  <label key={opt.value}>
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={page.filters.properties.includes(opt.value)}
                      onChange={() => toggleProperty(opt.value)}
                    />{' '}
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section aria-label="Товары">
            <div className="toolbar">
              <div className="sort">
                <strong>Сортировка:</strong>
                {[
                  ['pop', 'По популярности'],
                  ['price', 'По цене'],
                  ['sale', 'Сначала со скидкой'],
                ].map(([sort, label]) => (
                  <button
                    key={sort}
                    type="button"
                    data-sort={sort}
                    aria-pressed={page.filters.sort === sort}
                    onClick={() => page.setFilters((f) => ({ ...f, sort }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="shown" id="shown">
                {page.status === 'loading' ? 'Загрузка…' : page.shownLabel}
              </div>
            </div>
            <ProductGrid
              products={page.products}
              busy={page.status === 'loading'}
              chrome={chrome}
              onOpen={openProduct}
              onQuickAdd={(p) =>
                chrome.requestAddToCart({
                  productId: p.id,
                  name: p.name,
                  price: p.price,
                  weightLabel: p.weightLabel,
                  qty: 1,
                })
              }
            />
            {page.canLoadMore ? (
              <p style={{ marginTop: 16 }}>
                <button
                  className="btn btn-accent"
                  type="button"
                  disabled={page.loadingMore}
                  onClick={page.loadMore}
                >
                  {page.loadingMore ? 'Загрузка…' : 'Показать ещё'}
                </button>
                {page.loadMoreError ? <span role="alert"> {page.loadMoreError}</span> : null}
              </p>
            ) : null}
          </section>
        </div>
      </main>

      <StoreOverlays
        chrome={chrome}
        catalogMode
        productPanel={
          chrome.layer === 'product' ? (
            <ProductPanel
              detail={page.productDetail}
              loading={page.productLoading}
              failed={page.productFailed}
              chrome={chrome}
              onClose={chrome.closeLayers}
            />
          ) : null
        }
      />
    </>
  )
}
