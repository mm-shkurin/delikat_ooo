# 09 Backend Catalog — API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/catalog/categories | Категории для фильтра (кнопка «Все» — на клиенте) |
| GET | /api/v1/catalog/products | Список с `category_id`, `max_price_rub`, `property`, `sort`, `limit`, `offset` |
| GET | /api/v1/catalog/products/{product_id} | Деталь карточки (`weight_options`, `description`) |

## Notes

- Публично, без cookie и Bearer.
- Default `limit=16`, «Показать ещё» — `offset += limit`.
- Полная схема: `ProductSpecification/api-specs/store_api.yaml`, примеры JSON: `api-specs/json-contracts.md` §2.
