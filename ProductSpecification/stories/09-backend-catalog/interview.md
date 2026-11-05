# Interview — 09 Бэкенд: каталог и фильтры

**Статус:** закрыто для story-spec.  
**Волна:** Wave 1 backend (после или вместе с каркасом **07**).

## Scope

**IN:**

- Seed data: 16 products, categories matching mock (`beef`, `pork`, `poultry`, `marble`, `semi`, `sauce`)
- Handlers:
  - `GET /api/v1/catalog/categories`
  - `GET /api/v1/catalog/products`
  - `GET /api/v1/catalog/products/{product_id}`
- Filter/sort semantics aligned with **02** interview + OpenAPI
- Response fields for grid: name, price_rub, compare_at_price_rub, popularity_score, badge, marble_label, image_url, weight_label, properties[]

**OUT:** cart, auth business logic (auth middleware may exist from 07)

## Key Decisions

- `DECISION:` read-only catalog — no admin write API v1
- `DECISION:` storage — DB table or JSON seed file loaded at startup — **рекомендация:** SQL seed migration same DB as 07
- `DECISION:` `product_id` path = slug (`rib`, …)
- `DECISION:` property filter OR semantics like mock (product has any requested property)
- `DECISION:` sort `pop` maps to `popularity_score` desc
- `DECISION:` public endpoints — no Bearer required

## Behavior & Rules

- Unknown product_id → 404 with error body
- max_price_rub вне 500–7000 → HTTP 400 (YAML min/max), без silent clamp
- pagination: default limit 16

## Already Implemented (REUSE)

- OpenAPI schemas; slug list in api-specs/README

## NOT Yet Implemented (Gaps)

- Handlers + seed + tests

## Out of Scope

- Cart, orders, inventory sync

## Check Notes

- pytest: filter category beef + chilled → count matches fixture
- sale_first ordering

## Integrations

- Same app instance as 07
