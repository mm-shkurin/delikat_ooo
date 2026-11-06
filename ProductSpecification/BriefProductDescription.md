# Деликат +

Премиальный мясной магазин в Омске.

## Референс UI

- `site/` — статический **мокап** (hero + catalog + demo cart)
- `design/tokens.json` — бренд

## Prod (строим)

- `frontend/` — React + Vite (как textery / absolute555 / adaptive-tutor)
- `backend/` — hexagonal FastAPI (как adaptive-tutor)
- Контракт: `ProductSpecification/api-specs/store_api.yaml`

## Wave 1

| Полоса | История | Результат |
|--------|---------|-----------|
| Front | 08 | Landing + Catalog в `frontend/`, API client |
| Back | 07 | Account SMS + JWT (usecase/adapters) |
| Back | 09 | Catalog GET (usecase/adapters) |

## Процесс

`/delivery-loop` → `/test-spec` → `/frontend-delivery` | `/backend-delivery` → `/refactor`
