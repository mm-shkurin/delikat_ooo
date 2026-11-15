import { useCatalogPanel } from '../useCatalogPanel'
import { CatalogEditor } from './CatalogEditor'
import { CatalogSkuRow } from './CatalogSkuRow'
import { CatalogToolbar } from './CatalogToolbar'

export function CatalogPanel() {
  const page = useCatalogPanel()

  return (
    <section id="panel-catalog" role="tabpanel" aria-labelledby="tab-catalog" data-testid="panel-catalog">
      <CatalogToolbar
        q={page.q}
        visibility={page.visibility}
        onQ={page.setQ}
        onVisibility={page.setVisibility}
        onCreate={page.openCreate}
      />
      {page.actionError ? <p className="admin-error">{page.actionError}</p> : null}
      {page.status === 'loading' ? <p className="admin-lede">Загружаем каталог…</p> : null}
      {page.status === 'error' ? <p className="admin-error">{page.errorText}</p> : null}
      {page.status === 'ready' && page.products.length === 0 ? (
        <p className="admin-empty" data-testid="catalog-empty">
          Ничего не найдено
        </p>
      ) : null}
      {page.status === 'ready' && page.products.length > 0 ? (
        <ul className="admin-sku-list" data-testid="catalog-list">
          {page.products.map((product) => (
            <CatalogSkuRow
              key={product.id}
              product={product}
              onBadge={(badge) => page.setBadge(product, badge)}
              onHideToggle={() => page.setHidden(product.id, !product.hidden)}
              onEdit={() => page.openEdit(product)}
            />
          ))}
        </ul>
      ) : null}
      <CatalogEditor
        open={page.editorOpen}
        mode={page.editorMode}
        draft={page.draft}
        categories={page.categories}
        imageFile={page.imageFile}
        currentImageUrl={page.editing?.imageUrl ?? null}
        fieldErrors={page.fieldErrors}
        formError={page.actionError}
        saving={page.saving}
        onChange={page.setDraft}
        onImage={page.setImageFile}
        onClose={page.closeEditor}
        onSave={page.saveEditor}
      />
    </section>
  )
}
