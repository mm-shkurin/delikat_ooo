# 14 Storefront catalog sync — API Endpoints

Контракт: [`store_api.yaml`](../../api-specs/store_api.yaml)  
Новых path нет — уточнена семантика live-only для buyer catalog + cart add.  
Staff write / `hidden` в staff DTO — [`admin_api.yaml`](../../api-specs/admin_api.yaml) (**13**).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/catalog/products` | none | Только `hidden=false`; `total_count` = live после фильтров |
| GET | `/api/v1/catalog/products/{product_id}` | none | Live detail; hidden\|missing → **404** `product_not_found` |
| POST | `/api/v1/cart/items` | session / Bearer | Hidden → **404** `product_not_found` (как unknown) |

## Semantics (story 14)

| Rule | Detail |
|------|--------|
| List visibility | Items never include soft-hidden SKU |
| `total_count` | Count of live matching query (not including hidden) |
| Detail / cart | Hidden ≡ missing → `product_not_found`; **no** hide-specific error code |
| Buyer DTO | `ProductSummary` / `ProductDetail` **without** field `hidden` |
| Sort | Unchanged: `pop` \| `price_asc` \| `sale_first` |
| Cart lines pre-hide | Not auto-purged by this contract |

## Errors

```json
{ "code": "product_not_found", "message": "Товар не найден" }
```

Same body for unknown id and soft-hidden id (GET detail and POST cart/items).
