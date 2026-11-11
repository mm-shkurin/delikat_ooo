# 13 Staff catalog write — API Endpoints

Контракт: [`admin_api.yaml`](../../api-specs/admin_api.yaml)  
Categories (select): публичный [`GET /api/v1/catalog/categories`](../../api-specs/store_api.yaml) из **09** — без staff-дубля.  
Buyer catalog GET — без изменений (**14**).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/staff/catalog/products` | owner, manager | Staff-список (видит `hidden`); sort SALE→NEW→TOP→null |
| POST | `/api/v1/staff/catalog/products` | owner, manager | Create SKU + обязательный upload (`multipart`) |
| PATCH | `/api/v1/staff/catalog/products/{product_id}` | owner, manager | Patch полей (badge, hide, цены…); `id` immutable |
| PUT | `/api/v1/staff/catalog/products/{product_id}/image` | owner, manager | Replace image (`multipart`) |
| GET | `/api/v1/media/products/{product_id}` | **none** | Bytes + Content-Type из Postgres (`image_url`) |

Cashier / не staff → **403** на staff catalog write/list. Media GET — anonymous.

## Query (list)

| Param | Rule |
|-------|------|
| `q` | optional; substring match `name` **или** `id` |
| `visibility` | `live` \| `hidden` \| `all`; default **`all`** |

Sort (сервер, стабильный): badge rank SALE=0, NEW=1, TOP=2, null=3; then `created_at` desc; then `id` asc.

## Create / patch fields

Как store `ProductSummary` + `description` + `hidden` + `created_at` (read-only).  
SALE → `compare_at_price_rub` required и `> price_rub`.  
`%` скидки считает клиент: `round((compare_at − price) / compare_at × 100)`.

## Image

- Create: part `image` обязателен (jpeg/png/webp, ≤ 2 MiB).
- Edit: keep `image_url` или `PUT .../image`.
- Канонический `image_url`: `/api/v1/media/products/{product_id}` после upload в Postgres.
- Seed без blob может ещё держать `/assets/...` до миграции; media GET → 404 если blob нет.

## Errors

`unauthorized` · `forbidden` · `validation_error` · `product_not_found` · `product_id_taken` · `category_not_found`
