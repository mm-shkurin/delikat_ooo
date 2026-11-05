# Бэкенд: каталог и фильтры (hexagonal)

## Brief Description

Read-only каталог через usecase layer + DB adapter; HTTP тонкий; seed 16 SKU как в мокапе `site/`.

## Flow

1. Domain entities Product, Category (или value objects).
2. Usecases: `list_categories`, `list_products` (filters/sort/pagination), `get_product`.
3. DB adapter: repositories + Alembic seed.
4. HTTP adapter: GET `/api/v1/catalog/*`.

## Acceptance Criteria

- **Read-only** каталог v1; без admin write API.
- Seed: **16** SKU; категории = enum `category_id` в `store_api.yaml` (`beef`, `pork`, `poultry`, `marble`, `semi`, `sauce`; slugs = `api-specs/README.md`).
- Ответы списка/карточки — поля `ProductSummary` / `ProductDetail` из OpenAPI (`weight_options`, `description` на detail).
- `product_id` = slug; 404 → `product_not_found`.
- Фильтры (как mock 02 + OpenAPI):
  - `category_id` — одна категория или omit;
  - `property` — **OR** по переданным значениям; omit/пустой — без фильтра по свойствам;
  - `max_price_rub` вне **500–7000** → `validation_error` (HTTP **400**), без silent clamp;
  - `sort=pop` → `popularity_score` desc; `sort=price_asc` → `price_rub` asc; `sort=sale_first` → сначала строки с `compare_at_price_rub`, затем по `price_rub`;
  - pagination: default `limit=16`.
- Невалидные `category_id`, `property`, `sort`, `limit`, `offset` → HTTP **400** `validation_error`.
- **Blocking pytest:** весь `usecase/tests/catalog/` green (в т.ч. `beef`+`chilled`, `sale_first`, `price_asc`, invalid query).
- **Check Note (seed):** на данных из `api-specs/examples/` фильтр `beef`+`chilled` → **6** SKU (сверка при HTTP/seed acceptance, не обязателен в unit fakes).
- HTTP integration tests — опционально; DoD story = usecase pytest выше.
- Публичные endpoints без Bearer.

## Core Requirements

- Без catalog logic в HTTP handlers (handlers вызывают usecase).
- Seed slugs = `api-specs/README.md`.
- Same app wiring as 07 in `application/main.py`.
