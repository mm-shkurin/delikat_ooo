# React: лендинг и каталог по Store API

**Статус:** закрыто (Wave 1 catalog/landing + Wave 2 wire через Vite proxy). Корзина/заказы — [story 10](../10-cart-orders-api/).

## Brief Description

Покупатель открывает **prod-приложение** `frontend/`: лендинг и каталог как `site/`, но на React + API client по `store_api.yaml`. `site/` остаётся референсом.

## Flow

1. `npm run dev` → landing route, catalog route.
2. Catalog загружает categories/products через `catalogApi`.
3. Filters/sort → query params; «Показать ещё» → offset append.
4. Product panel → `getProduct(id)`.
5. Fulfillment delivery/pickup + address chip — shared module (landing + catalog).
6. Cart/auth overlays — server API (story 10); каталог/лендинг остаются в scope 08.

## Acceptance Criteria

- Проект `frontend/` с Vite+React+router (структура как adaptive-tutor: `src/features/*`, `src/shared/api`).
- `catalogApi.js` (+ `paths.js`) по YAML; wire fields snake_case; один mapper/view layer на feature.
- Vitest: mapper/filter query builder tests минимум.
- Визуальная паритетность с `site/` (hero, packaging, catalog grid) — desktop + mobile.
- **Не** добавлять fetch catalog в `site/js`.
- Mock: MSW handlers from OpenAPI или отдельный mock server до 09 live.

## Validation Rules

| State | Rule |
|-------|------|
| API base | `import.meta.env.VITE_API_BASE` |
| Page size | 16, load more |

## Core Requirements

- Tokens из `design/tokens.json` → `frontend/src/styles/tokens.css`.
- Credentials include on API calls.
- Коммиты frontend полосы: `frontend/ ProductSpecification` only.
